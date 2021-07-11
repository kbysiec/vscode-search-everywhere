import * as vscode from "vscode";
import Workspace from "../../workspace";
import { getFileWatcherStub } from "../util/eventMockFactory";
import { getItems } from "../util/itemMockFactory";
import { getEventEmitter } from "../util/mockFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";

export const getTestSetups = (workspace: Workspace) => {
  const workspaceAny = workspace as any;

  return {
    index1: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "index",
        },
      ]);
    },
    registerEventListeners1: () => {
      const fileWatcherStub = getFileWatcherStub();
      const stubs = stubMultiple([
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
          method: "createFileSystemWatcher",
          returns: fileWatcherStub,
        },
        {
          object: workspaceAny.actionProcessor,
          method: "onWillProcessing",
        },
        {
          object: workspaceAny.actionProcessor,
          method: "onDidProcessing",
        },
        {
          object: workspaceAny.actionProcessor,
          method: "onWillExecuteAction",
        },
      ]);

      return {
        fileWatcherStub,
        stubs,
      };
    },
    getData1: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "getData",
          returns: Promise.resolve(getItems()),
        },
      ]);
    },
    handleDidChangeConfiguration1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.utils,
          method: "shouldReindexOnConfigurationChange",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny,
          method: "index",
        },
        {
          object: workspaceAny.utils,
          method: "shouldReindexOnConfigurationChange",
          returns: true,
        },
      ]);
    },
    handleDidChangeConfiguration2: () => {
      const eventEmitter = getEventEmitter();
      restoreStubbedMultiple([
        {
          object: workspaceAny.utils,
          method: "shouldReindexOnConfigurationChange",
        },
        {
          object: workspaceAny.utils,
          method: "isDebounceConfigurationToggled",
        },
      ]);

      stubMultiple([
        {
          object: workspaceAny.utils,
          method: "shouldReindexOnConfigurationChange",
          returns: false,
        },
        {
          object: workspaceAny.utils,
          method: "isDebounceConfigurationToggled",
          returns: true,
        },
        {
          object: workspaceAny.events,
          method: "onDidDebounceConfigToggleEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);

      return eventEmitter;
    },
    handleDidChangeConfiguration3: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.utils,
          method: "shouldReindexOnConfigurationChange",
        },
        {
          object: workspaceAny.utils,
          method: "isDebounceConfigurationToggled",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.events,
          method: "onDidDebounceConfigToggleEventEmitter",
        },
        {
          object: workspaceAny.utils,
          method: "shouldReindexOnConfigurationChange",
          returns: false,
        },
        {
          object: workspaceAny.utils,
          method: "isDebounceConfigurationToggled",
          returns: false,
        },
      ]);
    },
    handleDidChangeConfiguration4: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.cache, method: "clearConfig" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "clearConfig",
        },
      ]);
    },
    handleDidChangeWorkspaceFolders1: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.utils, method: "hasWorkspaceChanged" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny,
          method: "index",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceChanged",
          returns: true,
        },
      ]);
    },
    handleDidChangeWorkspaceFolders2: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.utils, method: "hasWorkspaceChanged" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceChanged",
          returns: false,
        },
      ]);
    },
    handleDidChangeTextDocument1: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    handleDidChangeTextDocument2: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
      ]);
    },
    handleDidChangeTextDocument3: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    handleDidRenameFiles1: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.utils, method: "hasWorkspaceMoreThanOneFolder" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceMoreThanOneFolder",
          returns: true,
        },
      ]);
    },
    handleDidRenameFiles2: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.utils, method: "hasWorkspaceMoreThanOneFolder" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceMoreThanOneFolder",
          returns: false,
        },
      ]);
    },
    handleDidFileSave1: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    handleDidFileSave2: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
      ]);
    },
    handleDidFileFolderCreate1: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
      ]);
    },
    handleDidFileFolderDelete1: () => {
      return stubMultiple([
        {
          object: workspaceAny.common,
          method: "registerAction",
        },
      ]);
    },
    handleWillActionProcessorProcessing1: () => {
      const eventEmitter = getEventEmitter();
      stubMultiple([
        {
          object: workspaceAny.events,
          method: "onWillProcessingEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);

      return eventEmitter;
    },
    handleDidActionProcessorProcessing1: () => {
      const eventEmitter = getEventEmitter();
      stubMultiple([
        {
          object: workspaceAny.events,
          method: "onDidProcessingEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);

      return eventEmitter;
    },
    handleWillActionProcessorExecuteAction1: () => {
      const eventEmitter = getEventEmitter();
      stubMultiple([
        {
          object: workspaceAny.events,
          method: "onWillExecuteActionEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);

      return eventEmitter;
    },
  };
};
