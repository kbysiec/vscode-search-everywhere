import * as vscode from "vscode";
import Workspace from "../../workspace";
import { getFileWatcherStub } from "../util/eventMockFactory";
import { getItems, getDirectory } from "../util/itemMockFactory";
import {
  getSubscription,
  getWorkspaceData,
  getEventEmitter,
  getConfiguration,
} from "../util/mockFactory";
import { getQpItems, getQpItemsSymbolAndUri } from "../util/qpItemMockFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";

export const getTestSetups = (workspace: Workspace) => {
  const workspaceAny = workspace as any;

  const stubDataServiceConfig = () => {
    const configuration = getConfiguration().searchEverywhere;
    stubMultiple([
      {
        object: workspaceAny.dataService,
        method: "includePatterns",
        returns: configuration.include,
        isNotMethod: true,
      },
      {
        object: workspaceAny.dataService,
        method: "excludePatterns",
        returns: configuration.exclude,
        isNotMethod: true,
      },
    ]);
  };

  return {
    index1: () => {
      return stubMultiple([
        {
          object: workspaceAny.actionProcessor,
          method: "register",
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
      ]);

      return {
        fileWatcherStub,
        stubs,
      };
    },
    getData1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "getData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "getData",
          returns: Promise.resolve(getItems()),
        },
      ]);
    },
    indexWithProgress1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceAnyFolder",
        },
      ]);

      return stubMultiple([
        {
          object: vscode.window,
          method: "withProgress",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: true,
        },
      ]);
    },
    indexWithProgress2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceAnyFolder",
        },
        {
          object: workspaceAny.utils,
          method: "printNoFolderOpenedMessage",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.utils,
          method: "printNoFolderOpenedMessage",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: false,
        },
      ]);
    },
    indexWithProgressTask1: () => {
      const onDidItemIndexedSubscription = getSubscription();

      const stubs = stubMultiple([
        {
          object: workspaceAny.dataService,
          method: "onDidItemIndexed",
          returns: onDidItemIndexedSubscription,
        },
        {
          object: workspaceAny.dataService,
          method: "fetchData",
          returns: getWorkspaceData(),
        },
      ]);

      return {
        onDidItemIndexedSubscription,
        stubs,
      };
    },
    indexWithProgressTask2: () => {
      const onDidItemIndexedSubscription = getSubscription();

      restoreStubbedMultiple([
        {
          object: workspaceAny.utils,
          method: "sleep",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.utils,
          method: "sleep",
        },
        {
          object: workspaceAny.dataService,
          method: "onDidItemIndexed",
          returns: onDidItemIndexedSubscription,
        },
        {
          object: workspaceAny.dataService,
          method: "fetchData",
          returns: getWorkspaceData(),
        },
      ]);
    },
    indexWorkspace1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "clear",
        },
      ]);
      stubDataServiceConfig();

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "clear",
        },
        {
          object: workspaceAny.dataService,
          method: "fetchData",
          returns: getWorkspaceData(),
        },
      ]);
    },
    indexWorkspace2: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "downloadData",
        },
      ]);
    },
    indexWorkspace3: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny,
          method: "downloadData",
          returns: getQpItems(),
        },
      ]);
    },
    downloadData1: () => {
      stubMultiple([
        {
          object: workspaceAny.dataConverter,
          method: "icons",
          returns: {},
          isNotMethod: true,
        },
        {
          object: workspaceAny.dataConverter,
          method: "itemsFilterPhrases",
          returns: {},
          isNotMethod: true,
        },
        {
          object: workspaceAny.dataService,
          method: "fetchData",
          // returns: getWorkspaceData(getWorkspaceDataItems()),
        },
        {
          object: workspaceAny.dataConverter,
          method: "convertToQpData",
          returns: getQpItems(),
        },
      ]);
    },
    updateCacheByPath1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny,
          method: "getData",
          customReturns: true,
          returns: [
            {
              onCall: 0,
              returns: getQpItems(),
            },
            {
              onCall: 1,
              returns: getQpItems(1),
            },
          ],
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
        {
          object: workspaceAny,
          method: "downloadData",
          returns: Promise.resolve(getQpItemsSymbolAndUri()),
        },
      ]);
    },
    updateCacheByPath2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny.utils,
          method: "getUrisWithNewDirectoryName",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny,
          method: "downloadData",
          returns: Promise.resolve(
            getQpItemsSymbolAndUri("./test/fake-files/")
          ),
        },
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
        {
          object: workspaceAny,
          method: "directoryUriBeforePathUpdate",
          returns: getDirectory("./fake/"),
          isNotMethod: true,
        },
        {
          object: workspaceAny,
          method: "urisForDirectoryPathUpdate",
          returns: getItems(1),
          isNotMethod: true,
        },
        {
          object: workspaceAny.utils,
          method: "getUrisWithNewDirectoryName",
          returns: getItems(1, "./test/fake-files/"),
        },
        {
          object: workspaceAny,
          method: "getData",
          returns: getQpItems(1),
        },
      ]);
    },
    updateCacheByPath3: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
      ]);
    },
    updateCacheByPath4: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "index",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
        {
          object: workspaceAny,
          method: "removeFromCacheByPath",
          throws: new Error("test error"),
        },
      ]);
    },
    removeFromCacheByPath1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
      ]);
      stubDataServiceConfig();

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny,
          method: "getData",
          returns: undefined,
        },
      ]);
    },
    removeFromCacheByPath2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny,
          method: "getData",
          returns: getQpItems(),
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    removeFromCacheByPath3: () => {
      restoreStubbedMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny.cache,
          method: "updateData",
        },
        {
          object: workspaceAny,
          method: "getData",
          returns: getQpItems(),
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
      ]);
    },
    mergeWithDataFromCache1: () => {
      stubMultiple([
        {
          object: workspaceAny,
          method: "getData",
          returns: getQpItems(),
        },
      ]);
    },
    mergeWithDataFromCache2: () => {
      stubMultiple([
        {
          object: workspaceAny,
          method: "getData",
          returns: undefined,
        },
      ]);
    },
    cleanDirectoryRenamingData1: () => {
      stubMultiple([
        {
          object: workspaceAny,
          method: "directoryUriBeforePathUpdate",
          returns: getDirectory("#"),
          isNotMethod: true,
        },
        {
          object: workspaceAny,
          method: "urisForDirectoryPathUpdate",
          returns: getItems(),
          isNotMethod: true,
        },
      ]);
    },
    registerAction1: () => {
      return stubMultiple([
        {
          object: workspaceAny.actionProcessor,
          method: "register",
        },
      ]);
    },
    resetProgress1: () => {
      stubMultiple([
        {
          object: workspaceAny,
          method: "progressStep",
          returns: 15,
          isNotMethod: true,
        },
        {
          object: workspaceAny,
          method: "currentProgressValue",
          returns: 70,
          isNotMethod: true,
        },
      ]);
    },
    reloadComponents1: () => {
      return stubMultiple([
        {
          object: workspaceAny.dataConverter,
          method: "reload",
        },
        {
          object: workspaceAny.dataService,
          method: "reload",
        },
      ]);
    },
    onDidChangeConfiguration1: () => {
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
    onDidChangeConfiguration2: () => {
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
    onDidChangeConfiguration3: () => {
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
          object: workspaceAny,
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
    onDidChangeConfiguration4: () => {
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
    onDidChangeWorkspaceFolders1: () => {
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
    onDidChangeWorkspaceFolders2: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.utils, method: "hasWorkspaceChanged" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceChanged",
          returns: false,
        },
      ]);
    },
    onDidChangeTextDocument1: () => {
      restoreStubbedMultiple([
        {
          object: vscode.workspace,
          method: "openTextDocument",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    onDidChangeTextDocument2: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
      ]);
    },
    onDidChangeTextDocument3: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    onDidRenameFiles1: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.utils, method: "hasWorkspaceMoreThanOneFolder" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceMoreThanOneFolder",
          returns: true,
        },
      ]);
    },
    onDidRenameFiles2: () => {
      restoreStubbedMultiple([
        { object: workspaceAny.utils, method: "hasWorkspaceMoreThanOneFolder" },
      ]);

      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.utils,
          method: "hasWorkspaceMoreThanOneFolder",
          returns: false,
        },
      ]);
    },
    onDidFileSave1: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    onDidFileSave2: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
        {
          object: workspaceAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
      ]);
    },
    onDidFileFolderCreate1: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
      ]);
    },
    onDidFileFolderDelete1: () => {
      return stubMultiple([
        {
          object: workspaceAny,
          method: "registerAction",
        },
      ]);
    },
    onCancellationRequested1: () => {
      return stubMultiple([
        {
          object: workspaceAny.dataService,
          method: "cancel",
        },
        {
          object: workspaceAny.dataConverter,
          method: "cancel",
        },
      ]);
    },
    onDidItemIndexed4: () => {
      stubMultiple([
        {
          object: workspaceAny,
          method: "progressStep",
          returns: 1,
          isNotMethod: true,
        },
      ]);
    },
    onWillActionProcessorProcessing1: () => {
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
    onDidActionProcessorProcessing1: () => {
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
    onWillActionProcessorExecuteAction1: () => {
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
