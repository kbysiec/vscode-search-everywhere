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
    const wasmPath = path.join(
      context.extensionPath,
      "node_modules",
      "sql.js",
      "dist",
      "sql-wasm.wasm"
    );
    locateFileOpt = (file: string) => {
      if (file.endsWith(".wasm") && fs.existsSync(wasmPath)) {
        return wasmPath;
      }
      return file;
    };
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
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(symbol_kind)"
  );
}

export function insertSymbol(item: QuickPickItem): void {
  if (!db) {
    return;
  }
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
  db.run("BEGIN TRANSACTION");
  try {
    for (const item of items) {
      insertSymbol(item);
    }
    db.run("COMMIT");
  } catch (e) {
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
  db.run("DELETE FROM symbols WHERE uri = ?", [uriPath]);
}

export function deleteByUriPrefix(uriPath: string): void {
  if (!db) {
    return;
  }
  db.run("DELETE FROM symbols WHERE uri LIKE ?", [uriPath + "%"]);
}

export function search(
  query: string,
  limit: number = SEARCH_LIMIT
): QuickPickItem[] {
  if (!db) {
    return [];
  }

  let results: any[];

  if (!query) {
    results = db.exec(
      `SELECT * FROM symbols ORDER BY symbol_kind, name LIMIT ${limit}`
    );
  } else {
    // Build fuzzy pattern: "abc" -> "%a%b%c%"
    const fuzzyPattern =
      "%" + query.split("").join("%") + "%";
    const lowerFuzzy = fuzzyPattern.toLowerCase();
    const lowerQ = query.toLowerCase();
    const lowerExact = "%" + lowerQ + "%";
    const lowerStart = lowerQ + "%";
    results = db.exec(
      `SELECT * FROM symbols
       WHERE LOWER(name) LIKE ?
          OR LOWER(label) LIKE ?
          OR LOWER(detail) LIKE ?
       ORDER BY
         CASE
           WHEN LOWER(name) = ? THEN 0
           WHEN LOWER(name) LIKE ? THEN 1
           WHEN LOWER(name) LIKE ? THEN 2
           ELSE 3
         END,
         symbol_kind, name
       LIMIT ${limit}`,
      [lowerFuzzy, lowerFuzzy, lowerFuzzy, lowerQ, lowerStart, lowerExact]
    );
  }

  if (!results || !results.length) {
    return [];
  }

  const columns: string[] = results[0].columns;
  const rows: any[][] = results[0].values;
  return rows.map((row: any[]) => rowToQuickPickItem(columns, row));
}

function rowToQuickPickItem(
  columns: string[],
  row: any[]
): QuickPickItem {
  const obj: any = {};
  columns.forEach((col: string, i: number) => {
    obj[col] = row[i];
  });

  const uriStr = obj.uri as string;
  let uri: vscode.Uri;
  try {
    uri = vscode.Uri.parse(uriStr);
  } catch {
    uri = vscode.Uri.file(uriStr);
  }

  return {
    uri,
    symbolKind: obj.symbol_kind as number,
    label: obj.label as string,
    description: (obj.description as string) || "",
    detail: (obj.detail as string) || "",
    range: {
      start: new vscode.Position(
        obj.range_start_line as number,
        obj.range_start_char as number
      ),
      end: new vscode.Position(
        obj.range_end_line as number,
        obj.range_end_char as number
      ),
    },
  } as QuickPickItem;
}

export function clearAll(): void {
  if (db) {
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
  clearAll,
  getCount,
  isEmpty,
  persistToFile,
  schedulePersist,
  deleteDatabaseFile,
  closeDatabase,
  isReady,
};
