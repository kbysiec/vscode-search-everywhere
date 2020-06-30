import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import DataConverter from "../../dataConverter";
import * as mock from "../mock/dataConverter.mock";
import Utils from "../../utils";
import {
  getUtilsStub,
  getWorkspaceData,
  getDocumentSymbolItemSingleLine,
  getDocumentSymbolItemMultiLine,
  getDocumentSymbolQpItemMultiLine,
  getItems,
  getQpItems,
  getItem,
  getQpItem,
  getConfigStub,
  getConfiguration,
  getQpItemDocumentSymbolSingleLine,
} from "../util/mockFactory";
import Config from "../../config";
import Icons from "../../interface/icons";
import ItemsFilterPhrases from "../../interface/itemsFilterPhrases";

describe("DataConverter", () => {
  let dataConverter: DataConverter;
  let dataConverterAny: any;
  let utilsStub: Utils;
  let configStub: Config;

  let stubConfig = (
    icons: Icons = {},
    shouldUseItemsFilterPhrases: boolean = false,
    itemsFilterPhrases: ItemsFilterPhrases = {}
  ) => {
    sinon.stub(dataConverterAny, "icons").value(icons);
    sinon
      .stub(dataConverterAny, "shouldUseItemsFilterPhrases")
      .value(shouldUseItemsFilterPhrases);
    sinon
      .stub(dataConverterAny, "itemsFilterPhrases")
      .value(itemsFilterPhrases);
  };

  before(() => {
    utilsStub = getUtilsStub();
    configStub = getConfigStub();
    dataConverter = new DataConverter(utilsStub, configStub);
  });

  beforeEach(() => {
    dataConverterAny = dataConverter as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should data converter be initialized", () => {
      dataConverter = new DataConverter(utilsStub, configStub);

      assert.exists(dataConverter);
    });
  });

  describe("reload", () => {
    it("should fetchConfig method be invoked", () => {
      const fetchConfigStub = sinon.stub(dataConverterAny, "fetchConfig");
      dataConverter.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("convertToQpData", () => {
    it("should return quick pick data", () => {
      stubConfig();

      assert.deepEqual(
        dataConverter.convertToQpData(getWorkspaceData(getItems())),
        getQpItems()
      );
    });

    it("should return empty array", () => {
      assert.deepEqual(dataConverter.convertToQpData(getWorkspaceData()), []);
    });
  });

  describe("getItemFilterPhraseForKind", () => {
    it("should return item filter phrase for given kind", () => {
      const configuration = getConfiguration().searchEverywhere;
      sinon
        .stub(dataConverterAny, "itemsFilterPhrases")
        .value(configuration.itemsFilterPhrases);
      assert.equal(dataConverter.getItemFilterPhraseForKind(0), "$$");
    });
  });

  describe("mapDataToQpData", () => {
    it("should return quick pick data", () => {
      stubConfig();

      const items = getItems();
      assert.deepEqual(
        dataConverterAny.mapDataToQpData(getWorkspaceData(items).items),
        getQpItems()
      );
    });

    it("should return empty array", () => {
      assert.deepEqual(
        dataConverterAny.mapDataToQpData(getWorkspaceData().items),
        []
      );
    });
  });

  describe("mapItemElementToQpItem", () => {
    it("should return quick pick item by invoking mapDocumentSymbolToQpItem method", () => {
      stubConfig();

      assert.deepEqual(
        dataConverterAny.mapItemElementToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine()
      );
    });

    it("should return quick pick item by invoking mapUriToQpItem method", () => {
      stubConfig();

      assert.deepEqual(
        dataConverterAny.mapItemElementToQpItem(getItem(), getItem()),
        getQpItem()
      );
    });
  });

  describe("mapDocumentSymbolToQpItem", () => {
    it("should return quick pick item for single line document symbol", () => {
      const configuration = getConfiguration().searchEverywhere;
      sinon.stub(dataConverterAny, "icons").value({});
      sinon.stub(dataConverterAny, "shouldUseItemsFilterPhrases").value(false);
      sinon
        .stub(dataConverterAny, "itemsFilterPhrases")
        .value(configuration.itemsFilterPhrases);

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine()
      );
    });

    it("should return quick pick item for multi line document symbol with parent", () => {
      stubConfig();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemMultiLine()
        ),
        getDocumentSymbolQpItemMultiLine()
      );
    });

    it(`should return quick pick item for multi line document symbol
      with empty parent`, () => {
      stubConfig();

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemMultiLine(true)
        ),
        getDocumentSymbolQpItemMultiLine(true)
      );
    });

    it(`should return quick pick item for single line document symbol
      with appropriate icon`, () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(configuration.icons);

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine(true)
      );
    });

    it(`should return quick pick item for single line document symbol
      with appropriate filter phrase`, () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(undefined, true, configuration.itemsFilterPhrases);

      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          getItem(),
          getDocumentSymbolItemSingleLine()
        ),
        getQpItemDocumentSymbolSingleLine(false, true)
      );
    });

    it(`should return quick pick item for single line document symbol
      without appropriate filter phrase`, () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig({}, false, configuration.itemsFilterPhrases);

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
    it("should return quick pick item", () => {
      stubConfig();

      assert.deepEqual(dataConverterAny.mapUriToQpItem(getItem()), getQpItem());
    });

    it("should return quick pick item with icon", () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(configuration.icons);

      assert.deepEqual(
        dataConverterAny.mapUriToQpItem(getItem()),
        getQpItem(undefined, undefined, undefined, true)
      );
    });

    it("should return quick pick item with appropriate filter phrase", () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(undefined, true, configuration.itemsFilterPhrases);

      assert.deepEqual(
        dataConverterAny.mapUriToQpItem(getItem()),
        getQpItem(undefined, undefined, undefined, false, true)
      );
    });

    it("should return quick pick item without appropriate filter phrase", () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(undefined, false, configuration.itemsFilterPhrases);

      assert.deepEqual(
        dataConverterAny.mapUriToQpItem(getItem()),
        getQpItem(undefined, undefined, undefined, false, false)
      );
    });
  });

  describe("normalizeUriPath", () => {
    it("should return uri path without workspace part", () => {
      sinon
        .stub(vscode.workspace, "workspaceFolders")
        .value(mock.workspaceFolders);

      assert.equal(
        dataConverterAny.normalizeUriPath(getItem().fsPath),
        getQpItem().uri!.fsPath
      );
    });
  });

  describe("getWorkspaceFoldersPaths", () => {
    it("should return array with two strings", () => {
      sinon
        .stub(vscode.workspace, "workspaceFolders")
        .value(mock.workspaceFolders);
      const workspaceFoldersPaths = dataConverterAny.getWorkspaceFoldersPaths();
      const expected = [
        vscode.Uri.file("/test/path/to/workspace").fsPath,
        vscode.Uri.file("/test2/path2/to2/workspace2").fsPath,
      ];

      assert.deepEqual(workspaceFoldersPaths, expected);
    });
  });

  describe("fetchConfig", () => {
    it("should fetch config", () => {
      const getIconsStub = sinon.stub(dataConverterAny.config, "getIcons");
      const shouldUseItemsFilterPhrasesStub = sinon.stub(
        dataConverterAny.config,
        "shouldUseItemsFilterPhrases"
      );
      const getItemsFilterPhrasesStub = sinon.stub(
        dataConverterAny.config,
        "getItemsFilterPhrases"
      );
      dataConverterAny.fetchConfig();

      assert.equal(getIconsStub.calledOnce, true);
      assert.equal(shouldUseItemsFilterPhrasesStub.calledOnce, true);
      assert.equal(getItemsFilterPhrasesStub.calledOnce, true);
    });
  });
});
