import * as sinon from "sinon";
import * as vscode from "vscode";
import * as actionProcessorEventsEmitter from "../../actionProcessorEventsEmitter";
import * as cache from "../../cache";
import * as config from "../../config";
import { dataConverter } from "../../dataConverter";
import { dataService } from "../../dataService";
import { ExcludeMode } from "../../types";
import { utils } from "../../utils";
import { workspace } from "../../workspace";
import { workspaceCommon as common } from "../../workspaceCommon";
import * as events from "../../workspaceEventsEmitter";
import { getItems } from "../util/itemMockFactory";
import { getEventEmitter } from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },
    init1: () => {
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
    init2: () => {
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
    init3: () => {
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
    index1: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    index2: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    removeDataForUnsavedUris1: () => {
      let notSavedUris: string[] = ["/test/path1", "/test/path2"];

      return stubMultiple(
        [
          {
            object: common,
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
    removeDataForUnsavedUris2: () => {
      let notSavedUris: string[] = ["/test/path1", "/test/path2"];

      stubMultiple(
        [
          {
            object: common,
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
    registerEventListeners1: () => {
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
    getData1: () => {
      return stubMultiple(
        [
          {
            object: common,
            method: "getData",
            returns: getItems(),
          },
        ],
        sandbox
      );
    },
    shouldReindexOnConfigurationChange1: () => {
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
    shouldReindexOnConfigurationChange2: () => {
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
    shouldReindexOnConfigurationChange3: () => {
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
    shouldReindexOnConfigurationChange4: () => {
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
    shouldReindexOnConfigurationChange5: () => {
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
    handleDidChangeConfiguration1: () => {
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
    handleDidChangeConfiguration2: () => {
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
    handleDidChangeConfiguration3: () => {
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
    handleDidChangeConfiguration4: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidChangeConfiguration5: () => {
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
    handleDidChangeWorkspaceFolders1: () => {
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
    handleDidChangeWorkspaceFolders2: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidChangeTextDocument1: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidChangeTextDocument2: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidChangeTextDocument3: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidChangeTextDocument4: () => {
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
            object: common,
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
    handleDidRenameFiles1: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidRenameFiles2: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidCreateFiles1: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidCreateFiles2: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidCreateFiles3: () => {
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
            object: common,
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
    handleDidDeleteFiles1: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidDeleteFiles2: () => {
      return stubMultiple(
        [
          {
            object: common,
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
    handleDidSaveTextDocument1: () => {
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
    handleWillActionProcessorProcessing1: () => {
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
    handleDidActionProcessorProcessing1: () => {
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
    handleWillActionProcessorExecuteAction1: () => {
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
  };
};
