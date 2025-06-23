import { assert } from "chai";
import { controller } from "../../controller";
import { ActionType } from "../../types";
import { getTestSetups } from "../testSetup/controller.testSetup";
import { getAction, getExtensionContext } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("Controller", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("init", () => {
    it("should set extensionContext", async () => {
      const extensionContext = setups.init.setupForExtensionContextAssignment();
      await controller.init(extensionContext);

      assert.equal(extensionContext, controller.getExtensionContext());
    });

    it("should init cache", async () => {
      const [initCacheStub] = setups.init.setupForCacheInitialization();
      await controller.init(getExtensionContext());

      assert.equal(initCacheStub.calledOnce, true);
    });

    it("should init workspace", async () => {
      const [initWorkspaceStub] = setups.init.setupForWorkspaceInitialization();
      await controller.init(getExtensionContext());

      assert.equal(initWorkspaceStub.calledOnce, true);
    });

    it("should register event listeners", async () => {
      const [
        onWillProcessingStub,
        onDidProcessingStub,
        onWillExecuteActionStub,
        onDidDebounceConfigToggleStub,
        onWillReindexOnConfigurationChangeStub,
      ] = setups.init.setupForEventListenerRegistration();
      await controller.init(getExtensionContext());

      assert.equal(onWillProcessingStub.calledOnce, true);
      assert.equal(onDidProcessingStub.calledOnce, true);
      assert.equal(onWillExecuteActionStub.calledOnce, true);
      assert.equal(onDidDebounceConfigToggleStub.calledOnce, true);
      assert.equal(onWillReindexOnConfigurationChangeStub.calledOnce, true);
    });
  });

  describe("search", () => {
    it("should clear data and config from cache if shouldIndexOnQuickPickOpen method returns true", async () => {
      const [, clearStub] =
        setups.search.setupForClearingCacheWhenIndexingOnOpen();
      await controller.search();

      assert.equal(clearStub.calledOnce, true);
    });

    it("should workspace.index method be invoked if shouldIndexOnQuickPickOpen method returns true", async () => {
      const [indexStub] =
        setups.search.setupForWorkspaceIndexingWhenIndexingOnOpen();
      await controller.search();

      assert.equal(indexStub.calledOnce, true);
    });

    it("should clear config from cache if shouldLoadDataFromCacheOnQuickPickOpen method returns true", async () => {
      const [, , clearConfigStub] =
        setups.search.setupForClearingConfigWhenLoadingFromCache();
      await controller.search();

      assert.equal(clearConfigStub.calledOnce, false);
    });

    it("should init quickPick if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized", async () => {
      const [, , , initStub] =
        setups.search.setupForInitializingQuickPickWhenLoadingFromCache();
      await controller.search();

      assert.equal(initStub.calledOnce, false);
    });

    it("should remove data for unsaved uris if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized", async () => {
      const [, , , removeDataForUnsavedUrisStub] =
        setups.search.setupForRemovingUnsavedUrisWhenLoadingFromCache();
      await controller.search();

      assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
    });

    it("get data and set it for quickPick if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized", async () => {
      const [, , , , getDataStub, setItemsStub] =
        setups.search.setupForGettingAndSettingDataWhenLoadingFromCache();
      await controller.search();

      assert.equal(getDataStub.calledOnce, false);
      assert.equal(setItemsStub.calledOnce, false);
    });

    it("should quickPick.show and quickPick.loadUnsortedItems methods be invoked if quickPick is initialized", async () => {
      const [loadItemsStub, showStub] =
        setups.search.setupForShowingQuickPickWhenInitialized();
      await controller.search();

      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(showStub.calledOnce, true);
    });

    it("should quickPick.show and quickPick.loadUnsortedItems methods not be invoked if quickPick is not initialized", async () => {
      const [loadItemsStub, showStub] =
        setups.search.setupForNotShowingQuickPickWhenNotInitialized();
      await controller.search();

      assert.equal(loadItemsStub.calledOnce, false);
      assert.equal(showStub.calledOnce, false);
    });

    it("should do nothing if shouldIndexOnQuickPickOpen and shouldLoadDataFromCacheOnQuickPickOpen methods return false", async () => {
      const [
        indexStub,
        clearStub,
        clearConfigStub,
        initStub,
        removeDataForUnsavedUrisStub,
        getDataStub,
        setItemsStub,
      ] = setups.search.setupForDoingNothingWhenConditionsFalse();
      await controller.search();

      assert.equal(indexStub.calledOnce, false);
      assert.equal(clearStub.calledOnce, false);
      assert.equal(clearConfigStub.calledOnce, false);
      assert.equal(initStub.calledOnce, false);
      assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
      assert.equal(getDataStub.calledOnce, false);
      assert.equal(setItemsStub.calledOnce, false);
    });

    it("should set selected text as quickPick text if shouldSearchSelection returns true", async () => {
      const [setTextStub] =
        setups.search.setupForSettingSelectedTextWhenSearchSelection();
      await controller.search();

      assert.equal(setTextStub.calledWith("test text"), true);
    });

    it("should not invoke quickPick.setText method if shouldSearchSelection returns false", async () => {
      const [setTextStub] =
        setups.search.setupForNotSettingTextWhenSearchSelectionFalse();
      await controller.search();

      assert.equal(setTextStub.calledOnce, false);
    });
  });

  describe("reload", () => {
    it("should display notification if workspace contains does not contain any folder opened", async () => {
      const [printNoFolderOpenedMessageStub] =
        setups.reload.setupForNoFolderOpenedNotification();
      await controller.reload();

      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });

    it("should workspace.index method be invoked", async () => {
      const [indexStub] = setups.reload.setupForWorkspaceIndexing();
      await controller.reload();

      assert.equal(indexStub.calledOnce, true);
    });

    it("should clear everything from cache", async () => {
      const [clearStub, clearNotSavedUriPathsStub] =
        setups.reload.setupForCacheClearing();
      await controller.reload();

      assert.equal(clearStub.calledOnce, true);
      assert.equal(clearNotSavedUriPathsStub.calledOnce, true);
    });
  });

  describe("startup", () => {
    it("should workspace.index method be invoked if shouldInitOnStartup method returns true", async () => {
      const [, , , , , indexStub] =
        setups.startup.setupForIndexingWhenEnabledOnStartup();
      await controller.startup();

      assert.equal(indexStub.calledOnce, true);
    });

    it("should do nothing if shouldInitOnStartup and shouldLoadDataFromCacheOnStartup methods return false", async () => {
      const [
        removeDataForUnsavedUrisStub,
        initStub,
        clearConfigStub,
        getDataStub,
        setItemsStub,
        indexStub,
      ] = setups.startup.setupForDoingNothingWhenConditionsFalse();
      await controller.startup();

      assert.equal(indexStub.calledOnce, false);
      assert.equal(clearConfigStub.calledOnce, false);
      assert.equal(initStub.calledOnce, false);
      assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
      assert.equal(getDataStub.calledOnce, false);
      assert.equal(setItemsStub.calledOnce, false);
    });

    it("should clear config in cache if shouldLoadDataFromCacheOnStartup method returns true", async () => {
      const [, , clearConfigStub] =
        setups.startup.setupForClearingConfigWhenLoadingFromCacheOnStartup();
      await controller.startup();

      assert.equal(clearConfigStub.calledOnce, true);
    });

    it("should init quickPick if shouldLoadDataFromCacheOnStartup method returns true and quickPick is not already initialized", async () => {
      const [, initStub] =
        setups.startup.setupForInitializingQuickPickWhenLoadingFromCacheOnStartup();
      await controller.startup();

      assert.equal(initStub.calledOnce, true);
    });

    it("should remove data for unsaved uris if shouldLoadDataFromCacheOnStartup method returns true", async () => {
      const [removeDataForUnsavedUrisStub] =
        setups.startup.setupForRemovingUnsavedUrisWhenLoadingFromCacheOnStartup();
      await controller.startup();

      assert.equal(removeDataForUnsavedUrisStub.calledOnce, true);
    });

    it("should get data and set it for quickPick if shouldLoadDataFromCacheOnStartup method returns true", async () => {
      const [, , , getDataStub, setItemsStub] =
        setups.startup.setupForGettingAndSettingDataWhenLoadingFromCacheOnStartup();
      await controller.startup();

      assert.equal(getDataStub.calledOnce, true);
      assert.equal(setItemsStub.calledOnce, true);
    });
  });

  describe("shouldIndexOnQuickPickOpen", () => {
    it("should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled method returns false and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty method returns true", () => {
      setups.shouldIndexOnQuickPickOpen.setupForTrueWhenDisabledCachingDisabledAndDataEmpty();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), true);
    });

    it("should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled method returns true and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty method returns false", () => {
      setups.shouldIndexOnQuickPickOpen.setupForTrueWhenDisabledCachingDisabledAndDataNotEmpty();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), true);
    });

    it("should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty methods return true", () => {
      setups.shouldIndexOnQuickPickOpen.setupForTrueWhenBothConditionsTrue();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), true);
    });

    it("should return false if isInitOnStartupDisabledAndWorkspaceCachingDisabled and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty methods return false", () => {
      setups.shouldIndexOnQuickPickOpen.setupForFalseWhenBothConditionsFalse();

      assert.equal(controller.shouldIndexOnQuickPickOpen(), false);
    });
  });

  describe("shouldIndexOnStartup", () => {
    it("should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled method returns false and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty method returns true", () => {
      setups.shouldIndexOnStartup.setupForTrueWhenEnabledCachingDisabledAndDataEmpty();

      assert.equal(controller.shouldIndexOnStartup(), true);
    });

    it("should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled method returns true and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty method returns false", () => {
      setups.shouldIndexOnStartup.setupForTrueWhenEnabledCachingDisabledAndDataNotEmpty();

      assert.equal(controller.shouldIndexOnStartup(), true);
    });

    it("should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty methods return true", () => {
      setups.shouldIndexOnStartup.setupForTrueWhenBothConditionsTrue();

      assert.equal(controller.shouldIndexOnStartup(), true);
    });

    it("should return false if isInitOnStartupEnabledAndWorkspaceCachingDisabled and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty methods return false", () => {
      setups.shouldIndexOnStartup.setupForFalseWhenBothConditionsFalse();

      assert.equal(controller.shouldIndexOnStartup(), false);
    });
  });

  describe("isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty", () => {
    it("should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenQuickPickInitialized();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return false if fetchShouldInitOnStartup method returns true", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenInitOnStartupTrue();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenWorkspaceCachingFalse();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return false if data is not empty", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenDataNotEmpty();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns false and fetchShouldWorkspaceDataBeCached method returns true and data is empty", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForTrueWhenAllConditionsMet();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        true
      );
    });
  });

  describe("isInitOnStartupDisabledAndWorkspaceCachingDisabled", () => {
    it("should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForFalseWhenQuickPickInitialized();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("should return false if fetchShouldInitOnStartup method returns true", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForFalseWhenInitOnStartupTrue();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("should return false if fetchShouldWorkspaceDataBeCached method returns true", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForFalseWhenWorkspaceCachingTrue();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns false and fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForTrueWhenAllConditionsMet();

      assert.equal(
        controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(),
        true
      );
    });
  });

  describe("isInitOnStartupEnabledAndWorkspaceCachingDisabled", () => {
    it("should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForFalseWhenQuickPickInitialized();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("should return false if fetchShouldInitOnStartup method returns false", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForFalseWhenInitOnStartupFalse();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("should return false if fetchShouldWorkspaceDataBeCached method returns true", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForFalseWhenWorkspaceCachingTrue();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        false
      );
    });

    it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns true and fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForTrueWhenAllConditionsMet();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(),
        true
      );
    });
  });

  describe("isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty", () => {
    it("should return false if quickPick is already initialized", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenQuickPickInitialized();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return false if fetchShouldInitOnStartup method returns false", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenInitOnStartupFalse();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenWorkspaceCachingFalse();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return false if data is not empty", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenDataNotEmpty();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        false
      );
    });

    it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns true and fetchShouldWorkspaceDataBeCached method returns true and data is empty", () => {
      setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForTrueWhenAllConditionsMet();

      assert.equal(
        controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(),
        true
      );
    });
  });

  describe("shouldSearchSelection", () => {
    it("should return false if quickPick is not initialized", () => {
      const editor =
        setups.shouldSearchSelection.setupForFalseWhenQuickPickNotInitialized();
      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it("should return false if fetchShouldSearchSelection returns false", () => {
      const editor =
        setups.shouldSearchSelection.setupForFalseWhenSearchSelectionDisabled();
      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it("should return false if editor doesn't exist", () => {
      const editor =
        setups.shouldSearchSelection.setupForFalseWhenEditorNotExists();
      assert.equal(controller.shouldSearchSelection(editor), false);
    });

    it("should return true if quickPick is initialized, fetchShouldSearchSelection returns true and editor exists", () => {
      const editor =
        setups.shouldSearchSelection.setupForTrueWhenAllConditionsMet();
      assert.equal(controller.shouldSearchSelection(editor), true);
    });
  });

  describe("shouldLoadDataFromCacheOnQuickPickOpen", () => {
    it("should return false if quickPick is already initialized", () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForFalseWhenQuickPickInitialized();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
    });

    it("should return false if fetchShouldInitOnStartup method returns true", () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForFalseWhenInitOnStartupTrue();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
    });

    it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForFalseWhenWorkspaceCachingFalse();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
    });

    it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns false and fetchShouldWorkspaceDataBeCached method returns true", () => {
      setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForTrueWhenAllConditionsMet();

      assert.equal(controller.shouldLoadDataFromCacheOnQuickPickOpen(), true);
    });
  });

  describe("shouldLoadDataFromCacheOnStartup", () => {
    it("should return false if quickPick is already initialized", () => {
      setups.shouldLoadDataFromCacheOnStartup.setupForFalseWhenQuickPickInitialized();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), false);
    });

    it("should return false if fetchShouldInitOnStartup method returns false", () => {
      setups.shouldLoadDataFromCacheOnStartup.setupForFalseWhenInitOnStartupFalse();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), false);
    });

    it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
      setups.shouldLoadDataFromCacheOnStartup.setupForFalseWhenWorkspaceCachingFalse();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), false);
    });

    it("should return true if quickPick is not initialized, fetchShouldInitOnStartup and fetchShouldWorkspaceDataBeCached methods return true", () => {
      setups.shouldLoadDataFromCacheOnStartup.setupForTrueWhenAllConditionsMet();

      assert.equal(controller.shouldLoadDataFromCacheOnStartup(), true);
    });
  });

  describe("handleWillProcessing", () => {
    it("should quickPick.showLoading and quickPick.setQuickPickPlaceholder methods be invoked with true as parameter", () => {
      const [showLoadingStub, setPlaceholderStub] =
        setups.handleWillProcessing.setupForShowingLoadingWhenQuickPickInitialized();
      controller.handleWillProcessing();

      assert.equal(showLoadingStub.calledWith(true), true);
      assert.equal(setPlaceholderStub.calledWith(true), true);
    });

    it("should quickPick.showLoading and quickPick.setQuickPickPlaceholder methods not be invoked", () => {
      const [showLoadingStub, setPlaceholderStub] =
        setups.handleWillProcessing.setupForNotShowingLoadingWhenQuickPickNotInitialized();
      controller.handleWillProcessing();

      assert.equal(showLoadingStub.calledWith(false), false);
      assert.equal(setPlaceholderStub.calledWith(false), false);
    });

    it("should quickPick.init method be invoked if quickPick is not initialized", async () => {
      const [initStub] =
        setups.handleWillProcessing.setupForInitializingQuickPickWhenNotInitialized();
      await controller.handleWillProcessing();

      assert.equal(initStub.calledOnce, true);
    });
  });

  describe("handleDidProcessing", () => {
    it("should setQuickPickData, loadItemsStub methods be invoked and and setBusy method with false as parameter", () => {
      const [setQuickPickDataStub, initStub, loadItemsStub, setBusyStub] =
        setups.handleDidProcessing.setupForSettingQuickPickDataAndLoading();

      controller.handleDidProcessing();

      assert.equal(setQuickPickDataStub.calledOnce, true);
      assert.equal(initStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });

    it("should quickPick.setItems method be invoked with data from workspace.getData method as a parameter", () => {
      const [setItemsStub] =
        setups.handleDidProcessing.setupForSettingItemsFromWorkspaceData();
      controller.handleDidProcessing();

      assert.equal(setItemsStub.calledWith(getQpItems()), true);
    });
  });

  describe("handleWillExecuteAction", () => {
    it("should quickPick.setItems be invoked with empty array if action type is rebuild", async () => {
      const [setItemsStub, loadItemsStub] =
        setups.handleWillExecuteAction.setupForClearingItemsWhenRebuildAction();
      controller.handleWillExecuteAction(getAction(ActionType.Rebuild));

      assert.equal(setItemsStub.calledWith([]), true);
      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("should do nothing if action type is different than rebuild", async () => {
      const [setItemsStub, loadItemsStub] =
        setups.handleWillExecuteAction.setupForDoingNothingWhenNonRebuildAction();
      controller.handleWillExecuteAction(getAction(ActionType.Update));

      assert.equal(setItemsStub.calledOnce, false);
      assert.equal(loadItemsStub.calledOnce, false);
    });
  });

  describe("handleDidDebounceConfigToggle", () => {
    it("should setBusy and reloadOnDidChangeValueEventListener methods be invoked", () => {
      const [setBusyStub, reloadOnDidChangeValueEventListenerStub] =
        setups.handleDidDebounceConfigToggle.setupForReloadingEventListener();

      controller.handleDidDebounceConfigToggle();

      assert.equal(setBusyStub.calledWith(true), true);
      assert.equal(reloadOnDidChangeValueEventListenerStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });
  });

  describe("handleDidSortingConfigToggle", () => {
    it("should setBusy and reloadSortingSettings methods be invoked", () => {
      const [setBusyStub, reloadSortingSettingsStub] =
        setups.handleDidSortingConfigToggle.setupForReloadingSortingSettings();

      controller.handleDidSortingConfigToggle();

      assert.equal(setBusyStub.calledWith(true), true);
      assert.equal(reloadSortingSettingsStub.calledOnce, true);
      assert.equal(setBusyStub.calledWith(false), true);
    });
  });

  describe("handleWillReindexOnConfigurationChange", () => {
    it("should quickPick.reload method be invoked", () => {
      const [reloadStub] =
        setups.handleWillReindexOnConfigurationChange.setupForReloadingQuickPick();
      controller.handleWillReindexOnConfigurationChange();

      assert.equal(reloadStub.calledOnce, true);
    });
  });
});
