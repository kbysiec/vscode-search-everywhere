import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import ExtensionController from "../../extensionController";
import { getExtensionContext, getQpItems } from "../util/mockFactory";

describe("ExtensionController", () => {
  let context: vscode.ExtensionContext;
  let extensionController: ExtensionController;
  let extensionControllerAny: any;

  before(() => {
    context = getExtensionContext();
    extensionController = new ExtensionController(context);
  });

  beforeEach(() => {
    extensionControllerAny = extensionController as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should extension controller be initialized", () => {
      extensionController = new ExtensionController(context);

      assert.exists(extensionController);
    });
  });

  describe("search", () => {
    it(`should quickPick.show method be invoked if workspace contains
      at least one folder opened`, async () => {
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(true);
      await extensionController.search();

      assert.equal(showStub.calledOnce, true);
    });

    it(`should display notification if workspace contains does not contain
      any folder opened`, async () => {
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      const printNoFolderOpenedMessageStub = sinon.stub(
        extensionControllerAny.utils,
        "printNoFolderOpenedMessage"
      );
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(false);
      await extensionController.search();

      assert.equal(showStub.calledOnce, false);
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });
  });

  describe("startup", () => {
    it("should index method be invoked", async () => {
      const indexStub = sinon.stub(extensionControllerAny.workspace, "index");
      await extensionControllerAny.startup();

      assert.equal(indexStub.calledOnce, true);
    });
  });

  describe("loadQuickPickData", () => {
    it("should load data to quick pick from cache", async () => {
      sinon
        .stub(extensionControllerAny.workspace, "getData")
        .returns(Promise.resolve(getQpItems()));
      await extensionControllerAny.loadQuickPickData();

      assert.equal(extensionControllerAny.quickPick.quickPick.items.length, 2);
    });

    it("should load empty array to quick pick if cache is empty", async () => {
      sinon
        .stub(extensionControllerAny.workspace, "getData")
        .returns(Promise.resolve());
      await extensionControllerAny.loadQuickPickData();

      assert.equal(extensionControllerAny.quickPick.quickPick.items.length, 0);
    });
  });

  describe("initComponents", () => {
    it("should init components", async () => {
      extensionControllerAny.initComponents();

      assert.equal(typeof extensionControllerAny.cache, "object");
      assert.equal(typeof extensionControllerAny.utils, "object");
      assert.equal(typeof extensionControllerAny.workspace, "object");
      assert.equal(typeof extensionControllerAny.quickPick, "object");
    });
  });
});
