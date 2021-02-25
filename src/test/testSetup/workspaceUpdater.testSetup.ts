import * as vscode from "vscode";
import WorkspaceUpdater from "../../workspaceUpdater";
import { getDirectory, getItems } from "../util/itemMockFactory";
import { getQpItems, getQpItemsSymbolAndUri } from "../util/qpItemMockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (workspaceUpdater: WorkspaceUpdater) => {
  const workspaceUpdaterAny = workspaceUpdater as any;

  return {
    updateCacheByPath1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
        },
        {
          object: workspaceUpdaterAny.dataService,
          method: "isUriExistingInWorkspace",
        },
        {
          object: workspaceUpdaterAny.remover,
          method: "removeFromCacheByPath",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
          returns: Promise.resolve(getQpItemsSymbolAndUri()),
        },
        {
          object: workspaceUpdaterAny.common,
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
          object: workspaceUpdaterAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
        {
          object: workspaceUpdaterAny.common,
          method: "urisForDirectoryPathUpdate",
          returns: [],
          isNotMethod: true,
        },
      ]);
    },
    updateCacheByPath2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "wasDirectoryRenamed",
        },
        {
          object: workspaceUpdaterAny.utils,
          method: "updateQpItemsWithNewDirectoryPath",
        },
      ]);

      const workspaceFolders = [
        {
          index: 0,
          name: "/test/path/to/workspace",
          uri: vscode.Uri.file("/test/path/to/workspace"),
        },
      ];

      return stubMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "wasDirectoryRenamed",
          returns: true,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "directoryUriBeforePathUpdate",
          returns: getDirectory("./fake/"),
          isNotMethod: true,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "directoryUriAfterPathUpdate",
          returns: getDirectory("./fake-new/"),
          isNotMethod: true,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "urisForDirectoryPathUpdate",
          returns: getItems(1),
          isNotMethod: true,
        },
        {
          object: workspaceUpdaterAny.utils,
          method: "updateQpItemsWithNewDirectoryPath",
          returns: getItems(1, "./fake-new/"),
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
          returns: getQpItems(1),
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
          returns: getQpItems(1),
        },
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: workspaceFolders,
          isNotMethod: true,
        },
      ]);
    },
    updateCacheByPath3: () => {
      restoreStubbedMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "wasDirectoryRenamed",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "directoryUriBeforePathUpdate",
          returns: getDirectory("./fake/"),
          isNotMethod: true,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "directoryUriAfterPathUpdate",
          returns: getDirectory("./fake-new/"),
          isNotMethod: true,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "urisForDirectoryPathUpdate",
          returns: getItems(1),
          isNotMethod: true,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
          returns: undefined,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "wasDirectoryRenamed",
          returns: true,
        },
      ]);
    },
    updateCacheByPath4: () => {
      restoreStubbedMultiple([
        {
          object: workspaceUpdaterAny.common,
          method: "index",
        },
        {
          object: workspaceUpdaterAny.dataService,
          method: "isUriExistingInWorkspace",
        },
        {
          object: workspaceUpdaterAny.remover,
          method: "removeFromCacheByPath",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceUpdaterAny.common,
          method: "index",
        },
        {
          object: workspaceUpdaterAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
        {
          object: workspaceUpdaterAny.remover,
          method: "removeFromCacheByPath",
          throws: new Error("test error"),
        },
      ]);
    },
    updateCacheByPath5: () => {
      restoreStubbedMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.remover,
          method: "removeFromCacheByPath",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "wasDirectoryRenamed",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.remover,
          method: "removeFromCacheByPath",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
          returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
          returns: undefined,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "wasDirectoryRenamed",
          returns: false,
        },
        {
          object: workspaceUpdaterAny.common,
          method: "urisForDirectoryPathUpdate",
          returns: getItems(1),
          isNotMethod: true,
        },
      ]);
    },
  };
};
