import * as sinon from "sinon";
import * as vscode from "vscode";
import * as actionProcessorEventsEmitter from "../../actionProcessorEventsEmitter";
import * as cache from "../../cache";
import * as config from "../../config";
import { dataConverter } from "../../dataConverter";
import { dataService } from "../../dataService";
import ExcludeMode from "../../enum/excludeMode";
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
            returns: Promise.resolve(getItems()),
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
            object: cache,
            method: "clearConfig",
          },
        ],
        sandbox
      );
    },
    handleDidChangeConfiguration4: () => {
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
            object: utils,
            method: "isDebounceConfigurationToggled",
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
          {
            object: dataService,
            method: "clearCachedUris",
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
          {
            object: dataService,
            method: "clearCachedUris",
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
          {
            object: dataService,
            method: "clearCachedUris",
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
          {
            object: dataService,
            method: "clearCachedUris",
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
          {
            object: dataService,
            method: "clearCachedUris",
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
          {
            object: dataService,
            method: "clearCachedUris",
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
