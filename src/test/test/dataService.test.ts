import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import DataService from "../../dataService";
import * as mock from "../mock/dataService.mock";
import {
  getCacheStub,
  getUtilsStub,
  getDocumentSymbolItemSingleLine,
  getWorkspaceData,
  getDocumentSymbolItemSingleLineArray,
  getItems,
  getItem,
} from "../util/mockFactory";
import Cache from "../../cache";
import Utils from "../../utils";

describe("DataService", () => {
  let dataService: DataService;
  let dataServiceAny: any;
  let cacheStub: Cache;
  let utilsStub: Utils;

  before(() => {
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    dataService = new DataService(cacheStub, utilsStub);
  });

  beforeEach(() => {
    dataServiceAny = dataService as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should data service be initialized", () => {
      dataService = new DataService(cacheStub, utilsStub);

      assert.exists(dataService);
    });
  });

  describe("fetchData", () => {
    it("should return array of vscode.Uri or vscode.DocumentSymbol items with workspace data", async () => {
      sinon
        .stub(vscode.workspace, "findFiles")
        .returns(Promise.resolve(getItems()));
      sinon
        .stub(dataServiceAny, "loadAllSymbolsForUri")
        .returns(Promise.resolve(getDocumentSymbolItemSingleLineArray(1)));

      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });
  });

  describe("getIncludePatterns", () => {
    it("should return string[] containing include patterns", () => {
      const patterns = ["**/*.{js}"];
      sinon.stub(dataServiceAny.config, "getInclude").returns(patterns);

      assert.equal(dataServiceAny.getIncludePatterns(), patterns);
    });
  });

  describe("getExcludePatterns", () => {
    it("should return string[] containing exclude patterns", () => {
      const patterns = ["**/node_modules/**"];
      sinon.stub(dataServiceAny.config, "getExclude").returns(patterns);

      assert.equal(dataServiceAny.getExcludePatterns(), patterns);
    });
  });

  describe("patternsAsString", () => {
    it("should return empty string if given array is empty", () => {
      const patterns: string[] = [];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`should return string with one pattern if given array
      contains one element`, () => {
      const patterns = ["**/node_modules/**"];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`should return string with patterns separated by comma surrounded
      with curly braces if given array contains more than one element`, () => {
      const patterns = [
        "**/node_modules/**",
        "**/bower_components/**",
        "**/yarn.lock",
      ];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        `{${patterns.join(",")}}`
      );
    });
  });

  describe("includeSymbols", () => {
    it("should include symbols to workspaceData", async () => {
      sinon
        .stub(dataServiceAny, "getSymbolsForUri")
        .returns(Promise.resolve(getDocumentSymbolItemSingleLineArray(3)));
      const workspaceData = getWorkspaceData();
      await dataServiceAny.includeSymbols(workspaceData, [getItem()]);

      assert.equal(workspaceData.count, 3);
    });

    it("should repeat trial to get symbols for file if returned undefined", async () => {
      const sleepStub = sinon
        .stub(dataServiceAny.utils, "sleep")
        .returns(Promise.resolve());
      sinon
        .stub(dataServiceAny, "getSymbolsForUri")
        .returns(Promise.resolve(undefined));
      const workspaceData = getWorkspaceData();
      await dataServiceAny.includeSymbols(workspaceData, [getItem()]);

      assert.equal(workspaceData.count, 0);
      assert.equal(sleepStub.callCount, 9);
    });
  });

  describe("includeUris", () => {
    it("should include uris to empty workspaceData", () => {
      const workspaceData = getWorkspaceData();
      dataServiceAny.includeUris(workspaceData, getItems());

      assert.equal(workspaceData.count, 2);
    });

    it("should include uris to workspaceData containing data", () => {
      const workspaceData = getWorkspaceData([getItem()]);
      dataServiceAny.includeUris(workspaceData, getItems());

      assert.equal(workspaceData.count, 2);
    });
  });

  describe("ifUriExistsInArray", () => {
    it("should return true if uri already is included in array", () => {
      assert.equal(
        dataServiceAny.ifUriExistsInArray(getItems(), getItem()),
        true
      );
    });

    it("should return false if uri already is not included in array", () => {
      assert.equal(dataServiceAny.ifUriExistsInArray([], getItem()), false);
    });

    it("should return false if given item is vscode.DocumentSymbol not vscode.Uri type", () => {
      assert.equal(
        dataServiceAny.ifUriExistsInArray(
          getItems(),
          getDocumentSymbolItemSingleLine()
        ),
        false
      );
    });
  });

  describe("getSymbolsForUri", () => {
    it("should return array of vscode.DocumentSymbol for given uri", async () => {
      const documentSymbolItems = getDocumentSymbolItemSingleLineArray(2);
      sinon
        .stub(dataServiceAny, "loadAllSymbolsForUri")
        .returns(Promise.resolve(documentSymbolItems));

      assert.deepEqual(
        await dataServiceAny.getSymbolsForUri(getItem()),
        documentSymbolItems
      );
    });

    it("should return undefined", async () => {
      sinon
        .stub(dataServiceAny, "loadAllSymbolsForUri")
        .returns(Promise.resolve(undefined));

      assert.deepEqual(
        await dataServiceAny.getSymbolsForUri(getItem()),
        undefined
      );
    });
  });

  describe("loadAllSymbolsForUri", () => {
    it(`should vscode.commands.executeCommand be method invoked
      with vscode.executeDocumentSymbolProvider given as first parameter`, async () => {
      const executeCommandStub = sinon.stub(vscode.commands, "executeCommand");
      await dataServiceAny.loadAllSymbolsForUri(getItem());

      assert.equal(
        executeCommandStub.calledWith("vscode.executeDocumentSymbolProvider"),
        true
      );
    });
  });

  describe("reduceAndFlatSymbolsArrayForUri", () => {
    it("should return flat array of vscode.DocumentSymbol", async () => {
      assert.deepEqual(
        await dataServiceAny.reduceAndFlatSymbolsArrayForUri(
          getDocumentSymbolItemSingleLineArray(2, true)
        ),
        mock.flatDocumentSymbolItems
      );
    });
  });

  describe("hasSymbolChildren", () => {
    it("should return true if symbol has children", async () => {
      assert.deepEqual(
        await dataServiceAny.hasSymbolChildren(
          getDocumentSymbolItemSingleLine("", true)
        ),
        true
      );
    });

    it("should return false if symbol has not children", async () => {
      assert.deepEqual(
        await dataServiceAny.hasSymbolChildren(
          getDocumentSymbolItemSingleLine()
        ),
        false
      );
    });
  });
});
