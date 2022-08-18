import { assert } from "chai";
import { controller } from "../../controller";
import ActionType from "../../enum/actionType";
import { getTestSetups } from "../testSetup/controller.testSetup";
import { getAction, getExtensionContext } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("controller", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("init", () => {
    it("1: should set extensionContext", () => {
      const extensionContext = setups.init1();
      controller.init(extensionContext);

      assert.equal(extensionContext, controller.getExtensionContext());
    });

    it("2: should init cache", () => {
      const [initCacheStub] = setups.init2();
      controller.init(getExtensionContext());

      assert.equal(initCacheStub.calledOnce, true);
    });

    it("3: should init workspace", () => {
      const [initWorkspaceStub] = setups.init3();
      controller.init(getExtensionContext());

      assert.equal(initWorkspaceStub.calledOnce, true);
    });

    it("4: should register event listeners", () => {
      const [
        onWillProcessingStub,
        onDidProcessingStub,
        onWillExecuteActionStub,
        onDidDebounceConfigToggleStub,
        onWillReindexOnConfigurationChangeStub,
      ] = setups.init4();
      controller.init(getExtensionContext());

      assert.equal(onWillProcessingStub.calledOnce, true);
      assert.equal(onDidProcessingStub.calledOnce, true);
      assert.equal(onWillExecuteActionStub.calledOnce, true);
      assert.equal(onDidDebounceConfigToggleStub.calledOnce, true);
      assert.equal(onWillReindexOnConfigurationChangeStub.calledOnce, true);
    });
  });

  describe("search", () => {
    it(`1: should display notification if workspace contains does not contain
      any folder opened`, async () => {
      const [showStub, printNoFolderOpenedMessageStub] = setups.search1();
      await controller.search();

      assert.equal(showStub.calledOnce, false);
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });

    it(`2: should workspace.index method be invoked
      if shouldIndexOnQuickPickOpen method returns true`, async () => {
      const [indexStub] = setups.search2();
      await controller.search();

      assert.equal(indexStub.calledOnce, true);
    });

    it(`3: should workspace.index method not be invoked
      if shouldIndexOnQuickPickOpen method returns false`, async () => {
      const [indexStub] = setups.search3();
      await controller.search();

      assert.equal(indexStub.calledOnce, false);
    });

    it(`4: should quickPick.show and quickPick.loadUnsortedItems methods be invoked
      if quickPick is initialized`, async () => {
      const [loadItemsStub, showStub] = setups.search4();
      await controller.search();

      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(showStub.calledOnce, true);
    });

    it(`5: should quickPick.show and quickPick.loadUnsortedItems methods not be invoked
      if quickPick is not initialized`, async () => {
      const [loadItemsStub, showStub] = setups.search5();
      await controller.search();

      assert.equal(loadItemsStub.calledOnce, false);
      assert.equal(showStub.calledOnce, false);
    });
  });

  describe("reload", () => {
    it(`1: should display notification if workspace contains does not contain
      any folder opened`, async () => {
      const [printNoFolderOpenedMessageStub] = setups.reload1();
      await controller.reload();

      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });

    it("2: should workspace.index method be invoked", async () => {
      const [indexStub] = setups.reload2();
      await controller.reload();

      assert.equal(indexStub.calledOnce, true);
    });
  });

  describe("startup", () => {
    it("1: should workspace.index method be invoked if shouldInitOnStartup method returns true", async () => {
      const [indexStub] = setups.startup1();
      await controller.startup();

      assert.equal(indexStub.calledOnce, true);
    });

    it("2: should do nothing if shouldInitOnStartup method returns false", async () => {
      const [indexStub] = setups.startup2();
      await controller.startup();

      assert.equal(indexStub.calledOnce, false);
    });
  });

  describe("handleWillProcessing", () => {
    it(`1: should quickPick.showLoading and quickPick.setQuickPickPlaceholder
      methods be invoked with true as parameter`, () => {
      const [showLoadingStub, setPlaceholderStub] =
        setups.handleWillProcessing1();
      controller.handleWillProcessing();

      assert.equal(showLoadingStub.calledWith(true), true);
      assert.equal(setPlaceholderStub.calledWith(true), true);
    });

    it(`2: should quickPick.showLoading and quickPick.setQuickPickPlaceholder
    methods not be invoked`, () => {
      const [showLoadingStub, setPlaceholderStub] =
        setups.handleWillProcessing2();
      controller.handleWillProcessing();

      assert.equal(showLoadingStub.calledWith(false), false);
      assert.equal(setPlaceholderStub.calledWith(false), false);
    });

    it(`3: should quickPick.init method be invoked if quickPick is not initialized`, async () => {
      const [initStub] = setups.handleWillProcessing3();
      await controller.handleWillProcessing();

      assert.equal(initStub.calledOnce, true);
    });
  });

  describe("handleDidProcessing", () => {
    it(`1: should setQuickPickData, loadItemsStub methods
      be invoked and and setBusy method with false as parameter`, async () => {
      const [setQuickPickDataStub, initStub, loadItemsStub, setBusyStub] =
        setups.handleDidProcessing1();

      await controller.handleDidProcessing();

      assert.equal(setQuickPickDataStub.calledOnce, true);
      assert.equal(initStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });

    it(`2: should quickPick.setItems method be invoked with
      data from workspace.getData method as a parameter`, async () => {
      const [setItemsStub] = setups.handleDidProcessing2();
      await controller.handleDidProcessing();

      assert.equal(setItemsStub.calledWith(getQpItems()), true);
    });
  });

  describe("handleWillExecuteAction", () => {
    it(`1: should quickPick.setItems be invoked with empty array
      if action type is rebuild`, async () => {
      const [setItemsStub, loadItemsStub] = setups.handleWillExecuteAction1();
      controller.handleWillExecuteAction(getAction(ActionType.Rebuild));

      assert.equal(setItemsStub.calledWith([]), true);
      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("2: should do nothing if action type is different than rebuild", async () => {
      const [setItemsStub, loadItemsStub] = setups.handleWillExecuteAction2();
      controller.handleWillExecuteAction(getAction(ActionType.Update));

      assert.equal(setItemsStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, false);
    });
  });

  describe("handleDidDebounceConfigToggle", () => {
    it("1: should setBusy and reloadOnDidChangeValueEventListener methods be invoked", () => {
      const [setBusyStub, reloadOnDidChangeValueEventListenerStub] =
        setups.handleDidDebounceConfigToggle1();

      controller.handleDidDebounceConfigToggle();

      assert.equal(setBusyStub.calledWith(true), true);
      assert.equal(reloadOnDidChangeValueEventListenerStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });
  });

  describe("handleWillReindexOnConfigurationChange", () => {
    it("1: should quickPick.reload method be invoked", () => {
      const [reloadStub] = setups.handleWillReindexOnConfigurationChange1();
      controller.handleWillReindexOnConfigurationChange();

      assert.equal(reloadStub.calledOnce, true);
    });
  });
});
