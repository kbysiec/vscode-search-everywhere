import * as sinon from "sinon";
import { database } from "../../database";
import { utils } from "../../utils";
import { workspaceIndexer as indexer } from "../../workspaceIndexer";
import {
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
              object: database,
              method: "deleteByUri",
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
              object: database,
              method: "deleteByUri",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
            },
            {
              object: database,
              method: "insertSymbolsBatch",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataWhenFileCreated: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUri",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItems(1)),
            },
            {
              object: database,
              method: "insertSymbolsBatch",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataWhenFileRenamedOrMoved: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUri",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItems(1)),
            },
            {
              object: database,
              method: "insertSymbolsBatch",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataForAllUrisWhenFolderRenamedOrMoved: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForUpdatingDataWhenFileReloadedIfUnsaved: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUri",
            },
            {
              object: indexer,
              method: "downloadData",
              returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
            },
            {
              object: database,
              method: "insertSymbolsBatch",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },
    },
  };
};
