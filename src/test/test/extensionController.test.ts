import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import ExtensionController from "../../extensionController";
import {
  getExtensionContext,
  getQpItems,
  getAction,
} from "../util/mockFactory";
import ActionType from "../../enum/actionType";

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
    // it(`should quickPick.show method be invoked if workspace contains
    //   at least one folder opened`, async () => {
    //   const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
    //   sinon
    //     .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
    //     .returns(true);
    //   await extensionController.search();

    //   assert.equal(showStub.calledOnce, true);
    // });

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

    it(`should workspace.index method be invoked
      if shouldIndexOnQuickPickOpen method returns true`, async () => {
      const indexStub = sinon.stub(extensionControllerAny.workspace, "index");
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(true);
      sinon
        .stub(extensionControllerAny, "shouldIndexOnQuickPickOpen")
        .returns(true);

      await extensionController.search();

      assert.equal(indexStub.calledOnce, true);
    });

    it(`should workspace.index method not be invoked
      if shouldIndexOnQuickPickOpen method returns false`, async () => {
      const indexStub = sinon.stub(extensionControllerAny.workspace, "index");
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(true);
      sinon
        .stub(extensionControllerAny, "shouldIndexOnQuickPickOpen")
        .returns(false);

      await extensionController.search();

      assert.equal(indexStub.calledOnce, false);
    });

    it(`should quickPick.show and quickPick.loadItems methods be invoked
      if quickPick is initialized`, async () => {
      const loadItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "loadItems"
      );
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(true);
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(true);

      await extensionController.search();

      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(showStub.calledOnce, true);
    });

    it(`should quickPick.show and quickPick.loadItems methods not be invoked
      if quickPick is not initialized`, async () => {
      const loadItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "loadItems"
      );
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(true);
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(false);

      await extensionController.search();

      assert.equal(loadItemsStub.calledOnce, false);
      assert.equal(showStub.calledOnce, false);
    });
  });

  describe("startup", () => {
    it("should workspace.index method be invoked if shouldInitOnStartup method returns true", async () => {
      sinon
        .stub(extensionControllerAny.config, "shouldInitOnStartup")
        .returns(true);
      const indexStub = sinon.stub(extensionControllerAny.workspace, "index");
      await extensionControllerAny.startup();

      assert.equal(indexStub.calledOnce, true);
    });

    it("should do nothing if shouldInitOnStartup method returns false", async () => {
      sinon
        .stub(extensionControllerAny.config, "shouldInitOnStartup")
        .returns(false);
      const indexStub = sinon.stub(extensionControllerAny.workspace, "index");
      await extensionControllerAny.startup();

      assert.equal(indexStub.calledOnce, false);
    });
  });

  describe("setQuickPickData", () => {
    it("should load data to quick pick from cache", async () => {
      sinon
        .stub(extensionControllerAny.workspace, "getData")
        .returns(Promise.resolve(getQpItems()));
      const setItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "setItems"
      );
      await extensionControllerAny.setQuickPickData();

      assert.equal(setItemsStub.calledWith(getQpItems()), true);
    });

    it("should load empty array to quick pick if cache is empty", async () => {
      sinon
        .stub(extensionControllerAny.workspace, "getData")
        .returns(Promise.resolve());
      await extensionControllerAny.setQuickPickData();

      assert.equal(extensionControllerAny.quickPick.items.length, 0);
    });
  });

  describe("setBusy", () => {
    it(`should change the state of components to busy
      if quick pick is initialized`, () => {
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(true);
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

  describe("shouldIndexOnQuickPickOpen", () => {
    it(`should return true if initialization is delayed
      and quick pick is not initialized`, async () => {
      sinon
        .stub(extensionControllerAny.config, "shouldInitOnStartup")
        .returns(false);
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(false);

      assert.equal(extensionControllerAny.shouldIndexOnQuickPickOpen(), true);
    });

    it("should return false if initialization is on startup", async () => {
      sinon
        .stub(extensionControllerAny.config, "shouldInitOnStartup")
        .returns(true);
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(false);

      assert.equal(extensionControllerAny.shouldIndexOnQuickPickOpen(), false);
    });

    it("should return false if quick pick has been already initialized", async () => {
      sinon
        .stub(extensionControllerAny.config, "shouldInitOnStartup")
        .returns(false);
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(true);

      assert.equal(extensionControllerAny.shouldIndexOnQuickPickOpen(), false);
    });
  });

  describe("initComponents", () => {
    it("should init components", async () => {
      extensionControllerAny.initComponents();

      assert.equal(typeof extensionControllerAny.cache, "object");
      assert.equal(typeof extensionControllerAny.config, "object");
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

      const onWillExecuteActionStub = sinon.stub(
        extensionControllerAny.workspace,
        "onWillExecuteAction"
      );

      extensionControllerAny.registerEventListeners();

      assert.equal(onWillProcessingStub.calledOnce, true);
      assert.equal(onDidProcessingStub.calledOnce, true);
      assert.equal(onWillExecuteActionStub.calledOnce, true);
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
    it(`should setQuickPickData, loadItemsStub methods
      be invoked and and setBusy method with false as parameter`, async () => {
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(true);
      const setQuickPickDataStub = sinon.stub(
        extensionControllerAny,
        "setQuickPickData"
      );
      const initStub = sinon.stub(extensionControllerAny.quickPick, "init");
      const loadItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "loadItems"
      );
      const setBusyStub = sinon.stub(extensionControllerAny, "setBusy");

      await extensionControllerAny.onDidProcessing();

      assert.equal(setQuickPickDataStub.calledOnce, true);
      assert.equal(initStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });

    it(`should init method be invoked if quickPick is not initialized`, async () => {
      sinon
        .stub(extensionControllerAny.quickPick, "isInitialized")
        .returns(false);

      const initStub = sinon.stub(extensionControllerAny.quickPick, "init");
      sinon.stub(extensionControllerAny.quickPick, "loadItems");

      await extensionControllerAny.onDidProcessing();

      assert.equal(initStub.calledOnce, true);
    });
  });

  describe("onWillExecuteAction", () => {
    it(`should quickPick.setItems be invoked with empty array
      if action type is rebuild`, async () => {
      const setItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "setItems"
      );
      const loadItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "loadItems"
      );
      extensionControllerAny.onWillExecuteAction(getAction(ActionType.Rebuild));

      assert.equal(setItemsStub.calledWith([]), true);
      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("should do nothing if action type is different than rebuild", async () => {
      const setItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "setItems"
      );
      const loadItemsStub = sinon.stub(
        extensionControllerAny.quickPick,
        "loadItems"
      );
      extensionControllerAny.onWillExecuteAction(getAction(ActionType.Update));

      assert.equal(setItemsStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, false);
    });
  });
});
