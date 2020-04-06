import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Utils from "../../utils";
import * as mock from "../mock/utils.mock";
import QuickPick from "../../interface/quickPickItem";

describe("Utils", () => {
  let utils: Utils;
  let utilsAny: any;

  before(() => {
    utils = new Utils();
  });

  beforeEach(() => {
    utilsAny = utils as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("prepareQpData", () => {
    it("should return quick pick data", () => {
      assert.deepEqual(utils.prepareQpData(mock.items), mock.qpItems);
    });

    it("should return empty array", () => {
      assert.deepEqual(utils.prepareQpData([]), []);
    });
  });

  describe("normalizeUriPath", () => {
    it("should return uri path without workspace part", () => {
      sinon
        .stub(vscode.workspace, "workspaceFolders")
        .value(mock.workspaceFolders);

      assert.equal(
        utilsAny.normalizeUriPath(mock.item.fsPath),
        mock.qpItem.uri!.fsPath
      );
    });
  });

  describe("getWorkspaceFoldersPaths", () => {
    it("should return array with two strings", () => {
      sinon
        .stub(vscode.workspace, "workspaceFolders")
        .value(mock.workspaceFolders);
      const workspaceFoldersPaths = utilsAny.getWorkspaceFoldersPaths();
      const expected = [
        vscode.Uri.file("/test/path/to/workspace").fsPath,
        vscode.Uri.file("/test2/path2/to2/workspace2").fsPath,
      ];

      assert.deepEqual(workspaceFoldersPaths, expected);
    });
  });
});
