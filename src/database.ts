import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { fetchShareCacheAcrossWorktrees } from "./config";
import { gitService } from "./gitService";
import { logger } from "./logger";
import { QuickPickItem } from "./types";

let db: any;
let dbPath: string;
let sqlJs: any;
let persistTimer: NodeJS.Timeout | undefined;
let extensionContext: vscode.ExtensionContext | undefined;
let seededFromTemplate: boolean = false;

const SEARCH_LIMIT = 500;

export async function initDatabase(
  context: vscode.ExtensionContext
): Promise<void> {
  const initSqlJs = require("sql.js");

  let locateFileOpt: any = undefined;
  if (context && context.extensionPath) {
    const candidates = [
      path.join(
        context.extensionPath,
        "node_modules",
        "sql.js",
        "dist",
        "sql-wasm.wasm"
      ),
      path.join(
        __dirname,
        "..",
        "node_modules",
        "sql.js",
        "dist",
        "sql-wasm.wasm"
      ),
      path.join(__dirname, "node_modules", "sql.js", "dist", "sql-wasm.wasm"),
    ];
    const wasmPath = candidates.find((p) => fs.existsSync(p));
    if (wasmPath) {
      locateFileOpt = (file: string) => {
        if (file.endsWith(".wasm")) {
          return wasmPath;
        }
        return file;
      };
    }
  }

  sqlJs = await initSqlJs(
    locateFileOpt ? { locateFile: locateFileOpt } : undefined
  );

  extensionContext = context;
  const storageUri = (context && (context.storageUri || context.globalStorageUri)) || undefined;
  if (storageUri && storageUri.fsPath) {
    const storagePath = storageUri.fsPath;
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    dbPath = path.join(storagePath, "search-everywhere-index.db");
  }

  if (dbPath && fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new sqlJs.Database(fileBuffer);
    } catch {
      db = new sqlJs.Database();
    }
  } else {
    let seeded = false;
    if (
      dbPath &&
      fetchShareCacheAcrossWorktrees() &&
      context &&
      context.globalStorageUri
    ) {
      const workspaceFolder =
        vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
      if (workspaceFolder) {
        try {
          const rootPath = workspaceFolder.uri.fsPath;
          const fingerprint = await gitService.getRepoFingerprint(rootPath);
          if (fingerprint) {
            const globalDir = context.globalStorageUri.fsPath;
            const templateDbPath = path.join(globalDir, `repo-${fingerprint}.db`);
            const templateMetaPath = path.join(globalDir, `repo-${fingerprint}.json`);

            if (fs.existsSync(templateDbPath) && fs.existsSync(templateMetaPath)) {
              const meta = JSON.parse(fs.readFileSync(templateMetaPath, "utf8"));
              const templateRootUriStr = meta.templateRootUri;
              const currentRootUriStr = workspaceFolder.uri.toString();

              const fileBuffer = fs.readFileSync(templateDbPath);
              db = new sqlJs.Database(fileBuffer);

              if (templateRootUriStr && templateRootUriStr !== currentRootUriStr) {
                db.run("UPDATE symbols SET uri = replace(uri, ?, ?)", [
                  templateRootUriStr,
                  currentRootUriStr,
                ]);
              }

              const data = db.export();
              fs.writeFileSync(dbPath, Buffer.from(data));

              seededFromTemplate = true;
              seeded = true;
              logger.log(
                `Seeded database from shared repository template (fingerprint: ${fingerprint})`
              );
            }
          }
        } catch (error) {
          logger.log(`Failed to seed database from template: ${error}`);
        }
      }
    }

    if (!seeded) {
      db = new sqlJs.Database();
    }
  }

  // Performance PRAGMAs for SQLite WASM
  try {
    db.run("PRAGMA synchronous = OFF;");
    db.run("PRAGMA journal_mode = MEMORY;");
    db.run("PRAGMA temp_store = MEMORY;");
    db.run("PRAGMA cache_size = -64000;"); // Bounded to 64 MB dynamic RAM ceiling per window
  } catch {
    // Ignore PRAGMA errors on in-memory databases
  }

  createTables();
}

export function extractName(label: string): string {
  // Strip icon prefix like "$(symbol-class)  ClassName"
  const match = label.match(/^\$\([^)]+\)\s+(.+)$/);
  return match ? match[1] : label;
}

export function extractCleanName(name: string): string {
  if (!name) {
    return "";
  }
  return name.toLowerCase().replace(/[\s.\-_]/g, "");
}

