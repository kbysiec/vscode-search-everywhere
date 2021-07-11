import * as vscode from "vscode";
import WorkspaceCommon from "../../workspaceCommon";
import { getDirectory, getItem, getItems } from "../util/itemMockFactory";
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
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny,
          method: "directoryUriBeforePathUpdate",
          returns: getDirectory("./fake/"),
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny,
          method: "directoryUriAfterPathUpdate",
          returns: getItem(),
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
          returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
        },
      ]);
    },
    wasDirectoryRenamed2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "getNameFromUri",
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny,
          method: "directoryUriBeforePathUpdate",
          returns: getItem(),
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny,
          method: "directoryUriAfterPathUpdate",
          returns: getItem(),
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
          returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
        },
      ]);
    },
    wasDirectoryRenamed3: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "getNameFromUri",
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny,
          method: "directoryUriBeforePathUpdate",
          returns: getItem(),
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny,
          method: "directoryUriAfterPathUpdate",
          returns: null,
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
          returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
        },
      ]);
    },
    wasDirectoryRenamed4: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "getNameFromUri",
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny,
          method: "directoryUriBeforePathUpdate",
          returns: getItem(),
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny,
          method: "directoryUriAfterPathUpdate",
          returns: undefined,
          isNotMethod: true,
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
          returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
        },
      ]);
    },
    index1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.actionProcessor,
          method: "register",
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceCommonAny.actionProcessor,
          method: "register",
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
          returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
        },
      ]);
    },
    indexWithProgress1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceCommonAny.utils,
          method: "hasWorkspaceAnyFolder",
        },
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
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
        {
          object: workspaceCommonAny.dataService.patternProvider,
          method: "getExcludePatterns",
          returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
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
  };
};
