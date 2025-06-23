import * as sinon from "sinon";
import * as vscode from "vscode";
import * as actionProcessorEventsEmitter from "../../src/actionProcessorEventsEmitter";
import * as cache from "../../src/cache";
import * as config from "../../src/config";
import { dataConverter } from "../../src/dataConverter";
import { dataService } from "../../src/dataService";
import { ExcludeMode } from "../../src/types";
import { utils } from "../../src/utils";
import { workspace } from "../../src/workspace";
import * as events from "../../src/workspaceEventsEmitter";
import { workspaceIndexer as indexer } from "../../src/workspaceIndexer";
import { getItems } from "../util/itemMockFactory";
import { getEventEmitter } from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },

    init: {
      setupForInvokingSetWorkspaceFoldersCommonPath: () => {
        return stubMultiple(
          [
            {
              object: utils,
              method: "setWorkspaceFoldersCommonPath",
            },
            {
              object: dataService,
              method: "fetchConfig",
            },
            {
              object: dataConverter,
              method: "fetchConfig",
            },
          ],
          sandbox
        );
      },

      setupForInvokingDataServiceFetchConfig: () => {
        return stubMultiple(
          [
            {
              object: dataService,
              method: "fetchConfig",
            },
            {
              object: utils,
              method: "setWorkspaceFoldersCommonPath",
            },
            {
              object: dataConverter,
              method: "fetchConfig",
            },
          ],
          sandbox
        );
      },

      setupForInvokingDataConverterFetchConfig: () => {
        return stubMultiple(
          [
            {
              object: dataConverter,
              method: "fetchConfig",
            },
            {
              object: dataService,
              method: "fetchConfig",
            },
            {
              object: utils,
              method: "setWorkspaceFoldersCommonPath",
            },
          ],
          sandbox
        );
      },
    },

    index: {
      setupForInvokingCommonIndexMethod: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "index",
            },
            {
              object: cache,
              method: "clear",
            },
          ],
          sandbox
        );
      },

      setupForInvokingCacheClearMethod: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "index",
            },
            {
              object: cache,
              method: "clear",
            },
          ],
          sandbox
        );
      },
    },

    removeDataForUnsavedUris: {
      setupForInvokingRegisterActionTwiceForEachUnsavedUri: () => {
        let notSavedUris: string[] = ["/test/path1", "/test/path2"];

        return stubMultiple(
          [
            {
              object: indexer,
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
              callsFake: (paths: string[]) => (notSavedUris = paths),
            },
          ],
          sandbox
        );
      },

      setupForClearingArrayOfUnsavedUris: () => {
        let notSavedUris: string[] = ["/test/path1", "/test/path2"];

        stubMultiple(
          [
            {
              object: indexer,
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
              callsFake: (paths: string[]) => (notSavedUris = paths),
            },
            {
              object: cache,
              method: "clearNotSavedUriPaths",
              callsFake: () => (notSavedUris = []),
            },
          ],
          sandbox
        );
      },
    },

    registerEventListeners: {
      setupForRegisteringWorkspaceEventListeners: () => {
        return stubMultiple(
          [
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
          ],
          sandbox
        );
      },
    },

    getData: {
      setupForInvokingCommonGetDataMethod: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "getData",
              returns: getItems(),
            },
          ],
          sandbox
        );
      },
    },

    shouldReindexOnConfigurationChange: {
      setupForReturningTrueWhenConfigurationChangedAndNotExcluded: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchExcludeMode",
              returns: ExcludeMode.SearchEverywhere,
            },
          ],
          sandbox
        );
      },

      setupForReturningFalseWhenConfigurationChangedButExcluded: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchExcludeMode",
              returns: ExcludeMode.SearchEverywhere,
            },
          ],
          sandbox
        );
      },

      setupForReturningFalseWhenConfigurationNotChanged: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchExcludeMode",
              returns: ExcludeMode.SearchEverywhere,
            },
          ],
          sandbox
        );
      },

      setupForReturningTrueWhenFilesAndSearchModeAndFilesExcludeChanged: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchExcludeMode",
              returns: ExcludeMode.FilesAndSearch,
            },
          ],
          sandbox
        );
      },

      setupForReturningTrueWhenFilesAndSearchModeAndSearchExcludeChanged:
        () => {
          stubMultiple(
            [
              {
                object: config,
                method: "fetchExcludeMode",
                returns: ExcludeMode.FilesAndSearch,
              },
            ],
            sandbox
          );
        },
    },

    handleDidChangeConfiguration: {
      setupForInvokingIndexWhenExtensionConfigurationChanged: () => {
        return stubMultiple(
          [
            {
              object: workspace,
              method: "index",
            },
            {
              object: workspace,
              method: "shouldReindexOnConfigurationChange",
              returns: true,
            },
            {
              object: cache,
              method: "clearConfig",
            },
            {
              object: dataConverter,
              method: "fetchConfig",
            },
            {
              object: dataConverter,
              method: "reload",
            },
            {
              object: dataService,
              method: "fetchConfig",
            },
            {
              object: dataService,
              method: "reload",
            },
            {
              object: config,
              method: "fetchExcludeMode",
            },
          ],
          sandbox
        );
      },

      setupForEmittingDebounceConfigToggleEvent: () => {
        const eventEmitter = getEventEmitter();

        stubMultiple(
          [
            {
              object: workspace,
              method: "shouldReindexOnConfigurationChange",
              returns: false,
            },
            {
              object: utils,
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
          ],
          sandbox
        );

        return eventEmitter;
      },

      setupForEmittingSortingConfigToggleEvent: () => {
        const eventEmitter = getEventEmitter();

        stubMultiple(
          [
            {
              object: workspace,
              method: "shouldReindexOnConfigurationChange",
              returns: false,
            },
            {
              object: utils,
              method: "isDebounceConfigurationToggled",
              returns: false,
            },
            {
              object: utils,
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
          ],
          sandbox
        );

        return eventEmitter;
      },

      setupForDoingNothingWhenExtensionConfigurationNotChanged: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: events,
              method: "onDidDebounceConfigToggleEventEmitter",
            },
            {
              object: workspace,
              method: "shouldReindexOnConfigurationChange",
              returns: false,
            },
            {
              object: utils,
              method: "isDebounceConfigurationToggled",
              returns: false,
            },
            {
              object: utils,
              method: "isSortingConfigurationToggled",
              returns: false,
            },
            {
              object: cache,
              method: "clearConfig",
            },
          ],
          sandbox
        );
      },

      setupForInvokingCacheClearConfigMethod: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "clearConfig",
            },
            {
              object: config,
              method: "fetchExcludeMode",
            },
            {
              object: workspace,
              method: "shouldReindexOnConfigurationChange",
              returns: false,
            },
            {
              object: utils,
              method: "isDebounceConfigurationToggled",
            },
            {
              object: utils,
              method: "isSortingConfigurationToggled",
              returns: false,
            },
          ],
          sandbox
        );
      },
    },

    handleDidChangeWorkspaceFolders: {
      setupForInvokingIndexWhenWorkspaceFoldersChanged: () => {
        return stubMultiple(
          [
            {
              object: workspace,
              method: "index",
            },
            {
              object: utils,
              method: "hasWorkspaceChanged",
              returns: true,
            },
          ],
          sandbox
        );
      },

      setupForDoingNothingWhenWorkspaceFoldersNotChanged: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "hasWorkspaceChanged",
              returns: false,
            },
          ],
          sandbox
        );
      },
    },

    handleDidChangeTextDocument: {
      setupForRegisteringUpdateActionWhenDocumentChangedAndExistsInWorkspace:
        () => {
          return stubMultiple(
            [
              {
                object: indexer,
                method: "registerAction",
              },
              {
                object: dataService,
                method: "isUriExistingInWorkspace",
                returns: Promise.resolve(true),
              },
            ],
            sandbox
          );
        },

      setupForDoingNothingWhenDocumentNotExistInWorkspace: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: dataService,
              method: "isUriExistingInWorkspace",
              returns: Promise.resolve(false),
            },
          ],
          sandbox
        );
      },

      setupForDoingNothingWhenDocumentNotChanged: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: dataService,
              method: "isUriExistingInWorkspace",
              returns: Promise.resolve(true),
            },
          ],
          sandbox
        );
      },

      setupForAddingUriToNotSavedArrayWhenDocumentChangedAndExistsInWorkspace:
        () => {
          let notSavedUris: string[] = [];

          stubMultiple(
            [
              {
                object: cache,
                method: "getNotSavedUriPaths",
                callsFake: () => notSavedUris,
              },
              {
                object: cache,
                method: "updateNotSavedUriPaths",
                callsFake: (paths: string[]) => (notSavedUris = paths),
              },
              {
                object: indexer,
                method: "registerAction",
              },
              {
                object: dataService,
                method: "isUriExistingInWorkspace",
                returns: Promise.resolve(true),
              },
            ],
            sandbox
          );
        },
    },

    handleDidRenameFiles: {
      setupForRegisteringRemoveAndUpdateActionsForRenamedFiles: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "isDirectory",
              returns: false,
            },
          ],
          sandbox
        );
      },

      setupForRegisteringUpdateActionForRenamedDirectory: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "isDirectory",
              returns: true,
            },
          ],
          sandbox
        );
      },
    },

    handleDidCreateFiles: {
      setupForRegisteringUpdateActionWhenFileCreated: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "isDirectory",
              returns: false,
            },
          ],
          sandbox
        );
      },

      setupForRegisteringUpdateActionWhenDirectoryCreated: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "isDirectory",
              returns: true,
            },
          ],
          sandbox
        );
      },

      setupForAddingUriToNotSavedArray: () => {
        let notSavedUris: string[] = [];

        return stubMultiple(
          [
            {
              object: cache,
              method: "getNotSavedUriPaths",
              callsFake: () => notSavedUris,
            },
            {
              object: cache,
              method: "updateNotSavedUriPaths",
              callsFake: (paths: string[]) => (notSavedUris = paths),
            },
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "isDirectory",
              returns: true,
            },
          ],
          sandbox
        );
      },
    },

    handleDidDeleteFiles: {
      setupForRegisteringRemoveActionWhenFileDeleted: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "isDirectory",
              returns: false,
            },
          ],
          sandbox
        );
      },

      setupForRegisteringRemoveActionWhenDirectoryDeleted: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "registerAction",
            },
            {
              object: utils,
              method: "isDirectory",
              returns: true,
            },
          ],
          sandbox
        );
      },
    },

    handleDidSaveTextDocument: {
      setupForRemovingUriFromNotSavedArray: () => {
        let notSavedUris: string[] = [
          "/test/path1",
          "/test/path2",
          "/test/path3",
        ];

        return stubMultiple(
          [
            {
              object: cache,
              method: "getNotSavedUriPaths",
              callsFake: () => notSavedUris,
            },
            {
              object: cache,
              method: "updateNotSavedUriPaths",
              callsFake: (paths: string[]) => (notSavedUris = paths),
            },
          ],
          sandbox
        );
      },
    },

    handleWillActionProcessorProcessing: {
      setupForEmittingOnWillProcessingEvent: () => {
        const eventEmitter = getEventEmitter();
        stubMultiple(
          [
            {
              object: events,
              method: "onWillProcessingEventEmitter",
              returns: eventEmitter,
              isNotMethod: true,
            },
          ],
          sandbox
        );

        return eventEmitter;
      },
    },

    handleDidActionProcessorProcessing: {
      setupForEmittingOnDidProcessingEvent: () => {
        const eventEmitter = getEventEmitter();
        stubMultiple(
          [
            {
              object: events,
              method: "onDidProcessingEventEmitter",
              returns: eventEmitter,
              isNotMethod: true,
            },
          ],
          sandbox
        );

        return eventEmitter;
      },
    },

    handleWillActionProcessorExecuteAction: {
      setupForEmittingOnWillExecuteActionEvent: () => {
        const eventEmitter = getEventEmitter();
        stubMultiple(
          [
            {
              object: events,
              method: "onWillExecuteActionEventEmitter",
              returns: eventEmitter,
              isNotMethod: true,
            },
          ],
          sandbox
        );

        return eventEmitter;
      },
    },
  };
};
