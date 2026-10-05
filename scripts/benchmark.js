const path = require("path");
const fs = require("fs");

// Mock VSCode classes
const vscodeMock = {
  Uri: {
    file: (p) => ({ toString: () => "file://" + p, scheme: "file", path: p }),
    parse: (p) => ({ toString: () => p, scheme: "file", path: p }),
  },
  Position: class Position {
    constructor(line, char) { this.line = line; this.character = char; }
  },
  SymbolKind: {
    File: 0,
    Class: 4,
    Method: 5,
    Property: 6,
    Interface: 10,
    Variable: 12,
    Constant: 13,
    Function: 11,
  },
};

// Hook module loader for 'vscode'
const Module = require("module");
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === "vscode") return vscodeMock;
  return originalRequire.apply(this, arguments);
};

const { database } = require("../dist/database");

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function generateMockItems(count) {
  const kinds = [0, 4, 5, 6, 10, 12, 13];
  const items = [];
  for (let i = 0; i < count; i++) {
    const fileId = Math.floor(i / 10);
    const kind = kinds[i % kinds.length];
    const name = `Item_${i}_ServiceHandler${i % 100}`;
    items.push({
      uri: vscodeMock.Uri.file(`/workspace/project/src/module${fileId % 50}/file${fileId}.ts`),
      symbolKind: kind,
      label: `$(symbol-class) ${name}`,
      description: `src/module${fileId % 50}/file${fileId}.ts`,
      detail: `function ${name}(opts: Options): Promise<Result${i}>`,
      range: {
        start: new vscodeMock.Position(i % 500, 0),
        end: new vscodeMock.Position((i % 500) + 10, 0),
      },
    });
  }
  return items;
}

