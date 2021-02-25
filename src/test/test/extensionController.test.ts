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
      await extensionController.startup();

      assert.equal(indexStub.calledOnce, true);
    });

    it("2: should do nothing if shouldInitOnStartup method returns false", async () => {
      const [indexStub] = setups.startup2();
      await extensionController.startup();

      assert.equal(indexStub.calledOnce, false);
    });
  });

  describe("onWillProcessing", () => {
    it(`1: should quickPick.showLoading and quickPick.setQuickPickPlaceholder
      methods be invoked with true as parameter`, () => {
      const [showLoadingStub, setPlaceholderStub] = setups.onWillProcessing1();
      extensionControllerAny.onWillProcessing();

      assert.equal(showLoadingStub.calledWith(true), true);
      assert.equal(setPlaceholderStub.calledWith(true), true);
    });

    it(`2: should quickPick.showLoading and quickPick.setQuickPickPlaceholder
    methods not be invoked`, () => {
      const [showLoadingStub, setPlaceholderStub] = setups.onWillProcessing2();
      extensionControllerAny.onWillProcessing();

      assert.equal(showLoadingStub.calledWith(false), false);
      assert.equal(setPlaceholderStub.calledWith(false), false);
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
    it(`3: should quickPick.setItems method be invoked with
      data from workspace.getData method as a parameter`, async () => {
      const [setItemsStub] = setups.onDidProcessing3();
      await extensionControllerAny.onDidProcessing();

      assert.equal(setItemsStub.calledWith(getQpItems()), true);
    });

    it(`4: should quickPick.setItems method be invoked with
      empty array as a parameter if workspace.getData returns nothing`, async () => {
      const [setItemsStub] = setups.onDidProcessing4();
      await extensionControllerAny.onDidProcessing();

      assert.equal(setItemsStub.calledWith([]), true);
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
