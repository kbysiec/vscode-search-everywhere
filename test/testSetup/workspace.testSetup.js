"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const actionProcessorEventsEmitter = require("../../src/actionProcessorEventsEmitter");
const cache = require("../../src/cache");
const config = require("../../src/config");
const dataConverter_1 = require("../../src/dataConverter");
const dataService_1 = require("../../src/dataService");
const types_1 = require("../../src/types");
const utils_1 = require("../../src/utils");
const workspace_1 = require("../../src/workspace");
const workspaceCommon_1 = require("../../src/workspaceCommon");
const events = require("../../src/workspaceEventsEmitter");
const itemMockFactory_1 = require("../util/itemMockFactory");
const mockFactory_1 = require("../util/mockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        init: {
            setupForInvokingSetWorkspaceFoldersCommonPath: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "setWorkspaceFoldersCommonPath",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "fetchConfig",
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "fetchConfig",
                    },
                ], sandbox);
            },
            setupForInvokingDataServiceFetchConfig: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataService_1.dataService,
                        method: "fetchConfig",
                    },
                    {
                        object: utils_1.utils,
                        method: "setWorkspaceFoldersCommonPath",
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "fetchConfig",
                    },
                ], sandbox);
            },
            setupForInvokingDataConverterFetchConfig: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataConverter_1.dataConverter,
                        method: "fetchConfig",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "fetchConfig",
                    },
                    {
                        object: utils_1.utils,
                        method: "setWorkspaceFoldersCommonPath",
                    },
                ], sandbox);
            },
        },
        index: {
            setupForInvokingCommonIndexMethod: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "index",
                    },
                    {
                        object: cache,
                        method: "clear",
                    },
                ], sandbox);
            },
            setupForInvokingCacheClearMethod: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "index",
                    },
                    {
                        object: cache,
                        method: "clear",
                    },
                ], sandbox);
            },
        },
        removeDataForUnsavedUris: {
            setupForInvokingRegisterActionTwiceForEachUnsavedUri: () => {
                let notSavedUris = ["/test/path1", "/test/path2"];
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: cache,
                        method: "getNotSavedUriPaths",
                        callsFake: () => notSavedUris,
                    },
                    {
                        object: cache,
                        method: "updateNotSavedUriPaths",
                        callsFake: (paths) => (notSavedUris = paths),
                    },
                ], sandbox);
            },
            setupForClearingArrayOfUnsavedUris: () => {
                let notSavedUris = ["/test/path1", "/test/path2"];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: cache,
                        method: "getNotSavedUriPaths",
                        callsFake: () => notSavedUris,
                    },
                    {
                        object: cache,
                        method: "updateNotSavedUriPaths",
                        callsFake: (paths) => (notSavedUris = paths),
                    },
                    {
                        object: cache,
                        method: "clearNotSavedUriPaths",
                        callsFake: () => (notSavedUris = []),
                    },
                ], sandbox);
            },
        },
        registerEventListeners: {
            setupForRegisteringWorkspaceEventListeners: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.workspace,
                        method: "onDidChangeConfiguration",
                    },
                    {
                        object: vscode.workspace,
                        method: "onDidChangeWorkspaceFolders",
                    },
                    {
                        object: vscode.workspace,
                        method: "onDidChangeTextDocument",
                    },
                    {
                        object: vscode.workspace,
                        method: "onDidSaveTextDocument",
                    },
                    {
                        object: actionProcessorEventsEmitter,
                        method: "onWillProcessing",
                    },
                    {
                        object: actionProcessorEventsEmitter,
                        method: "onDidProcessing",
                    },
                    {
                        object: actionProcessorEventsEmitter,
                        method: "onWillExecuteAction",
                    },
                ], sandbox);
            },
        },
        getData: {
            setupForInvokingCommonGetDataMethod: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: (0, itemMockFactory_1.getItems)(),
                    },
                ], sandbox);
            },
        },
        shouldReindexOnConfigurationChange: {
            setupForReturningTrueWhenConfigurationChangedAndNotExcluded: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                        returns: types_1.ExcludeMode.SearchEverywhere,
                    },
                ], sandbox);
            },
            setupForReturningFalseWhenConfigurationChangedButExcluded: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                        returns: types_1.ExcludeMode.SearchEverywhere,
                    },
                ], sandbox);
            },
            setupForReturningFalseWhenConfigurationNotChanged: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                        returns: types_1.ExcludeMode.SearchEverywhere,
                    },
                ], sandbox);
            },
            setupForReturningTrueWhenFilesAndSearchModeAndFilesExcludeChanged: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                        returns: types_1.ExcludeMode.FilesAndSearch,
                    },
                ], sandbox);
            },
            setupForReturningTrueWhenFilesAndSearchModeAndSearchExcludeChanged: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                        returns: types_1.ExcludeMode.FilesAndSearch,
                    },
                ], sandbox);
            },
        },
        handleDidChangeConfiguration: {
            setupForInvokingIndexWhenExtensionConfigurationChanged: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspace_1.workspace,
                        method: "index",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "shouldReindexOnConfigurationChange",
                        returns: true,
                    },
                    {
                        object: cache,
                        method: "clearConfig",
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "fetchConfig",
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "reload",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "fetchConfig",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "reload",
                    },
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                ], sandbox);
            },
            setupForEmittingDebounceConfigToggleEvent: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspace_1.workspace,
                        method: "shouldReindexOnConfigurationChange",
                        returns: false,
                    },
                    {
                        object: utils_1.utils,
                        method: "isDebounceConfigurationToggled",
                        returns: true,
                    },
                    {
                        object: events,
                        method: "onDidDebounceConfigToggleEventEmitter",
                        returns: eventEmitter,
                        isNotMethod: true,
                    },
                    {
                        object: cache,
                        method: "clearConfig",
                    },
                ], sandbox);
                return eventEmitter;
            },
            setupForEmittingSortingConfigToggleEvent: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspace_1.workspace,
                        method: "shouldReindexOnConfigurationChange",
                        returns: false,
                    },
                    {
                        object: utils_1.utils,
                        method: "isDebounceConfigurationToggled",
                        returns: false,
                    },
                    {
                        object: utils_1.utils,
                        method: "isSortingConfigurationToggled",
                        returns: true,
                    },
                    {
                        object: events,
                        method: "onDidSortingConfigToggleEventEmitter",
                        returns: eventEmitter,
                        isNotMethod: true,
                    },
                    {
                        object: cache,
                        method: "clearConfig",
                    },
                ], sandbox);
                return eventEmitter;
            },
            setupForDoingNothingWhenExtensionConfigurationNotChanged: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: events,
                        method: "onDidDebounceConfigToggleEventEmitter",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "shouldReindexOnConfigurationChange",
                        returns: false,
                    },
                    {
                        object: utils_1.utils,
                        method: "isDebounceConfigurationToggled",
                        returns: false,
                    },
                    {
                        object: utils_1.utils,
                        method: "isSortingConfigurationToggled",
                        returns: false,
                    },
                    {
                        object: cache,
                        method: "clearConfig",
                    },
                ], sandbox);
            },
            setupForInvokingCacheClearConfigMethod: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "clearConfig",
                    },
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                    {
                        object: workspace_1.workspace,
                        method: "shouldReindexOnConfigurationChange",
                        returns: false,
                    },
                    {
                        object: utils_1.utils,
                        method: "isDebounceConfigurationToggled",
                    },
                    {
                        object: utils_1.utils,
                        method: "isSortingConfigurationToggled",
                        returns: false,
                    },
                ], sandbox);
            },
        },
        handleDidChangeWorkspaceFolders: {
            setupForInvokingIndexWhenWorkspaceFoldersChanged: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspace_1.workspace,
                        method: "index",
                    },
                    {
                        object: utils_1.utils,
                        method: "hasWorkspaceChanged",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForDoingNothingWhenWorkspaceFoldersNotChanged: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "hasWorkspaceChanged",
                        returns: false,
                    },
                ], sandbox);
            },
        },
        handleDidChangeTextDocument: {
            setupForRegisteringUpdateActionWhenDocumentChangedAndExistsInWorkspace: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "isUriExistingInWorkspace",
                        returns: Promise.resolve(true),
                    },
                ], sandbox);
            },
            setupForDoingNothingWhenDocumentNotExistInWorkspace: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "isUriExistingInWorkspace",
                        returns: Promise.resolve(false),
                    },
                ], sandbox);
            },
            setupForDoingNothingWhenDocumentNotChanged: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "isUriExistingInWorkspace",
                        returns: Promise.resolve(true),
                    },
                ], sandbox);
            },
            setupForAddingUriToNotSavedArrayWhenDocumentChangedAndExistsInWorkspace: () => {
                let notSavedUris = [];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "getNotSavedUriPaths",
                        callsFake: () => notSavedUris,
                    },
                    {
                        object: cache,
                        method: "updateNotSavedUriPaths",
                        callsFake: (paths) => (notSavedUris = paths),
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "isUriExistingInWorkspace",
                        returns: Promise.resolve(true),
                    },
                ], sandbox);
            },
        },
        handleDidRenameFiles: {
            setupForRegisteringRemoveAndUpdateActionsForRenamedFiles: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "isDirectory",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForRegisteringUpdateActionForRenamedDirectory: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "isDirectory",
                        returns: true,
                    },
                ], sandbox);
            },
        },
        handleDidCreateFiles: {
            setupForRegisteringUpdateActionWhenFileCreated: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "isDirectory",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForRegisteringUpdateActionWhenDirectoryCreated: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "isDirectory",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForAddingUriToNotSavedArray: () => {
                let notSavedUris = [];
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "getNotSavedUriPaths",
                        callsFake: () => notSavedUris,
                    },
                    {
                        object: cache,
                        method: "updateNotSavedUriPaths",
                        callsFake: (paths) => (notSavedUris = paths),
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "isDirectory",
                        returns: true,
                    },
                ], sandbox);
            },
        },
        handleDidDeleteFiles: {
            setupForRegisteringRemoveActionWhenFileDeleted: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "isDirectory",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForRegisteringRemoveActionWhenDirectoryDeleted: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "registerAction",
                    },
                    {
                        object: utils_1.utils,
                        method: "isDirectory",
                        returns: true,
                    },
                ], sandbox);
            },
        },
        handleDidSaveTextDocument: {
            setupForRemovingUriFromNotSavedArray: () => {
                let notSavedUris = [
                    "/test/path1",
                    "/test/path2",
                    "/test/path3",
                ];
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "getNotSavedUriPaths",
                        callsFake: () => notSavedUris,
                    },
                    {
                        object: cache,
                        method: "updateNotSavedUriPaths",
                        callsFake: (paths) => (notSavedUris = paths),
                    },
                ], sandbox);
            },
        },
        handleWillActionProcessorProcessing: {
            setupForEmittingOnWillProcessingEvent: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: events,
                        method: "onWillProcessingEventEmitter",
                        returns: eventEmitter,
                        isNotMethod: true,
                    },
                ], sandbox);
                return eventEmitter;
            },
        },
        handleDidActionProcessorProcessing: {
            setupForEmittingOnDidProcessingEvent: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: events,
                        method: "onDidProcessingEventEmitter",
                        returns: eventEmitter,
                        isNotMethod: true,
                    },
                ], sandbox);
                return eventEmitter;
            },
        },
        handleWillActionProcessorExecuteAction: {
            setupForEmittingOnWillExecuteActionEvent: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: events,
                        method: "onWillExecuteActionEventEmitter",
                        returns: eventEmitter,
                        isNotMethod: true,
                    },
                ], sandbox);
                return eventEmitter;
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=workspace.testSetup.js.map