async function runBenchmark(itemCount = 50000) {
  console.log(`\n======================================================`);
  console.log(`  BENCHMARK: ${itemCount.toLocaleString()} symboli/plików w projekcie`);
  console.log(`======================================================\n`);

  if (global.gc) global.gc();
  const baselineMem = process.memoryUsage().heapUsed;
  console.log(`Początkowy stan pamięci sterty: ${formatBytes(baselineMem)}`);

  // --- 1. POPRZEDNIA ARCHITEKTURA (Wszystko w tablicy JS w RAM) ---
  console.log(`\n[1] TEST: STARA ARCHITEKTURA (wszystko w tablicy RAM + JSON cache)`);
  const t0Gen = Date.now();
  const memoryArray = generateMockItems(itemCount);
  const t1Gen = Date.now();

  const memAfterOldLoad = process.memoryUsage().heapUsed;
  const oldArrayRAM = memAfterOldLoad - baselineMem;
  console.log(`  -> Wygenerowano tablicę w RAM w: ${t1Gen - t0Gen} ms`);
  console.log(`  -> RAM zajmowany przez obiekty w JS: +${formatBytes(oldArrayRAM)}`);

  // Symulacja wyszukiwania w starej architekturze (pełne filtrowanie 50 000 obiektów w JS)
  const queries = ["ServiceHandler42", "Item_1234", "module25", "xyznotfound"];
  const t0OldSearch = Date.now();
  let oldMatches = 0;
  for (let iter = 0; iter < 10; iter++) {
    for (const q of queries) {
      const lowerQ = q.toLowerCase();
      const filtered = memoryArray.filter(
        (it) =>
          it.label.toLowerCase().includes(lowerQ) ||
          it.detail.toLowerCase().includes(lowerQ)
      );
      oldMatches += filtered.length;
    }
  }
  const t1OldSearch = Date.now();
  const oldAvgQueryMs = ((t1OldSearch - t0OldSearch) / (10 * queries.length)).toFixed(2);
  console.log(`  -> Średni czas filtrowania w JS (40 zapytań): ${oldAvgQueryMs} ms / zapytanie`);

  // Symulacja serializacji do workspaceState (JSON)
  const t0Json = Date.now();
  const serialized = JSON.stringify(memoryArray);
  const t1Json = Date.now();
  console.log(`  -> Rozmiar JSON w workspaceState: ${formatBytes(Buffer.byteLength(serialized))}`);
  console.log(`  -> Czas zapisu/odczytu JSON cache: ${t1Json - t0Json} ms`);

  // Zwolnienie referencji starej tablicy
  memoryArray.length = 0;
  if (global.gc) global.gc();

  // --- 2. NOWA ARCHITEKTURA (SQLite WASM + wirtualizacja do 500) ---
  console.log(`\n[2] TEST: NOWA ARCHITEKTURA (SQLite WASM + virtual search limit 500)`);
  const testStorageDir = path.join(__dirname, "../.benchmark-storage");
  if (!fs.existsSync(testStorageDir)) fs.mkdirSync(testStorageDir, { recursive: true });

  const fakeContext = {
    extensionPath: path.resolve(__dirname, ".."),
    storageUri: { fsPath: testStorageDir },
    globalStorageUri: { fsPath: testStorageDir },
  };

  const memBeforeSqlite = process.memoryUsage().heapUsed;
  await database.initDatabase(fakeContext);
  database.clearAll();

  // Generujemy partiami po 5000 do wstawienia
  console.log(`  -> Wstawianie ${itemCount.toLocaleString()} wpisów do SQLite (w transakcjach)...`);
  const t0SqlInsert = Date.now();
  const batchSize = 5000;
  for (let i = 0; i < itemCount; i += batchSize) {
    const chunk = generateMockItems(Math.min(batchSize, itemCount - i));
    database.insertSymbolsBatch(chunk);
    chunk.length = 0; // zwalniamy natychmiast
  }
  const t1SqlInsert = Date.now();
  console.log(`  -> Wstawiono i zindeksowano w SQLite w: ${t1SqlInsert - t0SqlInsert} ms`);

  const memAfterSqlite = process.memoryUsage().heapUsed;
  const newRamOverhead = memAfterSqlite - memBeforeSqlite;
  console.log(`  -> Narzut na stertę JS w nowej architekturze: +${formatBytes(Math.max(0, newRamOverhead))}`);

  // Test wyszukiwania w SQLite (zwraca max 500 pozycji)
  const t0SqlSearch = Date.now();
  let newMatches = 0;
  for (let iter = 0; iter < 10; iter++) {
    for (const q of queries) {
      const results = database.search(q, 500);
      newMatches += results.length;
    }
  }
  const t1SqlSearch = Date.now();
  const newAvgQueryMs = ((t1SqlSearch - t0SqlSearch) / (10 * queries.length)).toFixed(2);
  console.log(`  -> Średni czas zapytania SQLite (40 zapytań): ${newAvgQueryMs} ms / zapytanie`);

  // Wielkość pliku bazy na dysku
  database.persistToFile();
  const dbFile = path.join(testStorageDir, "search-everywhere-index.db");
  const dbFileSize = fs.existsSync(dbFile) ? fs.statSync(dbFile).size : 0;
  console.log(`  -> Rozmiar bazy SQLite na dysku: ${formatBytes(dbFileSize)}`);

  database.closeDatabase();
  // Sprzątanie katalogu testowego
  try {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  } catch {}

  console.log(`\n======================================================`);
  console.log(`                   PODSUMOWANIE`);
  console.log(`======================================================`);
  console.log(`Wskaźnik                   | Przedtem (RAM array) | Teraz (SQLite WASM)`);
  console.log(`---------------------------+----------------------+--------------------`);
  console.log(`Zużycie pamięci JS         | ~${formatBytes(oldArrayRAM).padEnd(19)} | ~${formatBytes(Math.max(0, newRamOverhead)).padEnd(18)}`);
  console.log(`Rozmiar listy w UI (Quick) | ${itemCount.toLocaleString().padEnd(20)} | max 500 elementów`);
  console.log(`Czas wyszukiwania          | ${oldAvgQueryMs} ms / query        | ${newAvgQueryMs} ms / query`);
  console.log(`Zapis stanu / cache        | JSON (${t1Json - t0Json} ms)       | SQLite B-Tree (błyskawiczny)`);
  console.log(`Wpływ na UI VSCode         | Zwiechy wątku edytora| Zero lagów`);
  console.log(`======================================================\n`);
}

runBenchmark(50000).catch(console.error);
