import { assert } from "chai";
import { controller } from "../../controller";
import { ActionType } from "../../types";
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
    it("1: should set extensionContext", async () => {
      const extensionContext = setups.init1();
      await controller.init(extensionContext);

      assert.equal(extensionContext, controller.getExtensionContext());
    });

    it("2: should init cache", async () => {
      const [initCacheStub] = setups.init2();
      await controller.init(getExtensionContext());

      assert.equal(initCacheStub.calledOnce, true);
    });

    it("3: should init workspace", async () => {
      const [initWorkspaceStub] = setups.init3();
      await controller.init(getExtensionContext());

      assert.equal(initWorkspaceStub.calledOnce, true);
    });

    it("4: should register event listeners", async () => {
      const [
        onWillProcessingStub,
        onDidProcessingStub,
        onWillExecuteActionStub,
        onDidDebounceConfigToggleStub,
        onWillReindexOnConfigurationChangeStub,
      ] = setups.init4();
      await controller.init(getExtensionContext());

      assert.equal(onWillProcessingStub.calledOnce, true);
      assert.equal(onDidProcessingStub.calledOnce, true);
      assert.equal(onWillExecuteActionStub.calledOnce, true);
      assert.equal(onDidDebounceConfigToggleStub.calledOnce, true);
      assert.equal(onWillReindexOnConfigurationChangeStub.calledOnce, true);
    });
  });

  describe("search", () => {
    it(`1: should clear data and config from cache
    if shouldIndexOnQuickPickOpen method returns true`, async () => {
      const [, clearStub] = setups.search1();
      await controller.search();

      assert.equal(clearStub.calledOnce, true);
    });

    it(`2: should workspace.index method be invoked
      if shouldIndexOnQuickPickOpen method returns true`, async () => {
      const [indexStub] = setups.search2();
      await controller.search();

      assert.equal(indexStub.calledOnce, true);
    });

    it(`3: should clear config from cache if shouldLoadDataFromCacheOnQuickPickOpen method returns true`, async () => {
      const [, , clearConfigStub] = setups.search3();
      await controller.search();

      assert.equal(clearConfigStub.calledOnce, false);
    });

    it(`4: should init quickPick if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized`, async () => {
      const [, , , initStub] = setups.search4();
      await controller.search();

      assert.equal(initStub.calledOnce, false);
    });

    it(`5: should remove data for unsaved uris if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized`, async () => {
      const [, , , removeDataForUnsavedUrisStub] = setups.search5();
      await controller.search();

      assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
    });

    it(`6: get data and set it for quickPick if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized`, async () => {
      const [, , , , getDataStub, setItemsStub] = setups.search6();
      await controller.search();

      assert.equal(getDataStub.calledOnce, false);
      assert.equal(setItemsStub.calledOnce, false);
    });

    it(`7: should quickPick.show and quickPick.loadUnsortedItems methods be invoked
      if quickPick is initialized`, async () => {
      const [loadItemsStub, showStub] = setups.search7();
      await controller.search();

      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(showStub.calledOnce, true);
    });

    it(`8: should quickPick.show and quickPick.loadUnsortedItems methods not be invoked
      if quickPick is not initialized`, async () => {
      const [loadItemsStub, showStub] = setups.search8();
      await controller.search();

      assert.equal(loadItemsStub.calledOnce, false);
      assert.equal(showStub.calledOnce, false);
    });

    it("9: should do nothing if shouldIndexOnQuickPickOpen and shouldLoadDataFromCacheOnQuickPickOpen methods return false", async () => {
      const [
        indexStub,
        clearStub,
        clearConfigStub,
        initStub,
        removeDataForUnsavedUrisStub,
        getDataStub,
        setItemsStub,
      ] = setups.search9();
      await controller.search();

      assert.equal(indexStub.calledOnce, false);
      assert.equal(clearStub.calledOnce, false);
      assert.equal(clearConfigStub.calledOnce, false);
      assert.equal(initStub.calledOnce, false);
      assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
      assert.equal(getDataStub.calledOnce, false);
      assert.equal(setItemsStub.calledOnce, false);
    });

    it(`10: should set selected text as quickPick text if shouldSearchSelection
      returns true`, async () => {
      const [setTextStub] = setups.search10();
      await controller.search();

      assert.equal(setTextStub.calledWith("test text"), true);
    });

    it(`11: should not invoke quickPick.setText method if shouldSearchSelection
      returns false`, async () => {
      const [setTextStub] = setups.search11();
      await controller.search();

      assert.equal(setTextStub.calledOnce, false);
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
    it("3: should clear everything from cache", async () => {
      const [clearStub, clearNotSavedUriPathsStub] = setups.reload3();
      await controller.reload();

      assert.equal(clearStub.calledOnce, true);
      assert.equal(clearNotSavedUriPathsStub.calledOnce, true);
    });
  });

  describe("startup", () => {
    it("1: should workspace.index method be invoked if shouldInitOnStartup method returns true", async () => {
      const [, , , , , indexStub] = setups.startup1();
      await controller.startup();

      assert.equal(indexStub.calledOnce, true);
    });

    it("2: should do nothing if shouldInitOnStartup and shouldLoadDataFromCacheOnStartup methods return false", async () => {
      const [
        removeDataForUnsavedUrisStub,
        initStub,
        clearConfigStub,
        getDataStub,
        setItemsStub,
        indexStub,
      ] = setups.startup2();
      await controller.startup();

      assert.equal(indexStub.calledOnce, false);
      assert.equal(clearConfigStub.calledOnce, false);
      assert.equal(initStub.calledOnce, false);
      assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
      assert.equal(getDataStub.calledOnce, false);
      assert.equal(setItemsStub.calledOnce, false);
    });

    it(`3: should clear config in cache if shouldLoadDataFromCacheOnStartup method returns true`, async () => {
      const [, , clearConfigStub] = setups.startup3();
      await controller.startup();

      assert.equal(clearConfigStub.calledOnce, true);
    });

    it(`4: should init quickPick if shouldLoadDataFromCacheOnStartup method returns true and quickPick is not already initialized`, async () => {
      const [, initStub] = setups.startup4();
      await controller.startup();

      assert.equal(initStub.calledOnce, true);
    });

    it(`5: should remove data for unsaved uris if shouldLoadDataFromCacheOnStartup method returns true`, async () => {
      const [removeDataForUnsavedUrisStub] = setups.startup5();
      await controller.startup();

      assert.equal(removeDataForUnsavedUrisStub.calledOnce, true);
    });

    it(`6: should get data and set it for quickPick if shouldLoadDataFromCacheOnStartup method returns true`, async () => {
      const [, , , getDataStub, setItemsStub] = setups.startup6();
      await controller.startup();

      assert.equal(getDataStub.calledOnce, true);
      assert.equal(setItemsStub.calledOnce, true);
    });
  });

  describe("shouldIndexOnQuickPickOpen", () => {
    it(`1: should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled method returns false
      and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty method returns true`, () => {
      setups.shouldIndexOnQuickPickOpen1();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), true);
    });

    it(`1: should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled method returns true
      and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty method returns false`, () => {
      setups.shouldIndexOnQuickPickOpen2();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), true);
    });

    it(`3: should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled and
      isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty methods return true`, () => {
      setups.shouldIndexOnQuickPickOpen3();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), true);
    });

    it(`4: should return false if isInitOnStartupDisabledAndWorkspaceCachingDisabled and
      isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty methods return false`, () => {
      setups.shouldIndexOnQuickPickOpen4();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), false);
    });
  });

  describe("shouldIndexOnStartup", () => {
    it(`1: should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled method returns false
      and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty method returns true`, () => {
      setups.shouldIndexOnStartup1();

      assert.equal(controller.shouldIndexOnStartup(), true);
    });

    it(`1: should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled method returns true
      and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty method returns false`, () => {
      setups.shouldIndexOnStartup2();

      assert.equal(controller.shouldIndexOnStartup(), true);
    });

    it(`3: should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled and
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty methods return true`, () => {
      setups.shouldIndexOnStartup3();

      assert.equal(controller.shouldIndexOnStartup(), true);
    });

    it(`4: should return false if isInitOnStartupEnabledAndWorkspaceCachingDisabled and
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty methods return false`, () => {
      setups.shouldIndexOnStartup4();

      assert.equal(controller.shouldIndexOnStartup(), false);
    });
  });

  describe("isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty", () => {
    it("1: should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty1();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("2: should return false if fetchShouldInitOnStartup method returns true", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty2();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("3: should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty3();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("4: should return false if data is not empty", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty4();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it(`5: should return true if quickPick is not initialied,fetchShouldInitOnStartup
      method returns true and fetchShouldWorkspaceDataBeCached method returns true and data is empty`, () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty4();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });
  });

  describe("isInitOnStartupDisabledAndWorkspaceCachingDisabled", () => {
    it("1: should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled1();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("2: should return false if fetchShouldInitOnStartup method returns true", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled2();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("3: should return false if fetchShouldWorkspaceDataBeCached method returns true", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled3();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it(`4: should return true if quickPick is not initialied,fetchShouldInitOnStartup
      method returns false and fetchShouldWorkspaceDataBeCached method returns false`, () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled4();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        true
      );
    });
  });

  describe("isInitOnStartupEnabledAndWorkspaceCachingDisabled", () => {
    it("1: should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled1();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("2: should return false if fetchShouldInitOnStartup method returns false", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled2();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("3: should return false if fetchShouldWorkspaceDataBeCached method returns true", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled3();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it(`4: should return true if quickPick is not initialied,fetchShouldInitOnStartup
      method returns true and fetchShouldWorkspaceDataBeCached method returns false`, () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled4();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        true
      );
    });
  });

  describe("isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty", () => {
    it("1: should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty1();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("2: should return false if fetchShouldInitOnStartup method returns false", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty2();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("3: should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty3();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("4: should return false if data is not empty", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty4();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it(`5: should return true if quickPick is not initialied,fetchShouldInitOnStartup
      method returns true and fetchShouldWorkspaceDataBeCached method returns true and data is empty`, () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty4();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });
  });

  describe("shouldSearchSelection", () => {
    it("1: should return false if quickPick is not initialized", () => {
      const editor = setups.shouldSearchSelection1();
      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it("2: should return false if fetchShouldSearchSelection returns false", () => {
      const editor = setups.shouldSearchSelection2();
      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it("3: should return false if editor doesn't exist", () => {
      const editor = setups.shouldSearchSelection3();
      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it(`4: should return true if quickPick is initialized,
      fetchShouldSearchSelection returns false and editor exists`, () => {
      const editor = setups.shouldSearchSelection4();
      assert.equal(controller.shouldSearchSelection(editor), true);
    });
  });

  describe("shouldLoadDataFromCacheOnQuickPickOpen", () => {
    it("1: should return false if quickPick is already initialized", () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen1();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
    });

    it("2: should return false if fetchShouldInitOnStartup method returns true", () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen2();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
    });

    it("3: should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen3();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
    });

    it(`4: should return true if quickPick is not initialized, fetchShouldInitOnStartup
      method returns false and fetchShouldWorkspaceDataBeCached method returns true`, () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen4();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), true);
    });
  });

  describe("shouldLoadDataFromCacheOnStartup", () => {
    it("1: should return false if quickPick is already initialized", () => {
      setups.shouldLoadDataFromCacheOnStartup1();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), false);
    });

    it("2: should return false if fetchShouldInitOnStartup method returns false", () => {
      setups.shouldLoadDataFromCacheOnStartup2();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), false);
    });

    it("3: should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.shouldLoadDataFromCacheOnStartup3();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), false);
    });

    it(`4: should return true if quickPick is not initialized, fetchShouldInitOnStartup
      and fetchShouldWorkspaceDataBeCached methods return true`, () => {
      setups.shouldLoadDataFromCacheOnStartup4();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), true);
    });
  });

  describe("shouldSearchSelection", () => {
    it("1: should return false if quickPick is not initialized", () => {
      const editor = setups.shouldSearchSelection1();

      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it("2: should return false if fetchShouldSearchSelection method returns false", () => {
      const editor = setups.shouldSearchSelection2();

      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it("3: should return false if editor doesn't exist", () => {
      const editor = setups.shouldSearchSelection3();
      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it(`4: should return true if quickPick is initialized,
      fetchShouldSearchSelection returns false and editor exists`, () => {
      const editor = setups.shouldSearchSelection4();
      assert.equal(controller.shouldSearchSelection(editor), true);
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
      be invoked and and setBusy method with false as parameter`, () => {
      const [setQuickPickDataStub, initStub, loadItemsStub, setBusyStub] =
        setups.handleDidProcessing1();

      controller.handleDidProcessing();

      assert.equal(setQuickPickDataStub.calledOnce, true);
      assert.equal(initStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });

    it(`2: should quickPick.setItems method be invoked with
      data from workspace.getData method as a parameter`, () => {
      const [setItemsStub] = setups.handleDidProcessing2();
      controller.handleDidProcessing();

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

  describe("handleDidSortingConfigToggle", () => {
    it("1: should setBusy and reloadSortingSettings methods be invoked", () => {
      const [setBusyStub, reloadSortingSettingsStub] =
        setups.handleDidSortingConfigToggle1();

      controller.handleDidSortingConfigToggle();

      assert.equal(setBusyStub.calledWith(true), true);
      assert.equal(reloadSortingSettingsStub.calledOnce, true);
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
