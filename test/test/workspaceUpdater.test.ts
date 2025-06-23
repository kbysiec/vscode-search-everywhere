import { assert } from "chai";
import { DetailedActionType } from "../../src/types";
import * as workspaceUpdater from "../../src/workspaceUpdater";
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
      const [updateDataStub] =
        setups.updateCacheByPath.setupForUpdatingDataWhenFileTextChanged();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.TextChange
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(
        updateDataStub.args[0][0],
        getQpItemsSymbolAndUriExt("./fake-new/")
      );
    });

    it("should update data for given uri when file is created", async () => {
      const [updateDataStub] =
        setups.updateCacheByPath.setupForUpdatingDataWhenFileCreated();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.CreateNewFile
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(updateDataStub.args[0][0], getQpItems(1));
    });

    it("should update data for given uri when file is renamed or moved", async () => {
      const [updateDataStub] =
        setups.updateCacheByPath.setupForUpdatingDataWhenFileRenamedOrMoved();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.RenameOrMoveFile
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(updateDataStub.args[0][0], getQpItems(1));
    });

    it("should update data for all uris for given folder uri when folder renamed or moved", async () => {
      const [updateDataStub] =
        setups.updateCacheByPath.setupForUpdatingDataForAllUrisWhenFolderRenamedOrMoved();
      await workspaceUpdater.updateCacheByPath(
        getDirectory("./fake-new/"),
        DetailedActionType.RenameOrMoveDirectory
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(updateDataStub.args[0][0], getQpItems(2, "./fake-new/"));
    });

    it("should update data for given uri when file is reloaded if it is unsaved", async () => {
      const [updateDataStub] =
        setups.updateCacheByPath.setupForUpdatingDataWhenFileReloadedIfUnsaved();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.ReloadUnsavedUri
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(
        updateDataStub.args[0][0],
        getQpItemsSymbolAndUriExt("./fake-new/")
      );
    });
  });
});
