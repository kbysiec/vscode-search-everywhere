import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import DataConverter from "../../dataConverter";
import * as mock from "../mock/dataConverter.mock";
import QuickPick from "../../interface/quickPickItem";

describe("DataConverter", () => {
  let dataConverter: DataConverter;
  let dataConverterAny: any;

  before(() => {
    dataConverter = new DataConverter();
  });

  beforeEach(() => {
    dataConverterAny = dataConverter as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("prepareQpData", () => {
    it("should return quick pick data", () => {
      assert.deepEqual(dataConverter.prepareQpData(mock.items), mock.qpItems);
    });

    it("should return empty array", () => {
      assert.deepEqual(dataConverter.prepareQpData([]), []);
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
