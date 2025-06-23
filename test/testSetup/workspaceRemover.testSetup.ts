import * as sinon from "sinon";
import * as cache from "../../src/cache";
import { workspaceCommon as common } from "../../src/workspaceCommon";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },

    removeFromCacheByPath: {
      setupForRemovingGivenUriFromStoredDataWhenFileRemoved: () => {
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
          ],
          sandbox
        );
      },

      setupForRemovingGivenUriFromStoredDataWhenFileRenamedOrMoved: () => {
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
          ],
          sandbox
        );
      },

      setupForRemovingGivenUriFromStoredDataWhenTextInFileChanged: () => {
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
          ],
          sandbox
        );
      },

      setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRemoved: () => {
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
          ],
          sandbox
        );
      },

      setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRenamed: () => {
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
          ],
          sandbox
        );
      },

      setupForRemovingGivenUriWhenFileReloadedIfUnsaved: () => {
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
          ],
          sandbox
        );
      },
    },
  };
};
