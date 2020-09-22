import * as vscode from "vscode";
import { assert } from "chai";
import { getExtensionContext, getAction } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import ActionType from "../../enum/actionType";
import ExtensionController from "../../extensionController";
import { getTestSetups } from "../testSetup/extensionController.testSetup";

describe("ExtensionController", () => {
  let context: vscode.ExtensionContext = getExtensionContext();
  let extensionController: ExtensionController = new ExtensionController(
    context
  );
  let extensionControllerAny: any;
  let setups = getTestSetups(extensionController);

  beforeEach(() => {
    context = getExtensionContext();
    extensionController = new ExtensionController(context);
    extensionControllerAny = extensionController as any;
    setups = getTestSetups(extensionController);
  });

  describe("search", () => {
    it(`1: should display notification if workspace contains does not contain
      any folder opened`, async () => {
      const [showStub, printNoFolderOpenedMessageStub] = setups.search1();
      await extensionController.search();

      assert.equal(showStub.calledOnce, false);
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });

    it(`2: should workspace.index method be invoked
      if shouldIndexOnQuickPickOpen method returns true`, async () => {
      const [indexStub] = setups.search2();
      await extensionController.search();

      assert.equal(indexStub.calledOnce, true);
    });

    it(`3: should workspace.index method not be invoked
      if shouldIndexOnQuickPickOpen method returns false`, async () => {
      const [indexStub] = setups.search3();
      await extensionController.search();

      assert.equal(indexStub.calledOnce, false);
    });

    it(`4: should quickPick.show and quickPick.loadItems methods be invoked
      if quickPick is initialized`, async () => {
      const [loadItemsStub, showStub] = setups.search4();
      await extensionController.search();

      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(showStub.calledOnce, true);
    });

    it(`5: should quickPick.show and quickPick.loadItems methods not be invoked
      if quickPick is not initialized`, async () => {
      const [loadItemsStub, showStub] = setups.search5();
      await extensionController.search();

      assert.equal(loadItemsStub.calledOnce, false);
      assert.equal(showStub.calledOnce, false);
    });
  });

  describe("reload", () => {
    it(`1: should display notification if workspace contains does not contain
      any folder opened`, async () => {
      const [printNoFolderOpenedMessageStub] = setups.reload1();
      await extensionController.reload();

      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });

    it("2: should workspace.index method be invoked", async () => {
      const [indexStub] = setups.reload2();
      await extensionController.reload();

      assert.equal(indexStub.calledOnce, true);
    });
  });

  describe("startup", () => {
    it("1: should workspace.index method be invoked if shouldInitOnStartup method returns true", async () => {
      const [indexStub] = setups.startup1();
      await extensionControllerAny.startup();

      assert.equal(indexStub.calledOnce, true);
    });

    it("2: should do nothing if shouldInitOnStartup method returns false", async () => {
      const [indexStub] = setups.startup2();
      await extensionControllerAny.startup();

      assert.equal(indexStub.calledOnce, false);
    });
  });

  describe("setQuickPickData", () => {
    it("1: should load data to quick pick from cache", async () => {
      const [setItemsStub] = setups.setQuickPickData1();
      await extensionControllerAny.setQuickPickData();

      assert.equal(setItemsStub.calledWith(getQpItems()), true);
    });

    it("2: should load empty array to quick pick if cache is empty", async () => {
      setups.setQuickPickData2();
      await extensionControllerAny.setQuickPickData();

      assert.equal(extensionControllerAny.quickPick.items.length, 0);
    });
  });

  describe("setBusy", () => {
    it(`1: should change the state of components to busy
      if quick pick is initialized`, () => {
      const [
        setQuickPickLoadingStub,
        setQuickPickPlaceholderStub,
      ] = setups.setBusy1();

      extensionControllerAny.setBusy(true);

      assert.equal(setQuickPickLoadingStub.calledWith(true), true);
      assert.equal(setQuickPickPlaceholderStub.calledWith(true), true);
    });
  });

  describe("setQuickPickLoading", () => {
    it("1: should change quick pick state to loading", () => {
      const [showLoadingStub] = setups.setQuickPickLoading1();
      extensionControllerAny.setQuickPickLoading(true);

      assert.equal(showLoadingStub.calledWith(true), true);
    });
  });

  describe("setQuickPickPlaceholder", () => {
    it("1: should change quick pick placeholder to appropriate for loading state", () => {
      const [setPlaceholderStub] = setups.setQuickPickPlaceholder1();
      extensionControllerAny.setQuickPickPlaceholder(true);

      assert.equal(setPlaceholderStub.calledWith(true), true);
    });
  });

  describe("shouldIndexOnQuickPickOpen", () => {
    it(`1: should return true if initialization is delayed
      and quick pick is not initialized`, async () => {
      setups.shouldIndexOnQuickPickOpen1();
      assert.equal(extensionControllerAny.shouldIndexOnQuickPickOpen(), true);
    });

    it("2: should return false if initialization is on startup", async () => {
      setups.shouldIndexOnQuickPickOpen2();
      assert.equal(extensionControllerAny.shouldIndexOnQuickPickOpen(), false);
    });

    it("3: should return false if quick pick has been already initialized", async () => {
      setups.shouldIndexOnQuickPickOpen3();
      assert.equal(extensionControllerAny.shouldIndexOnQuickPickOpen(), false);
    });
  });

  describe("initComponents", () => {
    it("1: should init components", async () => {
      extensionControllerAny.initComponents();

      assert.equal(typeof extensionControllerAny.cache, "object");
      assert.equal(typeof extensionControllerAny.config, "object");
      assert.equal(typeof extensionControllerAny.utils, "object");
      assert.equal(typeof extensionControllerAny.workspace, "object");
      assert.equal(typeof extensionControllerAny.quickPick, "object");
    });
  });

  describe("registerEventListeners", () => {
    it("1: should register extensionController event listeners", () => {
      const [
        onWillProcessingStub,
        onDidProcessingStub,
        onWillExecuteActionStub,
        onDidDebounceConfigToggleStub,
      ] = setups.registerEventListeners1();

      extensionControllerAny.registerEventListeners();

      assert.equal(onWillProcessingStub.calledOnce, true);
      assert.equal(onDidProcessingStub.calledOnce, true);
      assert.equal(onWillExecuteActionStub.calledOnce, true);
      assert.equal(onDidDebounceConfigToggleStub.calledOnce, true);
    });
  });

  describe("onWillProcessing", () => {
    it("1: should setBusy method be invoked with true as parameter", () => {
      const [setBusyStub] = setups.onWillProcessing1();
      extensionControllerAny.onWillProcessing();

      assert.equal(setBusyStub.calledWith(true), true);
    });
  });

  describe("onDidProcessing", () => {
    it(`1: should setQuickPickData, loadItemsStub methods
      be invoked and and setBusy method with false as parameter`, async () => {
      const [
        setQuickPickDataStub,
        initStub,
        loadItemsStub,
        setBusyStub,
      ] = setups.onDidProcessing1();

      await extensionControllerAny.onDidProcessing();

      assert.equal(setQuickPickDataStub.calledOnce, true);
      assert.equal(initStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });

    it(`2: should init method be invoked if quickPick is not initialized`, async () => {
      const [initStub] = setups.onDidProcessing2();
      await extensionControllerAny.onDidProcessing();

      assert.equal(initStub.calledOnce, true);
    });
  });

  describe("onWillExecuteAction", () => {
    it(`1: should quickPick.setItems be invoked with empty array
      if action type is rebuild`, async () => {
      const [setItemsStub, loadItemsStub] = setups.onWillExecuteAction1();
      extensionControllerAny.onWillExecuteAction(getAction(ActionType.Rebuild));

      assert.equal(setItemsStub.calledWith([]), true);
      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("2: should do nothing if action type is different than rebuild", async () => {
      const [setItemsStub, loadItemsStub] = setups.onWillExecuteAction2();
      extensionControllerAny.onWillExecuteAction(getAction(ActionType.Update));

      assert.equal(setItemsStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, false);
    });
  });

  describe("onDidDebounceConfigToggle", () => {
    it("1: should setBusy and reloadOnDidChangeValueEventListener methods be invoked", () => {
      const [
        setBusyStub,
        reloadOnDidChangeValueEventListenerStub,
      ] = setups.onDidDebounceConfigToggle1();

      extensionControllerAny.onDidDebounceConfigToggle();

      assert.equal(setBusyStub.calledWith(true), true);
      assert.equal(reloadOnDidChangeValueEventListenerStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });
  });

  describe("onWillReindexOnConfigurationChange", () => {
    it("1: should quickPick.reload method be invoked", () => {
      const [reloadStub] = setups.onWillReindexOnConfigurationChange1();
      extensionControllerAny.onWillReindexOnConfigurationChange();

      assert.equal(reloadStub.calledOnce, true);
    });
  });
});
