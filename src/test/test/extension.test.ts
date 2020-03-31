import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import * as extension from "../../extension";
import ExtensionController from "../../extensionController";
import { getExtensionContext } from "../util/mockFactory";

describe("extension", () => {
  let context: vscode.ExtensionContext;
  let extensionController: ExtensionController;

  before(() => {
    context = getExtensionContext();
    extensionController = new ExtensionController(context);
  });

  // beforeEach(() => {
  //   extensionController = new ExtensionController(context);
  // });

  afterEach(() => {
    sinon.restore();
  });

  describe("activate", () => {
    it("should register two commands", async () => {
      const registerCommandStub = sinon.stub(
        vscode.commands,
        "registerCommand"
      );
      await extension.activate(context);

      assert.equal(registerCommandStub.calledTwice, true);
    });
  });

  describe("deactivate", () => {
    it("should function exist", () => {
      const spy = sinon.spy(console, "log");
      const actual = typeof extension.deactivate;
      const expected = "function";

      extension.deactivate();

      assert.equal(spy.calledOnce, true);
      assert.equal(actual, expected);
    });
  });

  describe("search", () => {
    it("should extensionController.search method be invoked", () => {
      const searchStub = sinon.stub(extensionController, "search");
      extension.search(extensionController);

      assert.equal(searchStub.calledOnce, true);
    });
  });

  describe("reload", () => {
    it("should vscode.window.showInformationMessage method be invoked", () => {
      const showInformationMessageStub = sinon.stub(
        vscode.window,
        "showInformationMessage"
      );
      extension.reload(extensionController);

      assert.equal(showInformationMessageStub.calledOnce, true);
    });
  });
});
