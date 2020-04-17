import * as vscode from "vscode";
import { assert, expect } from "chai";
import * as sinon from "sinon";
import Utils from "../../utils";
import {
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
  getWorkspaceData,
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

  describe("createWorkspaceData", () => {
    it("should create workspaceData object", () => {
      assert.deepEqual(utils.createWorkspaceData(), getWorkspaceData());
    });
  });

  describe("sleep", () => {
    it("should be fulfilled", async () => {
      const clock = sinon.useFakeTimers();
      let fulfilled = false;
      const sleepPromise = utils.sleep(1000);

      sleepPromise.then(() => {
        fulfilled = true;
      });

      // let event loop cycle
      // https://stackoverflow.com/questions/51526312/testing-setinterval-with-sinon-faketimers-not-working
      await Promise.resolve();
      clock.tick(999);
      expect(fulfilled).to.be.false;
      clock.tick(2);
      await Promise.resolve();
      expect(fulfilled).to.be.true;

      clock.restore();
    });
  });

  describe("getSplitter", () => {
    it("should return splitter string", () => {
      assert.equal(utils.getSplitter(), "§&§");
    });
  });
});
