import { assert } from "chai";
import WorkspaceRemover from "../../workspaceRemover";
import WorkspaceCommon from "../../workspaceCommon";
import DataService from "../../dataService";
import Cache from "../../cache";
import Utils from "../../utils";
import {
  getCacheStub,
  getDataServiceStub,
  getUtilsStub,
  getWorkspaceCommonStub,
} from "../util/stubFactory";
import { getTestSetups } from "../testSetup/workspaceRemover.testSetup";
import { getDirectory, getItem } from "../util/itemMockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

describe("WorkspaceRemover", () => {
  let commonStub: WorkspaceCommon = getWorkspaceCommonStub();
  let dataServiceStub: DataService = getDataServiceStub();
  let cacheStub: Cache = getCacheStub();
  let utilsStub: Utils = getUtilsStub();
  let workspaceRemover: WorkspaceRemover = new WorkspaceRemover(
    commonStub,
    dataServiceStub,
    cacheStub,
    utilsStub
  );
  let setups = getTestSetups(workspaceRemover);

  beforeEach(() => {
    commonStub = getWorkspaceCommonStub();
    dataServiceStub = getDataServiceStub();
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    workspaceRemover = new WorkspaceRemover(
      commonStub,
      dataServiceStub,
      cacheStub,
      utilsStub
    );
    setups = getTestSetups(workspaceRemover);
  });

  describe("removeFromCacheByPath", () => {
    it("1: should do nothing if getData method returns undefined", async () => {
      const [updateDataStub] = setups.removeFromCacheByPath1();

      await workspaceRemover.removeFromCacheByPath(getItem());
      assert.equal(updateDataStub.called, false);
    });

    it("2: should remove given item from stored data", async () => {
      const [updateDataStub] = setups.removeFromCacheByPath2();

      await workspaceRemover.removeFromCacheByPath(getItem());
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it(`3: should not remove items from stored data for
      given renamed directory uri`, async () => {
      const { qpItems, stubs } = setups.removeFromCacheByPath3();
      const [updateDataStub] = stubs;

      await workspaceRemover.removeFromCacheByPath(getDirectory("./fake"));
      assert.equal(updateDataStub.calledWith(qpItems), true);
    });

    it(`4: should remove items from stored data
      if file was moved to another directory`, async () => {
      const [updateDataStub] = setups.removeFromCacheByPath4();

      await workspaceRemover.removeFromCacheByPath(getItem());
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });
  });
});
