import { assert } from "chai";
import WorkspaceUpdater from "../../workspaceUpdater";
import WorkspaceCommon from "../../workspaceCommon";
import WorkspaceRemover from "../../workspaceRemover";
import DataService from "../../dataService";
import Cache from "../../cache";
import Utils from "../../utils";
import {
  getCacheStub,
  getDataServiceStub,
  getUtilsStub,
  getWorkspaceCommonStub,
  getWorkspaceRemoverStub,
} from "../util/stubFactory";
import { getTestSetups } from "../testSetup/workspaceUpdater.testSetup";
import { getDirectory, getItem, getItems } from "../util/itemMockFactory";
import { getQpItemsSymbolAndUriExt } from "../util/qpItemMockFactory";

describe("WorkspaceUpdater", () => {
  let commonStub: WorkspaceCommon = getWorkspaceCommonStub();
  let removerStub: WorkspaceRemover = getWorkspaceRemoverStub();
  let dataServiceStub: DataService = getDataServiceStub();
  let cacheStub: Cache = getCacheStub();
  let utilsStub: Utils = getUtilsStub();
  let workspaceUpdater: WorkspaceUpdater = new WorkspaceUpdater(
    commonStub,
    removerStub,
    dataServiceStub,
    cacheStub,
    utilsStub
  );
  let setups = getTestSetups(workspaceUpdater);

  beforeEach(() => {
    commonStub = getWorkspaceCommonStub();
    removerStub = getWorkspaceRemoverStub();
    dataServiceStub = getDataServiceStub();
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    workspaceUpdater = new WorkspaceUpdater(
      commonStub,
      removerStub,
      dataServiceStub,
      cacheStub,
      utilsStub
    );
    setups = getTestSetups(workspaceUpdater);
  });

  describe("updateCacheByPath", () => {
    it(`1: should remove old data for given uri and get
          new data if exists in workspace`, async () => {
      const [
        updateDataStub,
        removeFromCacheByPathStub,
      ] = setups.updateCacheByPath1();
      await workspaceUpdater.updateCacheByPath(getItem());
      assert.equal(removeFromCacheByPathStub.calledOnce, true);
      assert.equal(updateDataStub.calledOnce, true);
    });
    it(`2: should find items with old uris, replace the path
          with new uri after directory renaming`, async () => {
      const [updateDataStub] = setups.updateCacheByPath2();
      await workspaceUpdater.updateCacheByPath(getDirectory("/./fake-new/"));

      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(updateDataStub.args[0][0], getItems(1, "/./fake-new/"));
    });
    it(`3: should do nothing if the data is empty
          after directory renaming`, async () => {
      const [updateDataStub] = setups.updateCacheByPath3();
      await workspaceUpdater.updateCacheByPath(getDirectory("/./fake-new/"));
      assert.equal(updateDataStub.calledOnce, false);
    });
    it(`4: should index method be invoked which
          register rebuild action if error is thrown`, async () => {
      const [indexStub] = setups.updateCacheByPath4();
      await workspaceUpdater.updateCacheByPath(getItem());
      assert.equal(indexStub.calledOnce, true);
    });
    it(`5: should remove old data for given uri and get
          new data if file was moved to another directory`, async () => {
      const [updateDataStub] = setups.updateCacheByPath5();
      await workspaceUpdater.updateCacheByPath(getItem());
      assert.equal(updateDataStub.calledOnce, true);
      assert.deepEqual(
        updateDataStub.args[0][0],
        getQpItemsSymbolAndUriExt("./fake-new/")
      );
    });
  });
});
