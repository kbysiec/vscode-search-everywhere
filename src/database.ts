import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { QuickPickItem } from "./types";

let db: any;
let dbPath: string;
let sqlJs: any;
let persistTimer: NodeJS.Timeout | undefined;

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
    db = new sqlJs.Database();
  }

  // Performance PRAGMAs for SQLite WASM
  try {
    db.run("PRAGMA synchronous = OFF;");
    db.run("PRAGMA journal_mode = MEMORY;");
    db.run("PRAGMA temp_store = MEMORY;");
    db.run("PRAGMA cache_size = -64000;");
  } catch {
    // Ignore PRAGMA errors on in-memory databases
  }

  createTables();
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
  db.run("CREATE INDEX IF NOT EXISTS idx_symbols_uri ON symbols(uri)");
  db.run("CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(symbol_kind)");
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_symbols_name_nocase ON symbols(name COLLATE NOCASE)"
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
  db.run(
    `INSERT INTO symbols
     (uri, name, symbol_kind, label, description, detail,
      range_start_line, range_start_char, range_end_line, range_end_char)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.uri.toString(),
      extractName(item.label),
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
    (uri, name, symbol_kind, label, description, detail,
     range_start_line, range_start_char, range_end_line, range_end_char)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      stmt.run([
        item.uri.toString(),
        extractName(item.label),
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

function extractName(label: string): string {
  // Strip icon prefix like "$(symbol-class)  ClassName"
  const match = label.match(/^\$\([^)]+\)\s+(.+)$/);
  return match ? match[1] : label;
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

  if (!query) {
    const sortOrder = options?.sortByKind
      ? "symbol_kind, name COLLATE NOCASE"
      : "name COLLATE NOCASE";
    const results = db.exec(
      `SELECT ${QUERY_COLUMNS} FROM symbols ${baseWhere} ORDER BY ${sortOrder} LIMIT ${limit}`,
      params
    );
    if (results && results.length) {
      matchedItems = results[0].values.map((row: any[]) => rowToQuickPickItem(row));
    }
  } else if (query.includes("/")) {
    // Path search (e.g. "src/user")
    const matchClause = "uri LIKE ?";
    const fullWhere = baseWhere ? `${baseWhere} AND ${matchClause}` : `WHERE ${matchClause}`;
    const results = db.exec(
      `SELECT ${QUERY_COLUMNS} FROM symbols ${fullWhere} ORDER BY name COLLATE NOCASE LIMIT ${limit}`,
      [...params, `%${query}%`]
    );
    if (results && results.length) {
      matchedItems = results[0].values.map((row: any[]) => rowToQuickPickItem(row));
    }
  } else {
    // Symbol / file name search: 2-stage index-accelerated query
    // Stage 1: Prefix search (instant B-tree index lookup, ~0.2ms)
    const prefixMatchClause = "name LIKE ?";
    const prefixWhere = baseWhere
      ? `${baseWhere} AND ${prefixMatchClause}`
      : `WHERE ${prefixMatchClause}`;
    const prefixParams = [...params, `${query}%`];

    const prefixResults = db.exec(
      `SELECT ${QUERY_COLUMNS} FROM symbols ${prefixWhere} ORDER BY name COLLATE NOCASE LIMIT ${limit}`,
      prefixParams
    );

    if (prefixResults && prefixResults.length) {
      for (const row of prefixResults[0].values) {
        matchedItems.push(rowToQuickPickItem(row));
      }
    }

    // Stage 2: Substring search only if prefix search returned few results (< 50)
    // If we already have >= 50 exact prefix matches, that fills multiple QuickPick viewports
    const SUBSTRING_MIN_THRESHOLD = 50;
    if (matchedItems.length < SUBSTRING_MIN_THRESHOLD) {
      const remaining = Math.min(
        limit - matchedItems.length,
        SUBSTRING_MIN_THRESHOLD - matchedItems.length
      );
      const subMatchClause = "name LIKE ? AND name NOT LIKE ?";
      const subWhere = baseWhere
        ? `${baseWhere} AND ${subMatchClause}`
        : `WHERE ${subMatchClause}`;
      const subParams = [...params, `%${query}%`, `${query}%`];

      const subResults = db.exec(
        `SELECT ${QUERY_COLUMNS} FROM symbols ${subWhere} ORDER BY name COLLATE NOCASE LIMIT ${remaining}`,
        subParams
      );

      if (subResults && subResults.length) {
        for (const row of subResults[0].values) {
          matchedItems.push(rowToQuickPickItem(row));
        }
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
    } catch {
      // silently fail — non-critical
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
};
