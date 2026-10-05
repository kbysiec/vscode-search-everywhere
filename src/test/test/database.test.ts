import { assert } from "chai";
import * as path from "path";
import * as vscode from "vscode";
import { database } from "../../database";
import { QuickPickItem } from "../../types";

describe("Database", () => {
  const fakeContext: any = {
    extensionPath: path.resolve(__dirname, "../../../"),
    storageUri: vscode.Uri.file("/tmp/vscode-search-everywhere-test"),
    globalStorageUri: vscode.Uri.file("/tmp/vscode-search-everywhere-test"),
  };

  const item1: QuickPickItem = {
    uri: vscode.Uri.file("/workspace/src/UserController.ts"),
    symbolKind: vscode.SymbolKind.Class,
    label: "$(symbol-class) UserController",
    description: "src/UserController.ts",
    detail: "class UserController",
    range: new vscode.Range(new vscode.Position(10, 0), new vscode.Position(20, 0)),
  };

  const item2: QuickPickItem = {
    uri: vscode.Uri.file("/workspace/src/UserService.ts"),
    symbolKind: vscode.SymbolKind.Class,
    label: "$(symbol-class) UserService",
    description: "src/UserService.ts",
    detail: "class UserService",
    range: new vscode.Range(new vscode.Position(5, 0), new vscode.Position(15, 0)),
  };

  const item3: QuickPickItem = {
    uri: vscode.Uri.file("/workspace/src/models/User.ts"),
    symbolKind: vscode.SymbolKind.Interface,
    label: "$(symbol-interface) User",
    description: "src/models/User.ts",
    detail: "interface User",
    range: new vscode.Range(new vscode.Position(1, 0), new vscode.Position(8, 0)),
  };

  before(async () => {
    await database.initDatabase(fakeContext);
  });

  beforeEach(() => {
    database.clearAll();
  });

  after(() => {
    database.closeDatabase();
  });

  describe("initDatabase", () => {
    it("should initialize database and report isReady true", () => {
      assert.equal(database.isReady(), true);
    });
  });

  describe("insertSymbol and getCount", () => {
    it("should insert single symbol into database", () => {
      assert.equal(database.isEmpty(), true);
      database.insertSymbol(item1);
      assert.equal(database.getCount(), 1);
      assert.equal(database.isEmpty(), false);
    });
  });

  describe("insertSymbolsBatch", () => {
    it("should insert multiple symbols in a batch", () => {
      database.insertSymbolsBatch([item1, item2, item3]);
      assert.equal(database.getCount(), 3);
    });
  });

  describe("search", () => {
    beforeEach(() => {
      database.insertSymbolsBatch([item1, item2, item3]);
    });

    it("should return all items when query is empty", () => {
      const results = database.search("");
      assert.equal(results.length, 3);
    });

    it("should return matching items for exact query with proper ranking", () => {
      const results = database.search("User");
      assert.equal(results.length, 3);
      assert.equal(results[0].label, "$(symbol-interface) User");
    });

    it("should support fuzzy search", () => {
      const results = database.search("UsrCtrl");
      assert.equal(results.length, 1);
      assert.equal(results[0].label, "$(symbol-class) UserController");
    });

    it("should return empty array when no item matches", () => {
      const results = database.search("nonexistentxyz");
      assert.equal(results.length, 0);
    });

    it("should respect limit parameter", () => {
      const results = database.search("User", 2);
      assert.equal(results.length, 2);
    });

    it("should filter by symbolKind", () => {
      const results = database.search("", 500, { symbolKind: vscode.SymbolKind.Class });
      assert.equal(results.length, 2);
      assert.isTrue(results.every((r) => r.symbolKind === vscode.SymbolKind.Class));
    });

    it("should filter by allowedKinds", () => {
      const results = database.search("", 500, { allowedKinds: [vscode.SymbolKind.Interface] });
      assert.equal(results.length, 1);
      assert.equal(results[0].symbolKind, vscode.SymbolKind.Interface);
    });

    it("should filter by ignoredNames", () => {
      const results = database.search("", 500, { ignoredNames: ["Controller"] });
      assert.equal(results.length, 2);
      assert.isFalse(results.some((r) => r.label.includes("Controller")));
    });
  });

  describe("deleteByUri", () => {
    it("should delete symbol by exact uri", () => {
      database.insertSymbolsBatch([item1, item2, item3]);
      database.deleteByUri(item1.uri.toString());
      assert.equal(database.getCount(), 2);
      const results = database.search("UserController");
      assert.equal(results.length, 0);
    });
  });

  describe("deleteByUriPrefix", () => {
    it("should delete symbols matching uri prefix for directory removal", () => {
      database.insertSymbolsBatch([item1, item2, item3]);
      database.deleteByUriPrefix(vscode.Uri.file("/workspace/src/models").toString());
      assert.equal(database.getCount(), 2);
      const results = database.search("User");
      assert.equal(results.length, 2);
      assert.isTrue(results.every((r) => !r.uri.toString().includes("/workspace/src/models")));
    });
  });

  describe("clearAll", () => {
    it("should delete all items from database", () => {
      database.insertSymbolsBatch([item1, item2, item3]);
      assert.equal(database.getCount(), 3);
      database.clearAll();
      assert.equal(database.getCount(), 0);
      assert.equal(database.isEmpty(), true);
    });
  });

  describe("worktree shared cache helpers", () => {
    it("should allow getting and setting wasSeededFromTemplate flag", () => {
      assert.isFalse(database.wasSeededFromTemplate());
      database.setSeededFromTemplate(true);
      assert.isTrue(database.wasSeededFromTemplate());
      database.setSeededFromTemplate(false);
      assert.isFalse(database.wasSeededFromTemplate());
    });

    it("should execute clearSharedCache safely without throwing", () => {
      assert.doesNotThrow(() => {
        database.clearSharedCache();
      });
    });
  });
});