export function extractCleanStem(name: string, symbolKind?: number): string {
  if (!name) {
    return "";
  }
  let stem = name;
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex > 0) {
    stem = name.substring(0, dotIndex);
  }
  return extractCleanName(stem);
}

function createTables(): void {
  if (!db) {
    return;
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS symbols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uri TEXT NOT NULL,
      name TEXT NOT NULL,
      clean_name TEXT DEFAULT '',
      clean_stem TEXT DEFAULT '',
      symbol_kind INTEGER NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      detail TEXT,
      range_start_line INTEGER DEFAULT 0,
      range_start_char INTEGER DEFAULT 0,
      range_end_line INTEGER DEFAULT 0,
      range_end_char INTEGER DEFAULT 0
    )
  `);

  // Migrations for existing databases from earlier versions
  try {
    db.run("ALTER TABLE symbols ADD COLUMN clean_name TEXT DEFAULT ''");
  } catch {}
  try {
    db.run("ALTER TABLE symbols ADD COLUMN clean_stem TEXT DEFAULT ''");
  } catch {}

  // Backfill clean_name and clean_stem if missing in existing database
  try {
    const unmigrated = db.exec(
      "SELECT COUNT(*) FROM symbols WHERE clean_stem = '' AND name != ''"
    );
    if (unmigrated && unmigrated[0] && unmigrated[0].values[0][0] > 0) {
      const rows = db.exec(
        "SELECT id, name, symbol_kind FROM symbols WHERE clean_stem = '' AND name != ''"
      );
      if (rows && rows[0]) {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(
          "UPDATE symbols SET clean_name = ?, clean_stem = ? WHERE id = ?"
        );
        for (const row of rows[0].values) {
          const id = row[0];
          const name = row[1] as string;
          const kind = row[2] as number;
          stmt.run([
            extractCleanName(name),
            extractCleanStem(name, kind),
            id,
          ]);
        }
        stmt.free();
        db.run("COMMIT");
      }
    }
  } catch {}

  db.run("CREATE INDEX IF NOT EXISTS idx_symbols_uri ON symbols(uri)");
  db.run("CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(symbol_kind)");
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_symbols_name_nocase ON symbols(name COLLATE NOCASE)"
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_symbols_clean_stem ON symbols(clean_stem)"
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_symbols_clean_name ON symbols(clean_name)"
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_symbols_kind_name ON symbols(symbol_kind, name COLLATE NOCASE)"
  );
}

export function insertSymbol(item: QuickPickItem): void {
  if (!db) {
    return;
  }
  clearSearchCache();
  const name = extractName(item.label);
  const cleanName = extractCleanName(name);
  const cleanStem = extractCleanStem(name, item.symbolKind);
  db.run(
    `INSERT INTO symbols
     (uri, name, clean_name, clean_stem, symbol_kind, label, description, detail,
      range_start_line, range_start_char, range_end_line, range_end_char)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.uri.toString(),
      name,
      cleanName,
      cleanStem,
      item.symbolKind,
      item.label,
      item.description || "",
      item.detail || "",
      item.range ? item.range.start.line : 0,
      item.range ? item.range.start.character : 0,
      item.range ? item.range.end.line : 0,
      item.range ? item.range.end.character : 0,
    ]
  );
}

