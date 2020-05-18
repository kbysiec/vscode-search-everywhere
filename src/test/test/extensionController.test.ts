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
    it("should indexWithProgress method be invoked", async () => {
      const indexWithProgressStub = sinon.stub(
        extensionControllerAny.workspace,
        "indexWithProgress"
      );
      await extensionControllerAny.startup();

      assert.equal(indexWithProgressStub.calledOnce, true);
    });
  });

  describe("loadQuickPickData", () => {
    it("should load data to quick pick from cache", async () => {
      sinon
        .stub(extensionControllerAny.workspace, "getData")
        .returns(Promise.resolve(getQpItems()));
      const setItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "setItems"
      );
      await extensionControllerAny.loadQuickPickData();

      assert.equal(setItemsStub.calledWith(getQpItems()), true);
    });

    it("should load empty array to quick pick if cache is empty", async () => {
      sinon
        .stub(extensionControllerAny.workspace, "getData")
        .returns(Promise.resolve());
      await extensionControllerAny.loadQuickPickData();

      assert.equal(extensionControllerAny.quickPick.quickPick.items.length, 0);
    });
  });

  describe("setBusy", () => {
    it("should change the state of components to busy", () => {
      const setQuickPickLoadingStub = sinon.stub(
        extensionControllerAny,
        "setQuickPickLoading"
      );

      const setQuickPickPlaceholderStub = sinon.stub(
        extensionControllerAny,
        "setQuickPickPlaceholder"
      );

      extensionControllerAny.setBusy(true);

      assert.equal(setQuickPickLoadingStub.calledWith(true), true);
      assert.equal(setQuickPickPlaceholderStub.calledWith(true), true);
    });
  });

  describe("setQuickPickLoading", () => {
    it("should change quick pick state to loading", () => {
      const showLoadingStub = sinon.stub(
        extensionControllerAny.quickPick,
        "showLoading"
      );

      extensionControllerAny.setQuickPickLoading(true);

      assert.equal(showLoadingStub.calledWith(true), true);
    });
  });

  describe("setQuickPickPlaceholder", () => {
    it("should change quick pick placeholder to loading text", () => {
      const setPlaceholderStub = sinon.stub(
        extensionControllerAny.quickPick,
        "setPlaceholder"
      );

      extensionControllerAny.setQuickPickPlaceholder(true);

      assert.equal(
        setPlaceholderStub.calledWith("Please wait, loading..."),
        true
      );
    });

    it("should change quick pick placeholder to searching text", () => {
      const setPlaceholderStub = sinon.stub(
        extensionControllerAny.quickPick,
        "setPlaceholder"
      );

      extensionControllerAny.setQuickPickPlaceholder(false);

      assert.equal(
        setPlaceholderStub.calledWith("Start typing file or symbol name..."),
        true
      );
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

  describe("registerEventListeners", () => {
    it("should register extensionController event listeners", () => {
      const onWillProcessingStub = sinon.stub(
        extensionControllerAny.workspace,
        "onWillProcessing"
      );

      const onDidProcessingStub = sinon.stub(
        extensionControllerAny.workspace,
        "onDidProcessing"
      );

      extensionControllerAny.registerEventListeners();

      assert.equal(onWillProcessingStub.calledOnce, true);
      assert.equal(onDidProcessingStub.calledOnce, true);
    });
  });

  describe("onWillProcessing", () => {
    it("should setBusy method be invoked with true as parameter", () => {
      const setBusyStub = sinon.stub(extensionControllerAny, "setBusy");

      extensionControllerAny.onWillProcessing();

      assert.equal(setBusyStub.calledWith(true), true);
    });
  });

  describe("onDidProcessing", () => {
    it(`should setBusy method be invoked with false as parameter
      and loadQuickPickData method be invoked`, async () => {
      const setBusyStub = sinon.stub(extensionControllerAny, "setBusy");

      const loadQuickPickDataStub = sinon.stub(
        extensionControllerAny,
        "loadQuickPickData"
      );

      await extensionControllerAny.onDidProcessing();

      assert.equal(setBusyStub.calledWith(false), true);
      assert.equal(loadQuickPickDataStub.calledOnce, true);
    });
  });
});
