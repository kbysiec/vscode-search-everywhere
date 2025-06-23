import * as sinon from "sinon";
import * as cache from "../../src/cache";
import { utils } from "../../src/utils";
import { workspaceIndexer as indexer } from "../../src/workspaceIndexer";
import {
  getQpItem,
  getQpItems,
  getQpItemsSymbolAndUri,
} from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },

    updateCacheByPath: {
      setupForInvokingIndexMethodWhenErrorThrown: () => {
        return stubMultiple(
          [
            {
              object: indexer,
              method: "index",
            },
            {
              object: indexer,
              method: "downloadData",
              throws: new Error("test error"),
            },
            {
              object: utils,
              method: "printErrorMessage",
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataWhenFileTextChanged: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "updateData",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
            },
            {
              object: indexer,
              method: "getData",
              returns: [],
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataWhenFileCreated: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "updateData",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItem()),
            },
            {
              object: indexer,
              method: "getData",
              returns: [],
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataWhenFileRenamedOrMoved: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "updateData",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItem()),
            },
            {
              object: indexer,
              method: "getData",
              returns: [],
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataForAllUrisWhenFolderRenamedOrMoved: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "updateData",
            },
            {
              object: indexer,
              method: "getData",
              returns: getQpItems(),
            },
            {
              object: utils,
              method: "updateQpItemsWithNewDirectoryPath",
              returns: getQpItems(2, "./fake-new/"),
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataWhenFileReloadedIfUnsaved: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "updateData",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
            },
            {
              object: indexer,
              method: "getData",
              returns: [],
            },
          ],
          sandbox
        );
      },
    },
  };
};
