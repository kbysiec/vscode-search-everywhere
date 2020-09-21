import { assert } from "chai";
import { getWorkspaceData, getItemsFilter } from "../util/mockFactory";
import {
  getItems,
  getDocumentSymbolItemSingleLineArray,
  getItem,
  getDocumentSymbolItemSingleLine,
} from "../util/itemMockFactory";
import { getUtilsStub, getConfigStub } from "../util/stubFactory";
import * as mock from "../mock/dataService.mock";
import DataService from "../../dataService";
import Utils from "../../utils";
import Config from "../../config";
import { getTestSetups } from "../testSetup/dataService.testSetup";

describe("DataService", () => {
  let utilsStub: Utils = getUtilsStub();
  let configStub: Config = getConfigStub();
  let dataService: DataService = new DataService(utilsStub, configStub);
  let dataServiceAny: any;
  let setups = getTestSetups(dataService);

  beforeEach(() => {
    utilsStub = getUtilsStub();
    configStub = getConfigStub();
    dataService = new DataService(utilsStub, configStub);
    dataServiceAny = dataService as any;
    setups = getTestSetups(dataService);
  });

  describe("reload", () => {
    it("1: should fetchConfig method be invoked", () => {
      const [fetchConfigStub] = setups.reload1();
      dataService.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("cancel", () => {
    it("1: should setCancelled method be invoked with true parameter", () => {
      const [setCancelledStub] = setups.cancel1();
      dataService.cancel();

      assert.equal(setCancelledStub.calledOnce, true);
    });
  });

  describe("fetchData", () => {
    it(`1: should return array of vscode.Uri or vscode.DocumentSymbol
      items with workspace data`, async () => {
      setups.fetchData1();
      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });
  });

  describe("isUriExistingInWorkspace", () => {
    it("1: should return true if uri exists in workspace", async () => {
      setups.isUriExistingInWorkspace1();

      const item = getItem();
      assert.equal(await dataService.isUriExistingInWorkspace(item), true);
    });

    it("2: should return false if uri does not exist in workspace", async () => {
      setups.isUriExistingInWorkspace2();

      const item = getItem("./test/path/to/workspace");
      assert.equal(await dataService.isUriExistingInWorkspace(item), false);
    });
  });

  describe("fetchUris", () => {
    it("1: should return array of vscode.Uri items", async () => {
      const items = setups.fetchUris1();

      assert.equal(await dataServiceAny.fetchUris(), items);
    });

    it("2: should utils.printErrorMessage method be invoked if error is thrown", async () => {
      const [printErrorMessageStub] = setups.fetchUris2();
      await dataServiceAny.fetchUris();

      assert.equal(printErrorMessageStub.calledOnce, true);
    });
  });

  describe("getUris", () => {
    it("1: should return array of vscode.Uri items by invoking fetchUris method (uris param not given)", async () => {
      const items = setups.getUris1();
      assert.equal(await dataServiceAny.getUris(), items);
    });

    it("2: should return array of vscode.Uri items by invoking fetchUris method (given uris param is an empty array)", async () => {
      const items = setups.getUris2();
      assert.equal(await dataServiceAny.getUris([]), items);
    });

    it("3: should return array of vscode.Uri items (given uris param is an array with items)", async () => {
      const items = getItems();
      assert.equal(await dataServiceAny.getUris(items), items);
    });
  });

  describe("getIncludePattern", () => {
    it("1: should return string containing include pattern", () => {
      const pattern = setups.getIncludePattern1();
      assert.equal(dataServiceAny.getIncludePattern(), pattern);
    });
  });

  describe("getExcludePatterns", () => {
    it("1: should return string[] containing exclude patterns", () => {
      const patterns = setups.getExcludePatterns1();
      assert.equal(dataServiceAny.getExcludePatterns(), patterns);
    });

    it("2: should return string[] containing files and search exclude patterns", () => {
      const patterns = setups.getExcludePatterns2();
      assert.equal(dataServiceAny.getExcludePatterns(), patterns);
    });
  });

  describe("getExcludePatternsAsString", () => {
    it("1: should return empty string if given array is empty", () => {
      const patterns: string[] = [];

      assert.equal(
        dataServiceAny.getExcludePatternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`2: should return string with one pattern if given array
      contains one element`, () => {
      const patterns = ["**/node_modules/**"];

      assert.equal(
        dataServiceAny.getExcludePatternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`3: should return string with patterns separated by comma surrounded
      with curly braces if given array contains more than one element`, () => {
      const patterns = [
        "**/node_modules/**",
        "**/bower_components/**",
        "**/yarn.lock",
      ];

      assert.equal(
        dataServiceAny.getExcludePatternsAsString(patterns),
        `{${patterns.join(",")}}`
      );
    });
  });

  describe("includeSymbols", () => {
    it("1: should include symbols to workspaceData", async () => {
      setups.includeSymbols1();
      const workspaceData = getWorkspaceData();
      await dataServiceAny.includeSymbols(workspaceData, [getItem()]);

      assert.equal(workspaceData.count, 3);
    });

    it("2: should repeat trial to get symbols for file if returned undefined", async () => {
      const [sleepStub] = setups.includeSymbol2();
      const workspaceData = getWorkspaceData();
      await dataServiceAny.includeSymbols(workspaceData, [getItem()]);

      assert.equal(workspaceData.count, 0);
      assert.equal(sleepStub.callCount, 9);
    });

    it("3: should emit onDidItemIndexed event after item indexing", async () => {
      const eventEmitter = setups.includeSymbol3();
      const workspaceData = getWorkspaceData();
      await dataServiceAny.includeSymbols(workspaceData, [getItem()]);

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it(`4: should utils.clearWorkspaceData method be invoked
      if isCancelled equals to true`, async () => {
      const [clearWorkspaceDataStub] = setups.includeSymbol4();

      const workspaceData = getWorkspaceData();
      await dataServiceAny.includeSymbols(workspaceData, [getItem()]);

      assert.equal(clearWorkspaceDataStub.calledOnce, true);
    });
  });

  describe("includeUris", () => {
    it("1: should include uris to empty workspaceData", () => {
      setups.includeUris1();
      const workspaceData = getWorkspaceData();
      dataServiceAny.includeUris(workspaceData, getItems());

      assert.equal(workspaceData.count, 2);
    });

    it("2: should include uris to workspaceData containing data", () => {
      setups.includeUris2();
      const workspaceData = getWorkspaceData([getItem()]);
      dataServiceAny.includeUris(workspaceData, getItems());

      assert.equal(workspaceData.count, 2);
    });

    it(`3: should utils.clearWorkspaceData method be invoked
      if isCancelled equals to true`, async () => {
      const [clearWorkspaceDataStub] = setups.includeUris3();
      const workspaceData = getWorkspaceData([getItem()]);
      dataServiceAny.includeUris(workspaceData, getItems());

      assert.equal(clearWorkspaceDataStub.calledOnce, true);
    });
  });

  describe("ifUriExistsInArray", () => {
    it("1: should return true if uri already is included in array", () => {
      assert.equal(
        dataServiceAny.ifUriExistsInArray(getItems(), getItem()),
        true
      );
    });

    it("2: should return false if uri already is not included in array", () => {
      assert.equal(dataServiceAny.ifUriExistsInArray([], getItem()), false);
    });

    it("3: should return false if given item is vscode.DocumentSymbol not vscode.Uri type", () => {
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
    it("1: should return array of vscode.DocumentSymbol for given uri", async () => {
      const documentSymbolItems = setups.getSymbolsForUri1();

      assert.deepEqual(
        await dataServiceAny.getSymbolsForUri(getItem()),
        documentSymbolItems
      );
    });

    it("2: should return undefined", async () => {
      setups.getSymbolsForUri2();

      assert.deepEqual(
        await dataServiceAny.getSymbolsForUri(getItem()),
        undefined
      );
    });
  });

  describe("loadAllSymbolsForUri", () => {
    it(`1: should vscode.commands.executeCommand be method invoked
      with vscode.executeDocumentSymbolProvider given as first parameter`, async () => {
      const [executeCommandStub] = setups.loadAllSymbolsForUri1();
      await dataServiceAny.loadAllSymbolsForUri(getItem());

      assert.equal(
        executeCommandStub.calledWith("vscode.executeDocumentSymbolProvider"),
        true
      );
    });
  });

  describe("reduceAndFlatSymbolsArrayForUri", () => {
    it("1: should return flat array of vscode.DocumentSymbol", async () => {
      setups.reduceAndFlatSymbolsArrayForUri1();
      assert.deepEqual(
        await dataServiceAny.reduceAndFlatSymbolsArrayForUri(
          getDocumentSymbolItemSingleLineArray(2, true)
        ),
        mock.flatDocumentSymbolItems
      );
    });
  });

  describe("hasSymbolChildren", () => {
    it("1: should return true if symbol has children", async () => {
      assert.deepEqual(
        await dataServiceAny.hasSymbolChildren(
          getDocumentSymbolItemSingleLine("", true)
        ),
        true
      );
    });

    it("2: should return false if symbol has not children", async () => {
      assert.deepEqual(
        await dataServiceAny.hasSymbolChildren(
          getDocumentSymbolItemSingleLine()
        ),
        false
      );
    });
  });

  describe("filterUris", () => {
    it("1: should return array of filtered vscode.Uri", () => {
      setups.filterUris1();

      assert.deepEqual(dataServiceAny.filterUris(getItems(3)), [
        getItem(undefined, 2),
        getItem(undefined, 3),
      ]);
    });
  });

  describe("filterSymbols", () => {
    it("1: should return array of filtered vscode.DocumentSymbol", () => {
      setups.filterSymbols1();

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
    it("1: should return true if given vscode.Uri kind is allowed", () => {
      setups.isUriValid1();
      assert.equal(dataServiceAny.isUriValid(getItem()), true);
    });

    it("2: should return false if given vscode.Uri kind is not allowed", () => {
      setups.isUriValid2();
      assert.equal(dataServiceAny.isSymbolValid(getItem()), false);
    });
  });

  describe("isSymbolValid", () => {
    it(`1: should return true if given vscode.DocumentSymbol
      is of kind which is allowed`, () => {
      setups.isSymbolValid1();
      assert.equal(
        dataServiceAny.isSymbolValid(getDocumentSymbolItemSingleLine()),
        true
      );
    });

    it(`2: should return false if given vscode.DocumentSymbol
      is of kind which is not allowed`, () => {
      setups.isSymbolValid2();
      assert.equal(
        dataServiceAny.isSymbolValid(getDocumentSymbolItemSingleLine()),
        false
      );
    });
  });

  describe("isItemValid", () => {
    it("1: should return true if itemsFilter is empty", () => {
      setups.isItemValid1();
      assert.equal(dataServiceAny.isItemValid(getItem()), true);
    });

    it(`2: should return true if given item is of allowed kind
      and its name is not ignored`, () => {
      setups.isItemValid2();
      assert.equal(dataServiceAny.isItemValid(getItem()), true);
    });

    it(`3: should return false if given item is not of allowed kind
      and its name is not ignored`, () => {
      setups.isItemValid3();
      assert.equal(dataServiceAny.isItemValid(getItem()), false);
    });

    it("4: should return false if given item is of ignored kind", () => {
      setups.isItemValid4();
      assert.equal(dataServiceAny.isItemValid(getItem()), false);
    });

    it("5: should return false if given item's name is ignored", () => {
      setups.isItemValid5();
      assert.equal(dataServiceAny.isItemValid(getItem()), false);
    });
  });

  describe("isInAllowedKinds", () => {
    it("1: should return true if given kind is allowed", () => {
      assert.equal(
        dataServiceAny.isInAllowedKinds(getItemsFilter([1, 2]), 1),
        true
      );
    });

    it("2: should return false if given kind is not allowed", () => {
      assert.equal(
        dataServiceAny.isInAllowedKinds(getItemsFilter([1, 2]), 3),
        false
      );
    });
  });

  describe("isNotInIgnoredKinds", () => {
    it("1: should return true if given kind is not ignored", () => {
      assert.equal(
        dataServiceAny.isNotInIgnoredKinds(getItemsFilter([], [1, 2]), 3),
        true
      );
    });

    it("2: should return false if given kind is ignored", () => {
      assert.equal(
        dataServiceAny.isNotInIgnoredKinds(getItemsFilter([], [1, 2]), 2),
        false
      );
    });
  });

  describe("isNotInIgnoredNames", () => {
    it("1: should return true if given name is not ignored", () => {
      assert.equal(
        dataServiceAny.isNotInIgnoredNames(
          getItemsFilter([], [], ["test"]),
          "counter"
        ),
        true
      );
    });

    it("2: should return false if given name is ignored", () => {
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
    it("1: should fetch config", () => {
      const [
        getIncludeStub,
        getExcludeStub,
        shouldUseFilesAndSearchExcludeStub,
        getFilesAndSearchExcludeStub,
        getItemsFilterStub,
      ] = setups.fetchConfig1();
      dataServiceAny.fetchConfig();

      assert.equal(getIncludeStub.calledOnce, true);
      assert.equal(getExcludeStub.calledOnce, true);
      assert.equal(shouldUseFilesAndSearchExcludeStub.calledOnce, true);
      assert.equal(getFilesAndSearchExcludeStub.calledOnce, true);
      assert.equal(getItemsFilterStub.calledOnce, true);
    });
  });

  describe("setCancelled", () => {
    it("1: should set state of isCancelled to the given parameter value", () => {
      dataServiceAny.setCancelled(true);

      assert.equal(dataServiceAny.isCancelled, true);
    });
  });
});
