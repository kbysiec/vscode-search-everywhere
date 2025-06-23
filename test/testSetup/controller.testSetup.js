"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const cache = require("../../src/cache");
const config = require("../../src/config");
const controller_1 = require("../../src/controller");
const patternProvider_1 = require("../../src/patternProvider");
const quickPick_1 = require("../../src/quickPick");
const utils_1 = require("../../src/utils");
const workspace_1 = require("../../src/workspace");
const workspaceEventsEmitter = require("../../src/workspaceEventsEmitter");
const mockFactory_1 = require("../util/mockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
const stubFactory_1 = require("../util/stubFactory");
const stubHelpers_1 = require("../util/stubHelpers");
function stubComponents(sandbox) {
    return (0, stubHelpers_1.stubMultiple)([
        {
            object: cache,
            method: "initCache",
        },
        {
            object: workspace_1.workspace,
            method: "init",
        },
        {
            object: workspace_1.workspace,
            method: "registerEventListeners",
        },
        {
            object: workspaceEventsEmitter,
            method: "onWillProcessing",
        },
        {
            object: workspaceEventsEmitter,
            method: "onDidProcessing",
        },
        {
            object: workspaceEventsEmitter,
            method: "onWillExecuteAction",
        },
        {
            object: workspaceEventsEmitter,
            method: "onDidDebounceConfigToggle",
        },
        {
            object: workspaceEventsEmitter,
            method: "onWillReindexOnConfigurationChange",
        },
    ], sandbox);
}
function stubComponentsForStartup(sandbox, returnsValues) {
    return (0, stubHelpers_1.stubMultiple)([
        {
            object: workspace_1.workspace,
            method: "removeDataForUnsavedUris",
            returns: returnsValues.removeDataForUnsavedUris,
        },
        {
            object: quickPick_1.quickPick,
            method: "init",
            returns: returnsValues.init,
        },
        {
            object: cache,
            method: "clearConfig",
            returns: returnsValues.clearConfig,
        },
        {
            object: workspace_1.workspace,
            method: "getData",
            returns: returnsValues.getData,
        },
        {
            object: quickPick_1.quickPick,
            method: "setItems",
            returns: returnsValues.setItems,
        },
        {
            object: workspace_1.workspace,
            method: "index",
            returns: returnsValues.index,
        },
        {
            object: quickPick_1.quickPick,
            method: "isInitialized",
            returns: returnsValues.isInitialized,
        },
        {
            object: controller_1.controller,
            method: "shouldIndexOnStartup",
            returns: returnsValues.shouldIndexOnStartup,
        },
        {
            object: controller_1.controller,
            method: "shouldLoadDataFromCacheOnStartup",
            returns: returnsValues.shouldLoadDataFromCacheOnStartup,
        },
    ], sandbox);
}
function stubComponentsForSearch(sandbox, returnsValues) {
    return (0, stubHelpers_1.stubMultiple)([
        {
            object: workspace_1.workspace,
            method: "index",
            returns: returnsValues.index,
        },
        {
            object: cache,
            method: "clear",
            returns: returnsValues.clear,
        },
        {
            object: cache,
            method: "clearConfig",
            returns: returnsValues.clearConfig,
        },
        {
            object: quickPick_1.quickPick,
            method: "init",
            returns: returnsValues.init,
        },
        {
            object: workspace_1.workspace,
            method: "removeDataForUnsavedUris",
            returns: returnsValues.removeDataForUnsavedUris,
        },
        {
            object: workspace_1.workspace,
            method: "getData",
            returns: returnsValues.getData,
        },
        {
            object: quickPick_1.quickPick,
            method: "setItems",
            returns: returnsValues.setItems,
        },
        {
            object: quickPick_1.quickPick,
            method: "isInitialized",
            returns: returnsValues.isInitialized,
        },
        {
            object: controller_1.controller,
            method: "shouldIndexOnQuickPickOpen",
            returns: returnsValues.shouldIndexOnQuickPickOpen,
        },
        {
            object: controller_1.controller,
            method: "shouldLoadDataFromCacheOnQuickPickOpen",
            returns: returnsValues.shouldIndexOnQuickPickOpen,
        },
        {
            object: controller_1.controller,
            method: "shouldSearchSelection",
            returns: returnsValues.shouldSearchSelection,
        },
    ], sandbox);
}
function stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, returnsValues) {
    return (0, stubHelpers_1.stubMultiple)([
        {
            object: quickPick_1.quickPick,
            method: "isInitialized",
            returns: returnsValues.isInitialized,
        },
        {
            object: config,
            method: "fetchShouldInitOnStartup",
            returns: returnsValues.fetchShouldInitOnStartup,
        },
        {
            object: config,
            method: "fetchShouldWorkspaceDataBeCached",
            returns: returnsValues.fetchShouldWorkspaceDataBeCached,
        },
        {
            object: workspace_1.workspace,
            method: "getData",
            returns: returnsValues.getData,
        },
    ], sandbox);
}
function stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, returnsValues) {
    return stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, returnsValues);
}
function stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, returnsValues) {
    return stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, returnsValues);
}
function stubComponentsForShouldSearchSelection(sandbox, returnsValues) {
    return (0, stubHelpers_1.stubMultiple)([
        {
            object: quickPick_1.quickPick,
            method: "isInitialized",
            returns: returnsValues.isInitialized,
        },
        {
            object: config,
            method: "fetchShouldSearchSelection",
            returns: returnsValues.fetchShouldSearchSelection,
        },
    ], sandbox);
}
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        init: {
            setupForExtensionContextAssignment: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "initCache",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "init",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "registerEventListeners",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillExecuteAction",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidDebounceConfigToggle",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillReindexOnConfigurationChange",
                    },
                ], sandbox);
                return (0, mockFactory_1.getExtensionContext)();
            },
            setupForCacheInitialization: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "initCache",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "init",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "registerEventListeners",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillExecuteAction",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidDebounceConfigToggle",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillReindexOnConfigurationChange",
                    },
                ], sandbox);
            },
            setupForWorkspaceInitialization: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspace_1.workspace,
                        method: "init",
                    },
                    {
                        object: cache,
                        method: "initCache",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "registerEventListeners",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillExecuteAction",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidDebounceConfigToggle",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillReindexOnConfigurationChange",
                    },
                ], sandbox);
            },
            setupForEventListenerRegistration: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidProcessing",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillExecuteAction",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onDidDebounceConfigToggle",
                    },
                    {
                        object: workspaceEventsEmitter,
                        method: "onWillReindexOnConfigurationChange",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "init",
                    },
                    {
                        object: cache,
                        method: "initCache",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "registerEventListeners",
                    },
                ], sandbox);
            },
        },
        search: {
            setupForClearingCacheWhenIndexingOnOpen: () => {
                stubComponents(sandbox);
                return stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: true,
                    shouldLoadDataFromCacheOnQuickPickOpen: false,
                });
            },
            setupForWorkspaceIndexingWhenIndexingOnOpen: () => {
                stubComponents(sandbox);
                return stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: true,
                    shouldLoadDataFromCacheOnQuickPickOpen: false,
                });
            },
            setupForClearingConfigWhenLoadingFromCache: () => {
                stubComponents(sandbox);
                return stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: true,
                });
            },
            setupForInitializingQuickPickWhenLoadingFromCache: () => {
                stubComponents(sandbox);
                return stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: true,
                });
            },
            setupForRemovingUnsavedUrisWhenLoadingFromCache: () => {
                stubComponents(sandbox);
                return stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: true,
                });
            },
            setupForGettingAndSettingDataWhenLoadingFromCache: () => {
                stubComponents(sandbox);
                return stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: true,
                });
            },
            setupForShowingQuickPickWhenInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForSearch(sandbox, {
                    isInitialized: true,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: false,
                });
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "show",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "setText",
                    },
                ], sandbox);
            },
            setupForNotShowingQuickPickWhenNotInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: false,
                });
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "show",
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludePatterns",
                        returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
                    },
                ], sandbox);
            },
            setupForDoingNothingWhenConditionsFalse: () => {
                stubComponents(sandbox);
                return stubComponentsForSearch(sandbox, {
                    isInitialized: false,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: false,
                });
            },
            setupForSettingSelectedTextWhenSearchSelection: () => {
                stubComponents(sandbox);
                stubComponentsForSearch(sandbox, {
                    isInitialized: true,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: false,
                    shouldSearchSelection: true,
                });
                const editor = (0, stubFactory_1.getTextEditorStub)(true, "test text");
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "setText",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "show",
                    },
                    {
                        object: utils_1.utils,
                        method: "sleepAndExecute",
                    },
                    {
                        object: vscode.window,
                        method: "activeTextEditor",
                        isNotMethod: true,
                        returns: editor,
                    },
                ], sandbox);
            },
            setupForNotSettingTextWhenSearchSelectionFalse: () => {
                stubComponents(sandbox);
                stubComponentsForSearch(sandbox, {
                    isInitialized: true,
                    shouldIndexOnQuickPickOpen: false,
                    shouldLoadDataFromCacheOnQuickPickOpen: false,
                    shouldSearchSelection: false,
                });
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "setText",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "show",
                    },
                ], sandbox);
            },
        },
        reload: {
            setupForNoFolderOpenedNotification: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "printNoFolderOpenedMessage",
                    },
                    {
                        object: cache,
                        method: "clear",
                    },
                    {
                        object: cache,
                        method: "clearNotSavedUriPaths",
                    },
                    {
                        object: utils_1.utils,
                        method: "hasWorkspaceAnyFolder",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForWorkspaceIndexing: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspace_1.workspace,
                        method: "index",
                    },
                    {
                        object: cache,
                        method: "clear",
                    },
                    {
                        object: cache,
                        method: "clearNotSavedUriPaths",
                    },
                    {
                        object: utils_1.utils,
                        method: "hasWorkspaceAnyFolder",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForCacheClearing: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "clear",
                    },
                    {
                        object: cache,
                        method: "clearNotSavedUriPaths",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "index",
                    },
                    {
                        object: utils_1.utils,
                        method: "hasWorkspaceAnyFolder",
                        returns: true,
                    },
                ], sandbox);
            },
        },
        startup: {
            setupForIndexingWhenEnabledOnStartup: () => {
                stubComponents(sandbox);
                return stubComponentsForStartup(sandbox, {
                    shouldIndexOnStartup: true,
                    shouldLoadDataFromCacheOnStartup: false,
                });
            },
            setupForDoingNothingWhenConditionsFalse: () => {
                stubComponents(sandbox);
                return stubComponentsForStartup(sandbox, {
                    isInitialized: false,
                    shouldIndexOnStartup: false,
                    shouldLoadDataFromCacheOnStartup: false,
                });
            },
            setupForClearingConfigWhenLoadingFromCacheOnStartup: () => {
                stubComponents(sandbox);
                return stubComponentsForStartup(sandbox, {
                    isInitialized: false,
                    shouldIndexOnStartup: false,
                    shouldLoadDataFromCacheOnStartup: true,
                });
            },
            setupForInitializingQuickPickWhenLoadingFromCacheOnStartup: () => {
                stubComponents(sandbox);
                return stubComponentsForStartup(sandbox, {
                    isInitialized: false,
                    shouldIndexOnStartup: false,
                    shouldLoadDataFromCacheOnStartup: true,
                });
            },
            setupForRemovingUnsavedUrisWhenLoadingFromCacheOnStartup: () => {
                stubComponents(sandbox);
                return stubComponentsForStartup(sandbox, {
                    isInitialized: false,
                    shouldIndexOnStartup: false,
                    shouldLoadDataFromCacheOnStartup: true,
                });
            },
            setupForGettingAndSettingDataWhenLoadingFromCacheOnStartup: () => {
                stubComponents(sandbox);
                return stubComponentsForStartup(sandbox, {
                    isInitialized: false,
                    shouldIndexOnStartup: false,
                    shouldLoadDataFromCacheOnStartup: true,
                });
            },
        },
        shouldIndexOnQuickPickOpen: {
            setupForTrueWhenDisabledCachingDisabledAndDataEmpty: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
                        returns: false,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForTrueWhenDisabledCachingDisabledAndDataNotEmpty: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
                        returns: true,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForTrueWhenBothConditionsTrue: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
                        returns: true,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForFalseWhenBothConditionsFalse: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
                        returns: false,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: false,
                    },
                ], sandbox);
            },
        },
        shouldIndexOnStartup: {
            setupForTrueWhenEnabledCachingDisabledAndDataEmpty: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
                        returns: false,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForTrueWhenEnabledCachingDisabledAndDataNotEmpty: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
                        returns: true,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForTrueWhenBothConditionsTrue: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
                        returns: true,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForFalseWhenBothConditionsFalse: () => {
                stubComponents(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
                        returns: false,
                    },
                    {
                        object: controller_1.controller,
                        method: "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
                        returns: false,
                    },
                ], sandbox);
            },
        },
        isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty: {
            setupForFalseWhenQuickPickInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: true,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [],
                });
            },
            setupForFalseWhenInitOnStartupTrue: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [],
                });
            },
            setupForFalseWhenWorkspaceCachingFalse: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: false,
                    getData: [],
                });
            },
            setupForFalseWhenDataNotEmpty: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [(0, qpItemMockFactory_1.getQpItem)()],
                });
            },
            setupForTrueWhenAllConditionsMet: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [],
                });
            },
        },
        isInitOnStartupDisabledAndWorkspaceCachingDisabled: {
            setupForFalseWhenQuickPickInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: true,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
            setupForFalseWhenInitOnStartupTrue: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
            setupForFalseWhenWorkspaceCachingTrue: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
            setupForTrueWhenAllConditionsMet: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
        },
        isInitOnStartupEnabledAndWorkspaceCachingDisabled: {
            setupForFalseWhenQuickPickInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: true,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
            setupForFalseWhenInitOnStartupFalse: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
            setupForFalseWhenWorkspaceCachingTrue: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
            setupForTrueWhenAllConditionsMet: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
        },
        isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty: {
            setupForFalseWhenQuickPickInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: true,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [],
                });
            },
            setupForFalseWhenInitOnStartupFalse: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [],
                });
            },
            setupForFalseWhenWorkspaceCachingFalse: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: false,
                    getData: [],
                });
            },
            setupForFalseWhenDataNotEmpty: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [(0, qpItemMockFactory_1.getQpItem)()],
                });
            },
            setupForTrueWhenAllConditionsMet: () => {
                stubComponents(sandbox);
                stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                    getData: [],
                });
            },
        },
        shouldSearchSelection: {
            setupForFalseWhenQuickPickNotInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForShouldSearchSelection(sandbox, {
                    isInitialized: false,
                    fetchShouldSearchSelection: true,
                });
                const editor = (0, stubFactory_1.getTextEditorStub)(true, "test text");
                return editor;
            },
            setupForFalseWhenSearchSelectionDisabled: () => {
                stubComponents(sandbox);
                stubComponentsForShouldSearchSelection(sandbox, {
                    isInitialized: true,
                    fetchShouldSearchSelection: false,
                });
                const editor = (0, stubFactory_1.getTextEditorStub)(true, "test text");
                return editor;
            },
            setupForFalseWhenEditorNotExists: () => {
                stubComponents(sandbox);
                stubComponentsForShouldSearchSelection(sandbox, {
                    isInitialized: true,
                    fetchShouldSearchSelection: true,
                });
                const editor = undefined;
                return editor;
            },
            setupForTrueWhenAllConditionsMet: () => {
                stubComponents(sandbox);
                stubComponentsForShouldSearchSelection(sandbox, {
                    isInitialized: true,
                    fetchShouldSearchSelection: true,
                });
                const editor = (0, stubFactory_1.getTextEditorStub)(true, "test text");
                return editor;
            },
        },
        shouldLoadDataFromCacheOnQuickPickOpen: {
            setupForFalseWhenQuickPickInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
                    isInitialized: true,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
            setupForFalseWhenInitOnStartupTrue: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
            setupForFalseWhenWorkspaceCachingFalse: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
            setupForTrueWhenAllConditionsMet: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
        },
        shouldLoadDataFromCacheOnStartup: {
            setupForFalseWhenQuickPickInitialized: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
                    isInitialized: true,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
            setupForFalseWhenInitOnStartupFalse: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: false,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
            setupForFalseWhenWorkspaceCachingFalse: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: false,
                });
            },
            setupForTrueWhenAllConditionsMet: () => {
                stubComponents(sandbox);
                stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
                    isInitialized: false,
                    fetchShouldInitOnStartup: true,
                    fetchShouldWorkspaceDataBeCached: true,
                });
            },
        },
        handleWillProcessing: {
            setupForShowingLoadingWhenQuickPickInitialized: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "showLoading",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "setPlaceholder",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "isInitialized",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForNotShowingLoadingWhenQuickPickNotInitialized: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "showLoading",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "setPlaceholder",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "fetchConfig",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "isInitialized",
                        returns: false,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "init",
                    },
                ], sandbox);
            },
            setupForInitializingQuickPickWhenNotInitialized: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "init",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "isInitialized",
                        returns: false,
                    },
                ], sandbox);
            },
        },
        handleDidProcessing: {
            setupForSettingQuickPickDataAndLoading: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "setQuickPickData",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "init",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                    {
                        object: controller_1.controller,
                        method: "setBusy",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "isInitialized",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForSettingItemsFromWorkspaceData: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "setItems",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "isInitialized",
                    },
                ], sandbox);
            },
        },
        handleWillExecuteAction: {
            setupForClearingItemsWhenRebuildAction: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "setItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                ], sandbox);
            },
            setupForDoingNothingWhenNonRebuildAction: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "setItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                ], sandbox);
            },
        },
        handleDidDebounceConfigToggle: {
            setupForReloadingEventListener: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "setBusy",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "reloadOnDidChangeValueEventListener",
                    },
                ], sandbox);
            },
        },
        handleDidSortingConfigToggle: {
            setupForReloadingSortingSettings: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "setBusy",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "reloadSortingSettings",
                    },
                ], sandbox);
            },
        },
        handleWillReindexOnConfigurationChange: {
            setupForReloadingQuickPick: () => {
                stubComponents(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "reload",
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=controller.testSetup.js.map