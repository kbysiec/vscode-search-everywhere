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
    it(`1: should index method be invoked which
          register rebuild action if error is thrown`, async () => {
      const [indexStub] = setups.updateCacheByPath1();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.TextChange
      );
      assert.equal(indexStub.calledOnce, true);
    });

    it(`2: should update data for given uri when file text is changed`, async () => {
      const [updateDataStub] = setups.updateCacheByPath2();
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

    it(`3: should update data for given uri when file is created`, async () => {
      const [updateDataStub] = setups.updateCacheByPath3();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.CreateNewFile
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(updateDataStub.args[0][0], getQpItems(1));
    });

    it(`4: should update data for given uri when file is renamed or moved`, async () => {
      const [updateDataStub] = setups.updateCacheByPath4();
      await workspaceUpdater.updateCacheByPath(
        getItem(),
        DetailedActionType.RenameOrMoveFile
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(updateDataStub.args[0][0], getQpItems(1));
    });

    it(`5: should update data for all uris for given folder uri
      when folder renamed or moved`, async () => {
      const [updateDataStub] = setups.updateCacheByPath5();
      await workspaceUpdater.updateCacheByPath(
        getDirectory("./fake-new/"),
        DetailedActionType.RenameOrMoveDirectory
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(updateDataStub.args[0][0], getQpItems(2, "./fake-new/"));
    });

    it(`6: should update data for given uri when file is reloaded if it is unsaved`, async () => {
      const [updateDataStub] = setups.updateCacheByPath6();
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