export function insertSymbolsBatch(items: QuickPickItem[]): void {
  if (!db || !items || !items.length) {
    return;
  }
  clearSearchCache();
  db.run("BEGIN TRANSACTION");
  const stmt = db.prepare(`
    INSERT INTO symbols
    (uri, name, clean_name, clean_stem, symbol_kind, label, description, detail,
     range_start_line, range_start_char, range_end_line, range_end_char)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = extractName(item.label);
      stmt.run([
        item.uri.toString(),
        name,
        extractCleanName(name),
        extractCleanStem(name, item.symbolKind),
        item.symbolKind,
        item.label,
        item.description || "",
        item.detail || "",
        item.range ? item.range.start.line : 0,
        item.range ? item.range.start.character : 0,
        item.range ? item.range.end.line : 0,
        item.range ? item.range.end.character : 0,
      ]);
    }
    stmt.free();
    db.run("COMMIT");
  } catch (e) {
    stmt.free();
    db.run("ROLLBACK");
    throw e;
  }
}

export function deleteByUri(uriPath: string): void {
  if (!db) {
    return;
  }
  clearSearchCache();
  db.run("DELETE FROM symbols WHERE uri = ?", [uriPath]);
}

export function deleteByUriPrefix(uriPath: string): void {
  if (!db) {
    return;
  }
  clearSearchCache();
  db.run("DELETE FROM symbols WHERE uri LIKE ?", [uriPath + "%"]);
}

export interface SearchOptions {
  symbolKind?: number;
  allowedKinds?: number[];
  ignoredKinds?: number[];
  ignoredNames?: string[];
  sortByKind?: boolean;
}

const QUERY_COLUMNS =
  "uri, symbol_kind, label, description, detail, range_start_line, range_start_char, range_end_line, range_end_char";

const SEARCH_CACHE_MAX_SIZE = 50;
const searchCache = new Map<string, QuickPickItem[]>();

export function clearSearchCache(): void {
  searchCache.clear();
}

export function search(
  query: string,
  limit: number = SEARCH_LIMIT,
  options?: SearchOptions
): QuickPickItem[] {
  if (!db) {
    return [];
  }

  // Fast-path: Check LRU search cache
  const cacheKey = `${query}|${limit}|${options?.symbolKind ?? ""}|${options?.sortByKind ? "1" : "0"}|${options?.allowedKinds?.join(",") ?? ""}|${options?.ignoredKinds?.join(",") ?? ""}|${options?.ignoredNames?.join(",") ?? ""}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const conditions: string[] = [];
  const params: any[] = [];

  if (options) {
    if (options.symbolKind !== undefined) {
      conditions.push("symbol_kind = ?");
      params.push(options.symbolKind);
    } else if (options.allowedKinds && options.allowedKinds.length > 0) {
      const placeholders = options.allowedKinds.map(() => "?").join(", ");
      conditions.push(`symbol_kind IN (${placeholders})`);
      params.push(...options.allowedKinds);
    }

    if (options.ignoredKinds && options.ignoredKinds.length > 0) {
      const placeholders = options.ignoredKinds.map(() => "?").join(", ");
      conditions.push(`symbol_kind NOT IN (${placeholders})`);
      params.push(...options.ignoredKinds);
    }

    if (options.ignoredNames && options.ignoredNames.length > 0) {
      for (const ign of options.ignoredNames) {
        if (ign) {
          conditions.push("name NOT LIKE ?");
          params.push(`%${ign}%`);
        }
      }
    }
  }

  const baseWhere = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  let matchedItems: QuickPickItem[] = [];
  const seenKeys = new Set<string>();

  const addItemsFromRows = (rows: any[][]) => {
    for (const row of rows) {
      const key = `${row[0]}#${row[1]}#${row[2]}#${row[5]}#${row[6]}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matchedItems.push(rowToQuickPickItem(row));
      }
    }
  };

  if (!query) {
    const sortOrder = options?.sortByKind
      ? "symbol_kind ASC, name COLLATE NOCASE ASC"
      : "name COLLATE NOCASE ASC";
    const results = db.exec(
      `SELECT ${QUERY_COLUMNS} FROM symbols ${baseWhere} ORDER BY ${sortOrder} LIMIT ${limit}`,
      params
    );
    if (results && results.length) {
      addItemsFromRows(results[0].values);
    }
  } else if (query.includes("/")) {
    // Path search (e.g. "src/user")
    const matchClause = "uri LIKE ?";
    const fullWhere = baseWhere ? `${baseWhere} AND ${matchClause}` : `WHERE ${matchClause}`;
    const results = db.exec(
      `SELECT ${QUERY_COLUMNS} FROM symbols ${fullWhere} ORDER BY CASE WHEN symbol_kind = 0 THEN 0 ELSE 1 END ASC, LENGTH(name) ASC, name COLLATE NOCASE ASC LIMIT ${limit}`,
      [...params, `%${query}%`]
    );
    if (results && results.length) {
      addItemsFromRows(results[0].values);
    }
  } else {
    const cleanQuery = extractCleanName(query);
    const kindSort = options?.sortByKind ? "symbol_kind ASC, " : "";

    // Stage 1: Exact and Prefix matches on clean_stem, clean_name, or name
    // Ranked by relevance:
    // 1: Exact match on stem / clean_name / raw name
    // 2: Prefix match on stem / clean_name / raw name
    const stage1Where = baseWhere
      ? `${baseWhere} AND (clean_stem LIKE ? OR clean_name LIKE ? OR name LIKE ?)`
      : `WHERE (clean_stem LIKE ? OR clean_name LIKE ? OR name LIKE ?)`;

    const stage1Sql = `
      SELECT ${QUERY_COLUMNS},
        CASE
          WHEN clean_stem = ? OR clean_name = ? OR name = ? COLLATE NOCASE THEN 1
          WHEN clean_stem LIKE ? OR clean_name LIKE ? OR name LIKE ? THEN 2
          ELSE 3
        END AS relevance
      FROM symbols
      ${stage1Where}
      ORDER BY
        ${kindSort}
        relevance ASC,
        CASE WHEN symbol_kind = 0 THEN 0 ELSE 1 END ASC,
        LENGTH(name) ASC,
        name COLLATE NOCASE ASC
      LIMIT ${limit}
    `;

    const stage1Params = [
      cleanQuery,
      cleanQuery,
      query,
      `${cleanQuery}%`,
      `${cleanQuery}%`,
      `${query}%`,
      ...params,
      `${cleanQuery}%`,
      `${cleanQuery}%`,
      `${query}%`,
    ];

    let hasExactMatch = false;
    const stage1Results = db.exec(stage1Sql, stage1Params);
    if (stage1Results && stage1Results.length) {
      addItemsFromRows(stage1Results[0].values);
      hasExactMatch = stage1Results[0].values.some((row: any[]) => row[9] === 1);
    }

    // Stage 2: Substring matches if we have space left
    const SUBSTRING_MIN_THRESHOLD = 50;
    if (matchedItems.length < SUBSTRING_MIN_THRESHOLD && matchedItems.length < limit) {
      const remaining = Math.min(
        limit - matchedItems.length,
        SUBSTRING_MIN_THRESHOLD - matchedItems.length
      );

      const stage2Where = baseWhere
        ? `${baseWhere} AND (clean_stem LIKE ? OR clean_name LIKE ? OR name LIKE ?)
           AND clean_stem NOT LIKE ? AND clean_name NOT LIKE ? AND name NOT LIKE ?`
        : `WHERE (clean_stem LIKE ? OR clean_name LIKE ? OR name LIKE ?)
           AND clean_stem NOT LIKE ? AND clean_name NOT LIKE ? AND name NOT LIKE ?`;

      const stage2Sql = `
        SELECT ${QUERY_COLUMNS}
        FROM symbols
        ${stage2Where}
        ORDER BY
          ${kindSort}
          CASE WHEN symbol_kind = 0 THEN 0 ELSE 1 END ASC,
          LENGTH(name) ASC,
          name COLLATE NOCASE ASC
        LIMIT ${remaining}
      `;

      const stage2Params = [
        ...params,
        `%${cleanQuery}%`,
        `%${cleanQuery}%`,
        `%${query}%`,
        `${cleanQuery}%`,
        `${cleanQuery}%`,
        `${query}%`,
      ];

      const stage2Results = db.exec(stage2Sql, stage2Params);
      if (stage2Results && stage2Results.length) {
        addItemsFromRows(stage2Results[0].values);
      }
    }

    // Stage 3: Subsequence / fuzzy matches if:
    // - No exact matches were found in Stage 1 (!hasExactMatch)
    // - Direct matches are few (< FUZZY_MIN_THRESHOLD)
    // - Query length >= 2
    const FUZZY_MIN_THRESHOLD = 10;
    if (
      !hasExactMatch &&
      matchedItems.length < FUZZY_MIN_THRESHOLD &&
      matchedItems.length < limit &&
      cleanQuery.length >= 2
    ) {
      const remaining = Math.min(
        limit - matchedItems.length,
        SUBSTRING_MIN_THRESHOLD - matchedItems.length
      );
      const fuzzyPattern = "%" + cleanQuery.split("").join("%") + "%";

      const stage3Where = baseWhere
        ? `${baseWhere} AND (clean_stem LIKE ? OR name LIKE ?)
           AND clean_stem NOT LIKE ? AND clean_name NOT LIKE ? AND name NOT LIKE ?`
        : `WHERE (clean_stem LIKE ? OR name LIKE ?)
           AND clean_stem NOT LIKE ? AND clean_name NOT LIKE ? AND name NOT LIKE ?`;

      const stage3Sql = `
        SELECT ${QUERY_COLUMNS}
        FROM symbols
        ${stage3Where}
        ORDER BY
          ${kindSort}
          CASE WHEN symbol_kind = 0 THEN 0 ELSE 1 END ASC,
          LENGTH(name) ASC,
          name COLLATE NOCASE ASC
        LIMIT ${remaining}
      `;

      const stage3Params = [
        ...params,
        fuzzyPattern,
        fuzzyPattern,
        `%${cleanQuery}%`,
        `%${cleanQuery}%`,
        `%${query}%`,
      ];

      const stage3Results = db.exec(stage3Sql, stage3Params);
      if (stage3Results && stage3Results.length) {
        addItemsFromRows(stage3Results[0].values);
      }
    }
  }

  // Save to LRU cache
  if (searchCache.size >= SEARCH_CACHE_MAX_SIZE) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }
  searchCache.set(cacheKey, matchedItems);

  return matchedItems;
}

function rowToQuickPickItem(row: any[]): QuickPickItem {
  const uriStr = row[0] as string;
  let uri: vscode.Uri;
  try {
    uri = vscode.Uri.parse(uriStr);
  } catch {
    uri = vscode.Uri.file(uriStr);
  }

  return {
    uri,
    symbolKind: row[1] as number,
    label: row[2] as string,
    description: (row[3] as string) || "",
    detail: (row[4] as string) || "",
    range: {
      start: new vscode.Position(row[5] as number, row[6] as number),
      end: new vscode.Position(row[7] as number, row[8] as number),
    },
  } as QuickPickItem;
}

export function clearAll(): void {
  if (db) {
    clearSearchCache();
    db.run("DELETE FROM symbols");
  }
}

export function getCount(): number {
  if (!db) {
    return 0;
  }
  const result = db.exec("SELECT COUNT(*) as cnt FROM symbols");
  if (!result || !result.length) {
    return 0;
  }
  return result[0].values[0][0] as number;
}

export function isEmpty(): boolean {
  return getCount() === 0;
}

export function persistToFile(): void {
  if (db && dbPath) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);

      if (
        fetchShareCacheAcrossWorktrees() &&
        extensionContext &&
        extensionContext.globalStorageUri
      ) {
        const workspaceFolder =
          vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
        if (workspaceFolder) {
          gitService
            .getRepoFingerprint(workspaceFolder.uri.fsPath)
            .then((fingerprint) => {
              if (fingerprint && extensionContext) {
                const globalDir = extensionContext.globalStorageUri.fsPath;
                if (!fs.existsSync(globalDir)) {
                  fs.mkdirSync(globalDir, { recursive: true });
                }
                const templateDbPath = path.join(globalDir, `repo-${fingerprint}.db`);
                const templateMetaPath = path.join(globalDir, `repo-${fingerprint}.json`);
                fs.writeFileSync(templateDbPath, buffer);
                fs.writeFileSync(
                  templateMetaPath,
                  JSON.stringify({
                    fingerprint,
                    templateRootUri: workspaceFolder.uri.toString(),
                    symbolCount: getCount(),
                    lastUpdated: Date.now(),
                  })
                );
              }
            })
            .catch(() => {
              // Non-critical background task
            });
        }
      }
    } catch {
      // silently fail — non-critical
    }
  }
}

export function wasSeededFromTemplate(): boolean {
  return seededFromTemplate;
}

export function setSeededFromTemplate(value: boolean): void {
  seededFromTemplate = value;
}

export function clearSharedCache(): void {
  if (extensionContext && extensionContext.globalStorageUri) {
    const globalDir = extensionContext.globalStorageUri.fsPath;
    if (fs.existsSync(globalDir)) {
      const files = fs.readdirSync(globalDir);
      for (const file of files) {
        if (
          file.startsWith("repo-") &&
          (file.endsWith(".db") || file.endsWith(".json"))
        ) {
          try {
            fs.unlinkSync(path.join(globalDir, file));
          } catch {
            // ignore
          }
        }
      }
      logger.log("Shared repository cache cleared successfully.");
    }
  }
}

export function schedulePersist(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = setTimeout(() => {
    persistToFile();
  }, 2000);
}

export function deleteDatabaseFile(): void {
  if (dbPath && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}

export function closeDatabase(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  if (db) {
    persistToFile();
    db.close();
    db = undefined;
  }
}

export function isReady(): boolean {
  return !!db;
}

export const database = {
  initDatabase,
  insertSymbol,
  insertSymbolsBatch,
  deleteByUri,
  deleteByUriPrefix,
  search,
  clearSearchCache,
  clearAll,
  getCount,
  isEmpty,
  persistToFile,
  schedulePersist,
  deleteDatabaseFile,
  closeDatabase,
  isReady,
  wasSeededFromTemplate,
  setSeededFromTemplate,
  clearSharedCache,
  extractName,
  extractCleanName,
  extractCleanStem,
};
