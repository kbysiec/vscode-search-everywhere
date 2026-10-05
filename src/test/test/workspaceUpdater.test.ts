import { assert } from "chai";
import { DetailedActionType } from "../../types";
import * as workspaceUpdater from "../../workspaceUpdater";
import { getTestSetups } from "../testSetup/workspaceUpdater.testSetup";
import { getDirectory, getItem } from "../util/itemMockFactory";
import {
  getQpItems,
  getQpItemsSymbolAndUriExt,
} from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("WorkspaceUpdater", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("updateCacheByPath", () => {
    it("should index method be invoked which register rebuild action if error is thrown", async () => {
      const [indexStub] =
        setups.updateCacheByPath.setupForInvokingIndexMethodWhenErrorThrown();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.TextChange
      );
      assert.equal(indexStub.calledOnce, true);
    });

    it("should update data for given uri when file text is changed", async () => {
      const [
        deleteByUriStub,
        downloadDataStub,
        insertSymbolsBatchStub,
        schedulePersistStub,
      ] = setups.updateCacheByPath.setupForUpdatingDataWhenFileTextChanged();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.TextChange
      );
      assert.equal(deleteByUriStub.calledWith(getItem().toString()), true);
      assert.equal(
        insertSymbolsBatchStub.calledWith(
          getQpItemsSymbolAndUriExt("./fake-new/")
        ),
        true
      );
      assert.equal(schedulePersistStub.calledOnce, true);
    });

    it("should update data for given uri when file is created", async () => {
      const [
        deleteByUriStub,
        downloadDataStub,
        insertSymbolsBatchStub,
        schedulePersistStub,
      ] = setups.updateCacheByPath.setupForUpdatingDataWhenFileCreated();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.CreateNewFile
      );
      assert.equal(deleteByUriStub.calledWith(getItem().toString()), true);
      assert.equal(insertSymbolsBatchStub.calledWith(getQpItems(1)), true);
      assert.equal(schedulePersistStub.calledOnce, true);
    });

    it("should update data for given uri when file is renamed or moved", async () => {
      const [
        deleteByUriStub,
        downloadDataStub,
        insertSymbolsBatchStub,
        schedulePersistStub,
      ] = setups.updateCacheByPath.setupForUpdatingDataWhenFileRenamedOrMoved();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.RenameOrMoveFile
      );
      assert.equal(deleteByUriStub.calledWith(getItem().toString()), true);
      assert.equal(insertSymbolsBatchStub.calledWith(getQpItems(1)), true);
      assert.equal(schedulePersistStub.calledOnce, true);
    });

    it("should update data for all uris for given folder uri when folder renamed or moved", async () => {
      const [schedulePersistStub] =
        setups.updateCacheByPath.setupForUpdatingDataForAllUrisWhenFolderRenamedOrMoved();
      await workspaceUpdater.updateCacheByPath(
        getDirectory("./fake-new/"),
        DetailedActionType.RenameOrMoveDirectory
      );
      assert.equal(schedulePersistStub.calledOnce, true);
    });

    it("should update data for given uri when file is reloaded if it is unsaved", async () => {
      const [
        deleteByUriStub,
        downloadDataStub,
        insertSymbolsBatchStub,
        schedulePersistStub,
      ] = setups.updateCacheByPath.setupForUpdatingDataWhenFileReloadedIfUnsaved();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.ReloadUnsavedUri
      );
      assert.equal(deleteByUriStub.calledWith(getItem().toString()), true);
      assert.equal(
        insertSymbolsBatchStub.calledWith(
          getQpItemsSymbolAndUriExt("./fake-new/")
        ),
        true
      );
      assert.equal(schedulePersistStub.calledOnce, true);
    });
  });
});
