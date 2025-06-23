import { assert } from "chai";
import { DetailedActionType } from "../../src/types";
import * as workspaceRemover from "../../src/workspaceRemover";
import { getTestSetups } from "../testSetup/workspaceRemover.testSetup";
import { getDirectory, getItem } from "../util/itemMockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("WorkspaceRemover", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("removeFromCacheByPath", () => {
    it("should remove given uri from stored data when file is removed ", () => {
      const [updateDataStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenFileRemoved();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.RemoveFile
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it("should remove given uri from stored data when file is renamed or moved", () => {
      const [updateDataStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenFileRenamedOrMoved();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.RenameOrMoveFile
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it("should remove given uri from stored data when text in file is changed", () => {
      const [updateDataStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenTextInFileChanged();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.TextChange
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it("should remove all uris for given folder uri when directory is removed", () => {
      const [updateDataStub] =
        setups.removeFromCacheByPath.setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRemoved();

      workspaceRemover.removeFromCacheByPath(
        getDirectory("./fake/"),
        DetailedActionType.RemoveDirectory
      );
      assert.equal(updateDataStub.calledWith([]), true);
    });

    it("should remove all uris for given folder uri when directory is renamed", () => {
      const [updateDataStub] =
        setups.removeFromCacheByPath.setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRenamed();

      workspaceRemover.removeFromCacheByPath(
        getDirectory("./fake/"),
        DetailedActionType.RenameOrMoveDirectory
      );
      assert.equal(updateDataStub.calledWith([]), true);
    });

    it("should remove given uri when file is reloaded if it is unsaved", () => {
      const [updateDataStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriWhenFileReloadedIfUnsaved();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.ReloadUnsavedUri
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });
  });
});
