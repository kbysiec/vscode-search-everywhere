import * as vscode from "vscode";
import { assert } from "chai";
import { getWorkspaceData } from "../util/mockFactory";
import {
  getQpItems,
  getQpItemDocumentSymbolSingleLine,
  getQpItem,
  getDocumentSymbolQpItemMultiLine,
} from "../util/qpItemMockFactory";
import {
  getItems,
  getItem,
  getDocumentSymbolItemSingleLine,
  getDocumentSymbolItemMultiLine,
} from "../util/itemMockFactory";
import { getUtilsStub, getConfigStub } from "../util/stubFactory";
import DataConverter from "../../dataConverter";
import Utils from "../../utils";
import Config from "../../config";
import { getTestSetups } from "../testSetup/dataConverter.testSetup";

describe("DataConverter", () => {
  let utilsStub: Utils = getUtilsStub();
  let configStub: Config = getConfigStub();
  let dataConverter: DataConverter = new DataConverter(utilsStub, configStub);
  let dataConverterAny: any;
  let setups = getTestSetups(dataConverter);

  beforeEach(() => {
    utilsStub = getUtilsStub();
    configStub = getConfigStub();
    dataConverter = new DataConverter(utilsStub, configStub);
    dataConverterAny = dataConverter as any;
    setups = getTestSetups(dataConverter);
  });

  describe("reload", () => {
    it("1: should fetchConfig method be invoked", () => {
      const [fetchConfigStub] = setups.reload1();
      dataConverter.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("cancel", () => {
    it("1: should setCancelled method be invoked with true parameter", () => {
      const [setCancelledStub] = setups.cancel1();
      dataConverter.cancel();

      assert.equal(setCancelledStub.calledOnce, true);
    });
  });

  describe("convertToQpData", () => {
    it("1: should return quick pick data", () => {
      setups.convertToQpData1();
      assert.deepEqual(
        dataConverter.convertToQpData(getWorkspaceData(getItems())),
        getQpItems()
      );
    });

    it("2: should return empty array", () => {
      assert.deepEqual(dataConverter.convertToQpData(getWorkspaceData()), []);
    });
  });

  describe("getItemFilterPhraseForKind", () => {
    it("1: should return item filter phrase for given kind", () => {
      setups.getItemFilterPhraseForKind1();
      assert.equal(dataConverter.getItemFilterPhraseForKind(0), "$$");
    });
  });

  describe("mapDataToQpData", () => {
    it("1: should return quick pick data", () => {
      setups.mapDataToQpData1();
      const items = getItems();
      assert.deepEqual(
        dataConverterAny.mapDataToQpData(getWorkspaceData(items).items),
        getQpItems()
      );
    });

    it("2: should return empty array", () => {
      assert.deepEqual(
        dataConverterAny.mapDataToQpData(getWorkspaceData().items),
        []
      );
    });

    it("3: should return empty array if isCancelled equal to true", () => {
      setups.mapDataToQpData3();
      const items = getItems();
      assert.deepEqual(
        dataConverterAny.mapDataToQpData(getWorkspaceData(items).items),
        []
      );
    });
  });

  describe("mapItemElementToQpItem", () => {
    it("1: should return quick pick item by invoking mapDocumentSymbolToQpItem method", () => {
      setups.mapItemElementToQpItem1();

      assert.deepEqual(
        dataConverterAny.mapItemElementToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine()
      );
    });

    it("2: should return quick pick item by invoking mapUriToQpItem method", () => {
      setups.mapItemElementToQpItem2();

      assert.deepEqual(
        dataConverterAny.mapItemElementToQpItem(getItem(), getItem()),
        getQpItem()
      );
    });
  });

  describe("mapDocumentSymbolToQpItem", () => {
    it("1: should return quick pick item for single line document symbol", () => {
      setups.mapDocumentSymbolToQpItem1();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine()
      );
    });

    it("2: should return quick pick item for multi line document symbol with parent", () => {
      setups.mapDocumentSymbolToQpItem2();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemMultiLine(true)
        ),
        getDocumentSymbolQpItemMultiLine(true)
      );
    });

    it(`3: should return quick pick item for multi line document symbol
      with empty parent`, () => {
      setups.mapDocumentSymbolToQpItem3();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemMultiLine(false)
        ),
        getDocumentSymbolQpItemMultiLine(false)
      );
    });

    it(`4: should return quick pick item for single line document symbol
      with appropriate icon`, () => {
      setups.mapDocumentSymbolToQpItem4();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine(true)
      );
    });

    it(`5: should return quick pick item for single line document symbol
      with appropriate filter phrase`, () => {
      setups.mapDocumentSymbolToQpItem5();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine(false, true)
      );
    });

    it(`6: should return quick pick item for single line document symbol
      without appropriate filter phrase`, () => {
      setups.mapDocumentSymbolToQpItem6();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine(false, false)
      );
    });
  });

  describe("mapUriToQpItem", () => {
    it("1: should return quick pick item", () => {
      setups.mapUriToQpItem1();

      assert.deepEqual(dataConverterAny.mapUriToQpItem(getItem()), getQpItem());
    });

    it("2: should return quick pick item with icon", () => {
      setups.mapUriToQpItem2();

      assert.deepEqual(
        dataConverterAny.mapUriToQpItem(getItem()),
        getQpItem(undefined, undefined, undefined, true)
      );
    });

    it("3: should return quick pick item with appropriate filter phrase", () => {
      setups.mapUriToQpItem3();

      assert.deepEqual(
        dataConverterAny.mapUriToQpItem(getItem()),
        getQpItem(undefined, undefined, undefined, false, true)
      );
    });

    it("4: should return quick pick item without appropriate filter phrase", () => {
      setups.mapUriToQpItem4();

      assert.deepEqual(
        dataConverterAny.mapUriToQpItem(getItem()),
        getQpItem(undefined, undefined, undefined, false, false)
      );
    });
  });

  describe("normalizeUriPath", () => {
    it("1: should return uri path without workspace part", () => {
      setups.normalizeUriPath1();

      assert.equal(
        dataConverterAny.normalizeUriPath(getItem().fsPath),
        getQpItem().uri!.fsPath
      );
    });
  });

  describe("getWorkspaceFoldersPaths", () => {
    it("1: should return array with two strings", () => {
      setups.getWorkspaceFoldersPaths1();

      const workspaceFoldersPaths = dataConverterAny.getWorkspaceFoldersPaths();
      const expected = [
        vscode.Uri.file("/test/path/to/workspace").fsPath,
        vscode.Uri.file("/test2/path2/to2/workspace2").fsPath,
      ];

      assert.deepEqual(workspaceFoldersPaths, expected);
    });
  });

  describe("fetchConfig", () => {
    it("1: should fetch config", () => {
      const [
        getIconsStub,
        shouldUseItemsFilterPhrasesStub,
        getItemsFilterPhrasesStub,
      ] = setups.fetchConfig1();

      dataConverterAny.fetchConfig();

      assert.equal(getIconsStub.calledOnce, true);
      assert.equal(shouldUseItemsFilterPhrasesStub.calledOnce, true);
      assert.equal(getItemsFilterPhrasesStub.calledOnce, true);
    });
  });

  describe("setCancelled", () => {
    it("1: should set state of isCancelled to the given parameter value", () => {
      dataConverterAny.setCancelled(true);

      assert.equal(dataConverterAny.isCancelled, true);
    });
  });
});
