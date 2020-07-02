import * as vscode from "vscode";
import * as sinon from "sinon";
import { assert } from "chai";
import {
  getWorkspaceData,
  getEventEmitter,
  getItemsFilter,
} from "../util/mockFactory";
import {
  getItems,
  getDocumentSymbolItemSingleLineArray,
  getItem,
  getDocumentSymbolItemSingleLine,
} from "../util/itemMockFactory";
import { getUtilsStub, getConfigStub } from "../util/stubFactory";
import * as mock from "../mock/dataService.mock";
import ItemsFilter from "../../interface/itemsFilter";
import DataService from "../../dataService";
import Utils from "../../utils";
import Config from "../../config";

describe("DataService", () => {
  let dataService: DataService;
  let dataServiceAny: any;
  let utilsStub: Utils;
  let configStub: Config;

  let stubConfig = (
    includePatterns: string[] = [],
    excludePatterns: string[] = [],
    shouldUseFilesAndSearchExclude: boolean = false,
    filesAndSearchExcludePatterns: string[] = [],
    itemsFilter: ItemsFilter = {}
  ) => {
    sinon.stub(dataServiceAny, "includePatterns").value(includePatterns);
    sinon.stub(dataServiceAny, "excludePatterns").value(excludePatterns);
    sinon
      .stub(dataServiceAny, "shouldUseFilesAndSearchExclude")
      .value(shouldUseFilesAndSearchExclude);
    sinon
      .stub(dataServiceAny, "filesAndSearchExcludePatterns")
      .value(filesAndSearchExcludePatterns);
    sinon.stub(dataServiceAny, "itemsFilter").value(itemsFilter);
  };

  before(() => {
    utilsStub = getUtilsStub();
    configStub = getConfigStub();
    dataService = new DataService(utilsStub, configStub);
  });

  beforeEach(() => {
    dataServiceAny = dataService as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("reload", () => {
    it("should fetchConfig method be invoked", () => {
      const fetchConfigStub = sinon.stub(dataServiceAny, "fetchConfig");
      dataService.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("fetchData", () => {
    it(`should return array of vscode.Uri or vscode.DocumentSymbol
      items with workspace data`, async () => {
      stubConfig();
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

  describe("isUriExistingInWorkspace", () => {
    it("should return true if uri exists in workspace", async () => {
      sinon
        .stub(dataServiceAny, "fetchUris")
        .returns(Promise.resolve(getItems()));

      const item = getItem();
      assert.equal(await dataService.isUriExistingInWorkspace(item), true);
    });

    it("should return false if uri does not exist in workspace", async () => {
      sinon
        .stub(dataServiceAny, "fetchUris")
        .returns(Promise.resolve(getItems()));

      const item = getItem("./test/path/to/workspace");
      assert.equal(await dataService.isUriExistingInWorkspace(item), false);
    });
  });

  describe("fetchUris", () => {
    it("should return array of vscode.Uri items", async () => {
      stubConfig();
      const items = getItems();
      sinon.stub(vscode.workspace, "findFiles").returns(Promise.resolve(items));

      assert.equal(await dataServiceAny.fetchUris(), items);
    });
  });

  describe("getUris", () => {
    it("should return array of vscode.Uri items by invoking fetchUris method (uris param not given)", async () => {
      const items = getItems();
      sinon.stub(dataServiceAny, "fetchUris").returns(Promise.resolve(items));

      assert.equal(await dataServiceAny.getUris(), items);
    });

    it("should return array of vscode.Uri items by invoking fetchUris method (given uris param is an empty array)", async () => {
      const items = getItems();
      sinon.stub(dataServiceAny, "fetchUris").returns(Promise.resolve(items));

      assert.equal(await dataServiceAny.getUris([]), items);
    });

    it("should return array of vscode.Uri items (given uris param is an array with items)", async () => {
      const items = getItems();

      assert.equal(await dataServiceAny.getUris(items), items);
    });
  });

  describe("getIncludePatterns", () => {
    it("should return string[] containing include patterns", () => {
      const patterns = ["**/*.{js}"];
      stubConfig(patterns, [], false, [], getItemsFilter([1, 2]));

      assert.equal(dataServiceAny.getIncludePatterns(), patterns);
    });
  });

  describe("getExcludePatterns", () => {
    it("should return string[] containing exclude patterns", () => {
      const patterns = ["**/node_modules/**"];
      stubConfig([], patterns, false, []);

      assert.equal(dataServiceAny.getExcludePatterns(), patterns);
    });

    it("should return string[] containing files and search exclude patterns", () => {
      const patterns = ["**/node_modules/**"];
      stubConfig([], [], true, patterns);

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

    it("should emit onDidItemIndexed event after item indexing", async () => {
      const eventEmitter = getEventEmitter();
      sinon
        .stub(dataServiceAny, "onDidItemIndexedEventEmitter")
        .value(eventEmitter);
      sinon
        .stub(dataServiceAny, "getSymbolsForUri")
        .returns(Promise.resolve(getDocumentSymbolItemSingleLineArray(3)));
      const workspaceData = getWorkspaceData();
      await dataServiceAny.includeSymbols(workspaceData, [getItem()]);

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("includeUris", () => {
    it("should include uris to empty workspaceData", () => {
      stubConfig();
      const workspaceData = getWorkspaceData();
      dataServiceAny.includeUris(workspaceData, getItems());

      assert.equal(workspaceData.count, 2);
    });

    it("should include uris to workspaceData containing data", () => {
      stubConfig();
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
      stubConfig();
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

  describe("filterUris", () => {
    it("should return array of filtered vscode.Uri", () => {
      stubConfig([], [], false, [], getItemsFilter([], [], ["fake-1"]));

      assert.deepEqual(dataServiceAny.filterUris(getItems(3)), [
        getItem(undefined, 2),
        getItem(undefined, 3),
      ]);
    });
  });

  describe("filterSymbols", () => {
    it("should return array of filtered vscode.DocumentSymbol", () => {
      stubConfig([], [], false, [], getItemsFilter([], [1, 3, 4]));

      assert.deepEqual(
        dataServiceAny.filterSymbols(
          getDocumentSymbolItemSingleLineArray(5, false, 3, [1, 2, 3, 4, 2])
        ),
        [
          getDocumentSymbolItemSingleLine(2, false, 2),
          getDocumentSymbolItemSingleLine(5, false, 2),
        ]
      );
    });
  });

  describe("isUriValid", () => {
    it("should return true if given vscode.Uri kind is allowed", () => {
      stubConfig([], [], false, [], getItemsFilter([0, 1]));
      assert.equal(dataServiceAny.isUriValid(getItem()), true);
    });

    it("should return false if given vscode.Uri kind is not allowed", () => {
      stubConfig([], [], false, [], getItemsFilter([2, 3]));
      assert.equal(dataServiceAny.isSymbolValid(getItem()), false);
    });
  });

  describe("isSymbolValid", () => {
    it(`should return true if given vscode.DocumentSymbol
      is of kind which is allowed`, () => {
      stubConfig([], [], false, [], getItemsFilter([1, 2]));
      assert.equal(
        dataServiceAny.isSymbolValid(getDocumentSymbolItemSingleLine()),
        true
      );
    });

    it(`should return false if given vscode.DocumentSymbol
      is of kind which is not allowed`, () => {
      stubConfig([], [], false, [], getItemsFilter([2, 3]));
      assert.equal(
        dataServiceAny.isSymbolValid(getDocumentSymbolItemSingleLine()),
        false
      );
    });
  });

  describe("isItemValid", () => {
    it("should return true if itemsFilter is empty", () => {
      stubConfig();
      assert.equal(dataServiceAny.isItemValid(getItem()), true);
    });

    it(`should return true if given item is of allowed kind
      and its name is not ignored`, () => {
      stubConfig([], [], false, [], getItemsFilter([0]));
      assert.equal(dataServiceAny.isItemValid(getItem()), true);
    });

    it(`should return false if given item is not of allowed kind
      and its name is not ignored`, () => {
      stubConfig([], [], false, [], getItemsFilter([1]));
      assert.equal(dataServiceAny.isItemValid(getItem()), false);
    });

    it("should return false if given item is of ignored kind", () => {
      stubConfig([], [], false, [], getItemsFilter([], [0]));
      assert.equal(dataServiceAny.isItemValid(getItem()), false);
    });

    it("should return false if given item's name is ignored", () => {
      stubConfig([], [], false, [], getItemsFilter([], [], ["fake"]));
      assert.equal(dataServiceAny.isItemValid(getItem()), false);
    });
  });

  describe("isInAllowedKinds", () => {
    it("should return true if given kind is allowed", () => {
      assert.equal(
        dataServiceAny.isInAllowedKinds(getItemsFilter([1, 2]), 1),
        true
      );
    });

    it("should return false if given kind is not allowed", () => {
      assert.equal(
        dataServiceAny.isInAllowedKinds(getItemsFilter([1, 2]), 3),
        false
      );
    });
  });

  describe("isNotInIgnoredKinds", () => {
    it("should return true if given kind is not ignored", () => {
      assert.equal(
        dataServiceAny.isNotInIgnoredKinds(getItemsFilter([], [1, 2]), 3),
        true
      );
    });

    it("should return false if given kind is ignored", () => {
      assert.equal(
        dataServiceAny.isNotInIgnoredKinds(getItemsFilter([], [1, 2]), 2),
        false
      );
    });
  });

  describe("isNotInIgnoredNames", () => {
    it("should return true if given name is not ignored", () => {
      assert.equal(
        dataServiceAny.isNotInIgnoredNames(
          getItemsFilter([], [], ["test"]),
          "counter"
        ),
        true
      );
    });

    it("should return false if given name is ignored", () => {
      assert.equal(
        dataServiceAny.isNotInIgnoredNames(
          getItemsFilter([], [], ["test"]),
          "testing"
        ),
        false
      );
    });
  });

  describe("fetchConfig", () => {
    it("should fetch config", () => {
      const getIncludeStub = sinon.stub(dataServiceAny.config, "getInclude");
      const getExcludeStub = sinon.stub(dataServiceAny.config, "getExclude");
      const shouldUseFilesAndSearchExcludeStub = sinon.stub(
        dataServiceAny.config,
        "shouldUseFilesAndSearchExclude"
      );
      const getFilesAndSearchExcludeStub = sinon.stub(
        dataServiceAny.config,
        "getFilesAndSearchExclude"
      );
      const getItemsFilterStub = sinon.stub(
        dataServiceAny.config,
        "getItemsFilter"
      );
      dataServiceAny.fetchConfig();

      assert.equal(getIncludeStub.calledOnce, true);
      assert.equal(getExcludeStub.calledOnce, true);
      assert.equal(shouldUseFilesAndSearchExcludeStub.calledOnce, true);
      assert.equal(getFilesAndSearchExcludeStub.calledOnce, true);
      assert.equal(getItemsFilterStub.calledOnce, true);
    });
  });
});
