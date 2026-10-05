import { assert } from "chai";
import { DetailedActionType } from "../../types";
import * as workspaceRemover from "../../workspaceRemover";
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
      const [deleteByUriStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenFileRemoved();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.RemoveFile
      );
      assert.equal(
        deleteByUriStub.calledWith(getItem().toString()),
        true
      );
    });

    it("should remove given uri from stored data when file is renamed or moved", () => {
      const [deleteByUriStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenFileRenamedOrMoved();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.RenameOrMoveFile
      );
      assert.equal(
        deleteByUriStub.calledWith(getItem().toString()),
        true
      );
    });

    it("should remove given uri from stored data when text in file is changed", () => {
      const [deleteByUriStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenTextInFileChanged();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.TextChange
      );
      assert.equal(
        deleteByUriStub.calledWith(getItem().toString()),
        true
      );
    });

    it("should remove all uris for given folder uri when directory is removed", () => {
      const [deleteByUriPrefixStub] =
        setups.removeFromCacheByPath.setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRemoved();

      workspaceRemover.removeFromCacheByPath(
        getDirectory("./fake/"),
        DetailedActionType.RemoveDirectory
      );
      assert.equal(
        deleteByUriPrefixStub.calledWith(getDirectory("./fake/").toString()),
        true
      );
    });

    it("should remove all uris for given folder uri when directory is renamed", () => {
      const [deleteByUriPrefixStub] =
        setups.removeFromCacheByPath.setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRenamed();

      workspaceRemover.removeFromCacheByPath(
        getDirectory("./fake/"),
        DetailedActionType.RenameOrMoveDirectory
      );
      assert.equal(
        deleteByUriPrefixStub.calledWith(getDirectory("./fake/").toString()),
        true
      );
    });

    it("should remove given uri when file is reloaded if it is unsaved", () => {
      const [deleteByUriStub] =
        setups.removeFromCacheByPath.setupForRemovingGivenUriWhenFileReloadedIfUnsaved();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.ReloadUnsavedUri
      );
      assert.equal(
        deleteByUriStub.calledWith(getItem().toString()),
        true
      );
    });
  });
});
