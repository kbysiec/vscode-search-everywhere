import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Utils from "../../utils";
import {
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
} from "../util/mockFactory";

describe("Utils", () => {
  let utils: Utils;

  before(() => {
    utils = new Utils();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("hasWorkspaceAnyFolder", () => {
    it("should return true if workspace contains at least one folder", () => {
      sinon.stub(vscode.workspace, "workspaceFolders").value(["/#"]);

      assert.equal(utils.hasWorkspaceAnyFolder(), true);
    });

    it("should return false if workspace does not contain any folder", () => {
      sinon.stub(vscode.workspace, "workspaceFolders").value([]);

      assert.equal(utils.hasWorkspaceAnyFolder(), false);
    });
  });

  describe("hasWorkspaceChanged", () => {
    it("should return true if amount of opened folders in workspace has changed", () => {
      assert.equal(
        utils.hasWorkspaceChanged(getWorkspaceFoldersChangeEvent(true)),
        true
      );
    });

    it("should return false if amount of opened folders in workspace has not changed", () => {
      assert.equal(
        utils.hasWorkspaceChanged(getWorkspaceFoldersChangeEvent(false)),
        false
      );
    });
  });

  describe("hasConfigurationChanged", () => {
    it("should return true if extension configuration has changed", () => {
      assert.equal(
        utils.hasConfigurationChanged(getConfigurationChangeEvent(true)),
        true
      );
    });

    it("should return false if extension configuration has not changed", () => {
      assert.equal(
        utils.hasConfigurationChanged(getConfigurationChangeEvent(false)),
        false
      );
    });
  });

  describe("printNoFolderOpenedMessage", () => {
    it("should display notification", async () => {
      const showInformationMessageStub = sinon.stub(
        vscode.window,
        "showInformationMessage"
      );
      utils.printNoFolderOpenedMessage();

      assert.equal(showInformationMessageStub.calledOnce, true);
    });
  });
});
