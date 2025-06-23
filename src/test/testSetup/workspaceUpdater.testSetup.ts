import * as sinon from "sinon";
import * as cache from "../../cache";
import { utils } from "../../utils";
import { workspaceCommon as common } from "../../workspaceCommon";
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
              object: common,
              method: "index",
            },
            {
              object: common,
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
              object: common,
              method: "downloadData",
              returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
            },
            {
              object: common,
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
              object: common,
              method: "downloadData",
              returns: Promise.resolve(getQpItem()),
            },
            {
              object: common,
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
              object: common,
              method: "downloadData",
              returns: Promise.resolve(getQpItem()),
            },
            {
              object: common,
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
              object: common,
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
              object: common,
              method: "downloadData",
              returns: Promise.resolve(getQpItemsSymbolAndUri("./fake-new/")),
            },
            {
              object: common,
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
