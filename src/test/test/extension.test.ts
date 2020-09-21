import * as vscode from "vscode";
import { assert } from "chai";
import { getExtensionContext } from "../util/mockFactory";
import * as extension from "../../extension";
import ExtensionController from "../../extensionController";
import { getTestSetups } from "../testSetup/extension.testSetup";

describe("extension", () => {
  let context: vscode.ExtensionContext = getExtensionContext();
  let extensionController: ExtensionController = new ExtensionController(
    context
  );
  let setups = getTestSetups(extensionController);

  beforeEach(() => {
    context = getExtensionContext();
    extensionController = new ExtensionController(context);
    setups = getTestSetups(extensionController);
  });

  describe("activate", () => {
    it("1: should register two commands", async () => {
      const [registerCommandStub] = setups.activate1();
      await extension.activate(context);

      assert.equal(registerCommandStub.calledTwice, true);
    });
  });

  describe("deactivate", () => {
    it("1: should function exist", () => {
      const [logStub] = setups.deactivate1();
      extension.deactivate();

      assert.equal(logStub.calledOnce, true);
      assert.equal(typeof extension.deactivate, "function");
    });
  });

  describe("search", () => {
    it("1: should extensionController.search method be invoked", () => {
      const [searchStub] = setups.search1();
      extension.search(extensionController);

      assert.equal(searchStub.calledOnce, true);
    });
  });

  describe("reload", () => {
    it("1: should extensionController.reload method be invoked", () => {
      const [reloadStub] = setups.reload1();
      extension.reload(extensionController);

      assert.equal(reloadStub.calledOnce, true);
    });
  });
});
