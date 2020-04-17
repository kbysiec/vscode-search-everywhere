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
} from "../util/mockFactory";

describe("DataConverter", () => {
  let dataConverter: DataConverter;
  let dataConverterAny: any;
  let utilsStub: Utils;

  before(() => {
    utilsStub = getUtilsStub();
    dataConverter = new DataConverter(utilsStub);
  });

  beforeEach(() => {
    dataConverterAny = dataConverter as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should data converter be initialized", () => {
      dataConverter = new DataConverter(utilsStub);

      assert.exists(dataConverter);
    });
  });

  describe("convertToQpData", () => {
    it("should return quick pick data", () => {
      assert.deepEqual(
        dataConverter.convertToQpData(getWorkspaceData(mock.items)),
        mock.qpItems
      );
    });

    it("should return empty array", () => {
      assert.deepEqual(dataConverter.convertToQpData(getWorkspaceData()), []);
    });
  });

  describe("mapDataToQpData", () => {
    it("should return quick pick data", () => {
      assert.deepEqual(
        dataConverterAny.mapDataToQpData(getWorkspaceData(mock.items).items),
        mock.qpItems
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
      assert.deepEqual(
        dataConverterAny.mapItemElementToQpItem(
          mock.uriItem,
          getDocumentSymbolItemSingleLine()
        ),
        mock.qpItemDocumentSymbolSingleLine
      );
    });

    it("should return quick pick item by invoking mapUriToQpItem method", () => {
      assert.deepEqual(
        dataConverterAny.mapItemElementToQpItem(mock.uriItem, mock.uriItem),
        mock.qpItem
      );
    });
  });

  describe("mapDocumentSymbolToQpItem", () => {
    it("should return quick pick item for single line document symbol", () => {
      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          mock.uriItem,
          getDocumentSymbolItemSingleLine()
        ),
        mock.qpItemDocumentSymbolSingleLine
      );
    });

    it("should return quick pick item for multi line document symbol with parent", () => {
      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          mock.uriItem,
          getDocumentSymbolItemMultiLine()
        ),
        getDocumentSymbolQpItemMultiLine()
      );
    });

    it("should return quick pick item for multi line document symbol with empty parent", () => {
      assert.deepEqual(
        dataConverterAny.mapDocumentSymbolToQpItem(
          mock.uriItem,
          getDocumentSymbolItemMultiLine(true)
        ),
        getDocumentSymbolQpItemMultiLine(true)
      );
    });
  });

  describe("mapUriToQpItem", () => {
    it("should return quick pick item", () => {
      assert.deepEqual(
        dataConverterAny.mapUriToQpItem(mock.uriItem),
        mock.qpItem
      );
    });
  });

  describe("normalizeUriPath", () => {
    it("should return uri path without workspace part", () => {
      sinon
        .stub(vscode.workspace, "workspaceFolders")
        .value(mock.workspaceFolders);

      assert.equal(
        dataConverterAny.normalizeUriPath(mock.item.fsPath),
        mock.qpItem.uri!.fsPath
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
});
