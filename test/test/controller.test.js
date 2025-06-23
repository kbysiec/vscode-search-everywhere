"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const controller_1 = require("../../src/controller");
const types_1 = require("../../src/types");
const controller_testSetup_1 = require("../testSetup/controller.testSetup");
const mockFactory_1 = require("../util/mockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
describe("Controller", () => {
    let setups;
    before(() => {
        setups = (0, controller_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("init", () => {
        it("should set extensionContext", () => __awaiter(void 0, void 0, void 0, function* () {
            const extensionContext = setups.init.setupForExtensionContextAssignment();
            yield controller_1.controller.init(extensionContext);
            chai_1.assert.equal(extensionContext, controller_1.controller.getExtensionContext());
        }));
        it("should init cache", () => __awaiter(void 0, void 0, void 0, function* () {
            const [initCacheStub] = setups.init.setupForCacheInitialization();
            yield controller_1.controller.init((0, mockFactory_1.getExtensionContext)());
            chai_1.assert.equal(initCacheStub.calledOnce, true);
        }));
        it("should init workspace", () => __awaiter(void 0, void 0, void 0, function* () {
            const [initWorkspaceStub] = setups.init.setupForWorkspaceInitialization();
            yield controller_1.controller.init((0, mockFactory_1.getExtensionContext)());
            chai_1.assert.equal(initWorkspaceStub.calledOnce, true);
        }));
        it("should register event listeners", () => __awaiter(void 0, void 0, void 0, function* () {
            const [onWillProcessingStub, onDidProcessingStub, onWillExecuteActionStub, onDidDebounceConfigToggleStub, onWillReindexOnConfigurationChangeStub,] = setups.init.setupForEventListenerRegistration();
            yield controller_1.controller.init((0, mockFactory_1.getExtensionContext)());
            chai_1.assert.equal(onWillProcessingStub.calledOnce, true);
            chai_1.assert.equal(onDidProcessingStub.calledOnce, true);
            chai_1.assert.equal(onWillExecuteActionStub.calledOnce, true);
            chai_1.assert.equal(onDidDebounceConfigToggleStub.calledOnce, true);
            chai_1.assert.equal(onWillReindexOnConfigurationChangeStub.calledOnce, true);
        }));
    });
    describe("search", () => {
        it("should clear data and config from cache if shouldIndexOnQuickPickOpen method returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, clearStub] = setups.search.setupForClearingCacheWhenIndexingOnOpen();
            yield controller_1.controller.search();
            chai_1.assert.equal(clearStub.calledOnce, true);
        }));
        it("should workspace.index method be invoked if shouldIndexOnQuickPickOpen method returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [indexStub] = setups.search.setupForWorkspaceIndexingWhenIndexingOnOpen();
            yield controller_1.controller.search();
            chai_1.assert.equal(indexStub.calledOnce, true);
        }));
        it("should clear config from cache if shouldLoadDataFromCacheOnQuickPickOpen method returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, , clearConfigStub] = setups.search.setupForClearingConfigWhenLoadingFromCache();
            yield controller_1.controller.search();
            chai_1.assert.equal(clearConfigStub.calledOnce, false);
        }));
        it("should init quickPick if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, , , initStub] = setups.search.setupForInitializingQuickPickWhenLoadingFromCache();
            yield controller_1.controller.search();
            chai_1.assert.equal(initStub.calledOnce, false);
        }));
        it("should remove data for unsaved uris if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, , , removeDataForUnsavedUrisStub] = setups.search.setupForRemovingUnsavedUrisWhenLoadingFromCache();
            yield controller_1.controller.search();
            chai_1.assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
        }));
        it("get data and set it for quickPick if shouldLoadDataFromCacheOnQuickPickOpen method returns true and quickPick is not already initialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, , , , getDataStub, setItemsStub] = setups.search.setupForGettingAndSettingDataWhenLoadingFromCache();
            yield controller_1.controller.search();
            chai_1.assert.equal(getDataStub.calledOnce, false);
            chai_1.assert.equal(setItemsStub.calledOnce, false);
        }));
        it("should quickPick.show and quickPick.loadUnsortedItems methods be invoked if quickPick is initialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const [loadItemsStub, showStub] = setups.search.setupForShowingQuickPickWhenInitialized();
            yield controller_1.controller.search();
            chai_1.assert.equal(loadItemsStub.calledOnce, true);
            chai_1.assert.equal(showStub.calledOnce, true);
        }));
        it("should quickPick.show and quickPick.loadUnsortedItems methods not be invoked if quickPick is not initialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const [loadItemsStub, showStub] = setups.search.setupForNotShowingQuickPickWhenNotInitialized();
            yield controller_1.controller.search();
            chai_1.assert.equal(loadItemsStub.calledOnce, false);
            chai_1.assert.equal(showStub.calledOnce, false);
        }));
        it("should do nothing if shouldIndexOnQuickPickOpen and shouldLoadDataFromCacheOnQuickPickOpen methods return false", () => __awaiter(void 0, void 0, void 0, function* () {
            const [indexStub, clearStub, clearConfigStub, initStub, removeDataForUnsavedUrisStub, getDataStub, setItemsStub,] = setups.search.setupForDoingNothingWhenConditionsFalse();
            yield controller_1.controller.search();
            chai_1.assert.equal(indexStub.calledOnce, false);
            chai_1.assert.equal(clearStub.calledOnce, false);
            chai_1.assert.equal(clearConfigStub.calledOnce, false);
            chai_1.assert.equal(initStub.calledOnce, false);
            chai_1.assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
            chai_1.assert.equal(getDataStub.calledOnce, false);
            chai_1.assert.equal(setItemsStub.calledOnce, false);
        }));
        it("should set selected text as quickPick text if shouldSearchSelection returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [setTextStub] = setups.search.setupForSettingSelectedTextWhenSearchSelection();
            yield controller_1.controller.search();
            chai_1.assert.equal(setTextStub.calledWith("test text"), true);
        }));
        it("should not invoke quickPick.setText method if shouldSearchSelection returns false", () => __awaiter(void 0, void 0, void 0, function* () {
            const [setTextStub] = setups.search.setupForNotSettingTextWhenSearchSelectionFalse();
            yield controller_1.controller.search();
            chai_1.assert.equal(setTextStub.calledOnce, false);
        }));
    });
    describe("reload", () => {
        it("should display notification if workspace contains does not contain any folder opened", () => __awaiter(void 0, void 0, void 0, function* () {
            const [printNoFolderOpenedMessageStub] = setups.reload.setupForNoFolderOpenedNotification();
            yield controller_1.controller.reload();
            chai_1.assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
        }));
        it("should workspace.index method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [indexStub] = setups.reload.setupForWorkspaceIndexing();
            yield controller_1.controller.reload();
            chai_1.assert.equal(indexStub.calledOnce, true);
        }));
        it("should clear everything from cache", () => __awaiter(void 0, void 0, void 0, function* () {
            const [clearStub, clearNotSavedUriPathsStub] = setups.reload.setupForCacheClearing();
            yield controller_1.controller.reload();
            chai_1.assert.equal(clearStub.calledOnce, true);
            chai_1.assert.equal(clearNotSavedUriPathsStub.calledOnce, true);
        }));
    });
    describe("startup", () => {
        it("should workspace.index method be invoked if shouldInitOnStartup method returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, , , , , indexStub] = setups.startup.setupForIndexingWhenEnabledOnStartup();
            yield controller_1.controller.startup();
            chai_1.assert.equal(indexStub.calledOnce, true);
        }));
        it("should do nothing if shouldInitOnStartup and shouldLoadDataFromCacheOnStartup methods return false", () => __awaiter(void 0, void 0, void 0, function* () {
            const [removeDataForUnsavedUrisStub, initStub, clearConfigStub, getDataStub, setItemsStub, indexStub,] = setups.startup.setupForDoingNothingWhenConditionsFalse();
            yield controller_1.controller.startup();
            chai_1.assert.equal(indexStub.calledOnce, false);
            chai_1.assert.equal(clearConfigStub.calledOnce, false);
            chai_1.assert.equal(initStub.calledOnce, false);
            chai_1.assert.equal(removeDataForUnsavedUrisStub.calledOnce, false);
            chai_1.assert.equal(getDataStub.calledOnce, false);
            chai_1.assert.equal(setItemsStub.calledOnce, false);
        }));
        it("should clear config in cache if shouldLoadDataFromCacheOnStartup method returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, , clearConfigStub] = setups.startup.setupForClearingConfigWhenLoadingFromCacheOnStartup();
            yield controller_1.controller.startup();
            chai_1.assert.equal(clearConfigStub.calledOnce, true);
        }));
        it("should init quickPick if shouldLoadDataFromCacheOnStartup method returns true and quickPick is not already initialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, initStub] = setups.startup.setupForInitializingQuickPickWhenLoadingFromCacheOnStartup();
            yield controller_1.controller.startup();
            chai_1.assert.equal(initStub.calledOnce, true);
        }));
        it("should remove data for unsaved uris if shouldLoadDataFromCacheOnStartup method returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [removeDataForUnsavedUrisStub] = setups.startup.setupForRemovingUnsavedUrisWhenLoadingFromCacheOnStartup();
            yield controller_1.controller.startup();
            chai_1.assert.equal(removeDataForUnsavedUrisStub.calledOnce, true);
        }));
        it("should get data and set it for quickPick if shouldLoadDataFromCacheOnStartup method returns true", () => __awaiter(void 0, void 0, void 0, function* () {
            const [, , , getDataStub, setItemsStub] = setups.startup.setupForGettingAndSettingDataWhenLoadingFromCacheOnStartup();
            yield controller_1.controller.startup();
            chai_1.assert.equal(getDataStub.calledOnce, true);
            chai_1.assert.equal(setItemsStub.calledOnce, true);
        }));
    });
    describe("shouldIndexOnQuickPickOpen", () => {
        it("should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled method returns false and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty method returns true", () => {
            setups.shouldIndexOnQuickPickOpen.setupForTrueWhenDisabledCachingDisabledAndDataEmpty();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnQuickPickOpen(), true);
        });
        it("should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled method returns true and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty method returns false", () => {
            setups.shouldIndexOnQuickPickOpen.setupForTrueWhenDisabledCachingDisabledAndDataNotEmpty();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnQuickPickOpen(), true);
        });
        it("should return true if isInitOnStartupDisabledAndWorkspaceCachingDisabled and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty methods return true", () => {
            setups.shouldIndexOnQuickPickOpen.setupForTrueWhenBothConditionsTrue();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnQuickPickOpen(), true);
        });
        it("should return false if isInitOnStartupDisabledAndWorkspaceCachingDisabled and isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty methods return false", () => {
            setups.shouldIndexOnQuickPickOpen.setupForFalseWhenBothConditionsFalse();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnQuickPickOpen(), false);
        });
    });
    describe("shouldIndexOnStartup", () => {
        it("should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled method returns false and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty method returns true", () => {
            setups.shouldIndexOnStartup.setupForTrueWhenEnabledCachingDisabledAndDataEmpty();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnStartup(), true);
        });
        it("should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled method returns true and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty method returns false", () => {
            setups.shouldIndexOnStartup.setupForTrueWhenEnabledCachingDisabledAndDataNotEmpty();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnStartup(), true);
        });
        it("should return true if isInitOnStartupEnabledAndWorkspaceCachingDisabled and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty methods return true", () => {
            setups.shouldIndexOnStartup.setupForTrueWhenBothConditionsTrue();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnStartup(), true);
        });
        it("should return false if isInitOnStartupEnabledAndWorkspaceCachingDisabled and isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty methods return false", () => {
            setups.shouldIndexOnStartup.setupForFalseWhenBothConditionsFalse();
            chai_1.assert.equal(controller_1.controller.shouldIndexOnStartup(), false);
        });
    });
    describe("isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty", () => {
        it("should return false if quickPick is already initialized", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenQuickPickInitialized();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return false if fetchShouldInitOnStartup method returns true", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenInitOnStartupTrue();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenWorkspaceCachingFalse();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return false if data is not empty", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenDataNotEmpty();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns false and fetchShouldWorkspaceDataBeCached method returns true and data is empty", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForTrueWhenAllConditionsMet();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty(), true);
        });
    });
    describe("isInitOnStartupDisabledAndWorkspaceCachingDisabled", () => {
        it("should return false if quickPick is already initialized", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForFalseWhenQuickPickInitialized();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(), false);
        });
        it("should return false if fetchShouldInitOnStartup method returns true", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForFalseWhenInitOnStartupTrue();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(), false);
        });
        it("should return false if fetchShouldWorkspaceDataBeCached method returns true", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForFalseWhenWorkspaceCachingTrue();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(), false);
        });
        it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns false and fetchShouldWorkspaceDataBeCached method returns false", () => {
            setups.isInitOnStartupDisabledAndWorkspaceCachingDisabled.setupForTrueWhenAllConditionsMet();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled(), true);
        });
    });
    describe("isInitOnStartupEnabledAndWorkspaceCachingDisabled", () => {
        it("should return false if quickPick is already initialized", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForFalseWhenQuickPickInitialized();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(), false);
        });
        it("should return false if fetchShouldInitOnStartup method returns false", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForFalseWhenInitOnStartupFalse();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(), false);
        });
        it("should return false if fetchShouldWorkspaceDataBeCached method returns true", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForFalseWhenWorkspaceCachingTrue();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(), false);
        });
        it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns true and fetchShouldWorkspaceDataBeCached method returns false", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingDisabled.setupForTrueWhenAllConditionsMet();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled(), true);
        });
    });
    describe("isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty", () => {
        it("should return false if quickPick is already initialized", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenQuickPickInitialized();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return false if fetchShouldInitOnStartup method returns false", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenInitOnStartupFalse();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenWorkspaceCachingFalse();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return false if data is not empty", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForFalseWhenDataNotEmpty();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(), false);
        });
        it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns true and fetchShouldWorkspaceDataBeCached method returns true and data is empty", () => {
            setups.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty.setupForTrueWhenAllConditionsMet();
            chai_1.assert.equal(controller_1.controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(), true);
        });
    });
    describe("shouldSearchSelection", () => {
        it("should return false if quickPick is not initialized", () => {
            const editor = setups.shouldSearchSelection.setupForFalseWhenQuickPickNotInitialized();
            chai_1.assert.equal(controller_1.controller.shouldSearchSelection(editor), false);
        });
        it("should return false if fetchShouldSearchSelection returns false", () => {
            const editor = setups.shouldSearchSelection.setupForFalseWhenSearchSelectionDisabled();
            chai_1.assert.equal(controller_1.controller.shouldSearchSelection(editor), false);
        });
        it("should return false if editor doesn't exist", () => {
            const editor = setups.shouldSearchSelection.setupForFalseWhenEditorNotExists();
            chai_1.assert.equal(controller_1.controller.shouldSearchSelection(editor), false);
        });
        it("should return true if quickPick is initialized, fetchShouldSearchSelection returns true and editor exists", () => {
            const editor = setups.shouldSearchSelection.setupForTrueWhenAllConditionsMet();
            chai_1.assert.equal(controller_1.controller.shouldSearchSelection(editor), true);
        });
    });
    describe("shouldLoadDataFromCacheOnQuickPickOpen", () => {
        it("should return false if quickPick is already initialized", () => {
            setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForFalseWhenQuickPickInitialized();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
        });
        it("should return false if fetchShouldInitOnStartup method returns true", () => {
            setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForFalseWhenInitOnStartupTrue();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
        });
        it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
            setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForFalseWhenWorkspaceCachingFalse();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnQuickPickOpen(), false);
        });
        it("should return true if quickPick is not initialized, fetchShouldInitOnStartup method returns false and fetchShouldWorkspaceDataBeCached method returns true", () => {
            setups.shouldLoadDataFromCacheOnQuickPickOpen.setupForTrueWhenAllConditionsMet();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnQuickPickOpen(), true);
        });
    });
    describe("shouldLoadDataFromCacheOnStartup", () => {
        it("should return false if quickPick is already initialized", () => {
            setups.shouldLoadDataFromCacheOnStartup.setupForFalseWhenQuickPickInitialized();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnStartup(), false);
        });
        it("should return false if fetchShouldInitOnStartup method returns false", () => {
            setups.shouldLoadDataFromCacheOnStartup.setupForFalseWhenInitOnStartupFalse();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnStartup(), false);
        });
        it("should return false if fetchShouldWorkspaceDataBeCached method returns false", () => {
            setups.shouldLoadDataFromCacheOnStartup.setupForFalseWhenWorkspaceCachingFalse();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnStartup(), false);
        });
        it("should return true if quickPick is not initialized, fetchShouldInitOnStartup and fetchShouldWorkspaceDataBeCached methods return true", () => {
            setups.shouldLoadDataFromCacheOnStartup.setupForTrueWhenAllConditionsMet();
            chai_1.assert.equal(controller_1.controller.shouldLoadDataFromCacheOnStartup(), true);
        });
    });
    describe("handleWillProcessing", () => {
        it("should quickPick.showLoading and quickPick.setQuickPickPlaceholder methods be invoked with true as parameter", () => {
            const [showLoadingStub, setPlaceholderStub] = setups.handleWillProcessing.setupForShowingLoadingWhenQuickPickInitialized();
            controller_1.controller.handleWillProcessing();
            chai_1.assert.equal(showLoadingStub.calledWith(true), true);
            chai_1.assert.equal(setPlaceholderStub.calledWith(true), true);
        });
        it("should quickPick.showLoading and quickPick.setQuickPickPlaceholder methods not be invoked", () => {
            const [showLoadingStub, setPlaceholderStub] = setups.handleWillProcessing.setupForNotShowingLoadingWhenQuickPickNotInitialized();
            controller_1.controller.handleWillProcessing();
            chai_1.assert.equal(showLoadingStub.calledWith(false), false);
            chai_1.assert.equal(setPlaceholderStub.calledWith(false), false);
        });
        it("should quickPick.init method be invoked if quickPick is not initialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const [initStub] = setups.handleWillProcessing.setupForInitializingQuickPickWhenNotInitialized();
            yield controller_1.controller.handleWillProcessing();
            chai_1.assert.equal(initStub.calledOnce, true);
        }));
    });
    describe("handleDidProcessing", () => {
        it("should setQuickPickData, loadItemsStub methods be invoked and and setBusy method with false as parameter", () => {
            const [setQuickPickDataStub, initStub, loadItemsStub, setBusyStub] = setups.handleDidProcessing.setupForSettingQuickPickDataAndLoading();
            controller_1.controller.handleDidProcessing();
            chai_1.assert.equal(setQuickPickDataStub.calledOnce, true);
            chai_1.assert.equal(initStub.calledOnce, false);
            chai_1.assert.equal(loadItemsStub.calledOnce, true);
            chai_1.assert.equal(setBusyStub.calledWith(false), true);
        });
        it("should quickPick.setItems method be invoked with data from workspace.getData method as a parameter", () => {
            const [setItemsStub] = setups.handleDidProcessing.setupForSettingItemsFromWorkspaceData();
            controller_1.controller.handleDidProcessing();
            chai_1.assert.equal(setItemsStub.calledWith((0, qpItemMockFactory_1.getQpItems)()), true);
        });
    });
    describe("handleWillExecuteAction", () => {
        it("should quickPick.setItems be invoked with empty array if action type is rebuild", () => __awaiter(void 0, void 0, void 0, function* () {
            const [setItemsStub, loadItemsStub] = setups.handleWillExecuteAction.setupForClearingItemsWhenRebuildAction();
            controller_1.controller.handleWillExecuteAction((0, mockFactory_1.getAction)(types_1.ActionType.Rebuild));
            chai_1.assert.equal(setItemsStub.calledWith([]), true);
            chai_1.assert.equal(loadItemsStub.calledOnce, true);
        }));
        it("should do nothing if action type is different than rebuild", () => __awaiter(void 0, void 0, void 0, function* () {
            const [setItemsStub, loadItemsStub] = setups.handleWillExecuteAction.setupForDoingNothingWhenNonRebuildAction();
            controller_1.controller.handleWillExecuteAction((0, mockFactory_1.getAction)(types_1.ActionType.Update));
            chai_1.assert.equal(setItemsStub.calledOnce, false);
            chai_1.assert.equal(loadItemsStub.calledOnce, false);
        }));
    });
    describe("handleDidDebounceConfigToggle", () => {
        it("should setBusy and reloadOnDidChangeValueEventListener methods be invoked", () => {
            const [setBusyStub, reloadOnDidChangeValueEventListenerStub] = setups.handleDidDebounceConfigToggle.setupForReloadingEventListener();
            controller_1.controller.handleDidDebounceConfigToggle();
            chai_1.assert.equal(setBusyStub.calledWith(true), true);
            chai_1.assert.equal(reloadOnDidChangeValueEventListenerStub.calledOnce, true);
            chai_1.assert.equal(setBusyStub.calledWith(false), true);
        });
    });
    describe("handleDidSortingConfigToggle", () => {
        it("should setBusy and reloadSortingSettings methods be invoked", () => {
            const [setBusyStub, reloadSortingSettingsStub] = setups.handleDidSortingConfigToggle.setupForReloadingSortingSettings();
            controller_1.controller.handleDidSortingConfigToggle();
            chai_1.assert.equal(setBusyStub.calledWith(true), true);
            chai_1.assert.equal(reloadSortingSettingsStub.calledOnce, true);
            chai_1.assert.equal(setBusyStub.calledWith(false), true);
        });
    });
    describe("handleWillReindexOnConfigurationChange", () => {
        it("should quickPick.reload method be invoked", () => {
            const [reloadStub] = setups.handleWillReindexOnConfigurationChange.setupForReloadingQuickPick();
            controller_1.controller.handleWillReindexOnConfigurationChange();
            chai_1.assert.equal(reloadStub.calledOnce, true);
        });
    });
});
//# sourceMappingURL=controller.test.js.map