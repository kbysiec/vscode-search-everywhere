import WorkspaceUpdater from "../../workspaceUpdater";
import {
  getQpItem,
  getQpItems,
  getQpItemsSymbolAndUri,
} from "../util/qpItemMockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (workspaceUpdater: WorkspaceUpdater) => {
  const workspaceUpdaterAny = workspaceUpdater as any;

  return {
    updateCacheByPath1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceUpdaterAny.common,
          method: "index",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceUpdaterAny.common,
          method: "index",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
          throws: new Error("test error"),
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
          method: "downloadData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
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
          returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
          returns: [],
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
          method: "downloadData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
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
          returns: Promise.resolve(getQpItem()),
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
          returns: [],
        },
      ]);
    },
    updateCacheByPath4: () => {
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
      ]);

      return stubMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "downloadData",
          returns: Promise.resolve(getQpItem()),
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
          returns: [],
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
          object: workspaceUpdaterAny.common,
          method: "getData",
        },
        {
          object: workspaceUpdaterAny.utils,
          method: "updateQpItemsWithNewDirectoryPath",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceUpdaterAny.cache,
          method: "updateData",
        },
        {
          object: workspaceUpdaterAny.common,
          method: "getData",
          returns: getQpItems(),
        },
        {
          object: workspaceUpdaterAny.utils,
          method: "updateQpItemsWithNewDirectoryPath",
          returns: getQpItems(2, "./fake-new/"),
        },
      ]);
    },
  };
};
