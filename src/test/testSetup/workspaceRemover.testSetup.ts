import * as sinon from "sinon";
import { database } from "../../database";
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
              object: database,
              method: "deleteByUri",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForRemovingGivenUriFromStoredDataWhenFileRenamedOrMoved: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUri",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForRemovingGivenUriFromStoredDataWhenTextInFileChanged: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUri",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRemoved: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUriPrefix",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRenamed: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUriPrefix",
            },
            {
              object: database,
              method: "schedulePersist",
            },
          ],
          sandbox
        );
      },

      setupForRemovingGivenUriWhenFileReloadedIfUnsaved: () => {
        return stubMultiple(
          [
            {
              object: database,
              method: "deleteByUri",
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
