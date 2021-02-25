import * as vscode from "vscode";
import WorkspaceCommon from "../../workspaceCommon";
import { getDirectory, getItem, getItems } from "../util/itemMockFactory";
import { getWorkspaceData } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (workspaceCommon: WorkspaceCommon) => {
  const workspaceCommonAny = workspaceCommon as any;

  return {
    getData1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.cache,
          method: "getData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.cache,
          method: "getData",
          returns: Promise.resolve(getItems()),
        },
      ]);
    },
    wasDirectoryRenamed1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "getNameFromUri",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny,
          method: "directoryUriBeforePathUpdate",
          returns: getDirectory("./fake/"),
          isNotMethod: true,
        },
      ]);
    },
    wasDirectoryRenamed2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "getNameFromUri",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny,
          method: "directoryUriBeforePathUpdate",
          returns: getItem(),
          isNotMethod: true,
        },
      ]);
    },
    index1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.actionProcessor,
          method: "register",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.actionProcessor,
          method: "register",
        },
      ]);
    },
    indexWithProgress1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "hasWorkspaceAnyFolder",
        },
      ]);

      return stubMultiple([
        {
          object: vscode.window,
          method: "withProgress",
        },
        {
          object: workspaceCommonAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: true,
        },
      ]);
    },
    indexWithProgress2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "hasWorkspaceAnyFolder",
        },
        {
          object: workspaceCommonAny.utils,
          method: "printNoFolderOpenedMessage",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "printNoFolderOpenedMessage",
        },
        {
          object: workspaceCommonAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: false,
        },
      ]);
    },
    indexWithProgressTask1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.dataService,
          method: "fetchData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.dataService,
          method: "fetchData",
          returns: getWorkspaceData(),
        },
      ]);
    },
    indexWithProgressTask2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "sleep",
        },
        {
          object: workspaceCommonAny.dataService,
          method: "fetchData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "sleep",
        },
        {
          object: workspaceCommonAny.dataService,
          method: "fetchData",
          returns: getWorkspaceData(),
        },
        {
          object: workspaceCommonAny.dataService,
          method: "onDidItemIndexed",
          returns: "aaaaa",
          isNotMethod: true,
        },
      ]);
    },
    registerAction1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.actionProcessor,
          method: "register",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.actionProcessor,
          method: "register",
        },
      ]);
    },
    downloadData1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.dataService,
          method: "fetchData",
        },
        {
          object: workspaceCommonAny.dataConverter,
          method: "convertToQpData",
        },
      ]);

      stubMultiple([
        {
          object: workspaceCommonAny.dataService,
          method: "fetchData",
        },
        {
          object: workspaceCommonAny.dataConverter,
          method: "convertToQpData",
          returns: getQpItems(),
        },
      ]);
    },
    cancelIndexing1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.dataService,
          method: "cancel",
        },
        {
          object: workspaceCommonAny.dataConverter,
          method: "cancel",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.dataService,
          method: "cancel",
        },
        {
          object: workspaceCommonAny.dataConverter,
          method: "cancel",
        },
      ]);
    },
    onCancellationRequested1: () => {
      return stubMultiple([
        {
          object: workspaceCommonAny,
          method: "cancelIndexing",
        },
      ]);
    },
  };
};
