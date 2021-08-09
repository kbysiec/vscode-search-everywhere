import { assert } from "chai";
import ActionProcessor from "../../actionProcessor";
import Cache from "../../cache";
import DataConverter from "../../dataConverter";
import DataService from "../../dataService";
import ActionType from "../../enum/actionType";
import Utils from "../../utils";
import WorkspaceCommon from "../../workspaceCommon";
import { getTestSetups } from "../testSetup/workspaceCommon.testSetup";
import { getQpItems } from "../util/qpItemMockFactory";
import {
  getActionProcessorStub,
  getCacheStub,
  getDataConverterStub,
  getDataServiceStub,
  getUtilsStub,
} from "../util/stubFactory";

describe("WorkspaceCommon", () => {
  let cacheStub: Cache = getCacheStub();
  let utilsStub: Utils = getUtilsStub();
  let dataServiceStub: DataService = getDataServiceStub();
  let dataConverterStub: DataConverter = getDataConverterStub();
  let actionProcessorStub: ActionProcessor = getActionProcessorStub();
  let workspaceCommon: WorkspaceCommon = new WorkspaceCommon(
    cacheStub,
    utilsStub,
    dataServiceStub,
    dataConverterStub,
    actionProcessorStub
  );
  let setups = getTestSetups(workspaceCommon);

  beforeEach(() => {
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    dataServiceStub = getDataServiceStub();
    dataConverterStub = getDataConverterStub();
    actionProcessorStub = getActionProcessorStub();
    workspaceCommon = new WorkspaceCommon(
      cacheStub,
      utilsStub,
      dataServiceStub,
      dataConverterStub,
      actionProcessorStub
    );
    setups = getTestSetups(workspaceCommon);
  });

  describe("getData", () => {
    it("1: should cache.getData method be invoked", () => {
      setups.getData1();

      assert.deepEqual(workspaceCommon.getData(), getQpItems());
    });

    it("2: should return empty array if cache.getData method returns undefined", () => {
      setups.getData2();

      assert.deepEqual(workspaceCommon.getData(), []);
    });
  });

  describe("index", () => {
    it(`1: should registerAction method be invoked
          which register rebuild action`, async () => {
      const [registerStub] = setups.index1();
      await workspaceCommon.index("test comment");

      assert.equal(registerStub.calledOnce, true);
      assert.equal(registerStub.args[0][0].type, ActionType.Rebuild);
    });
  });

  describe("indexWithProgress", () => {
    it(`1: should vscode.window.withProgress method be invoked
          if workspace has opened at least one folder`, async () => {
      const [withProgressStub] = setups.indexWithProgress1();

      await workspaceCommon.indexWithProgress();
      assert.equal(withProgressStub.calledOnce, true);
    });

    it(`2: should printNoFolderOpenedMessage method be invoked
          if workspace does not has opened at least one folder`, async () => {
      const [printNoFolderOpenedMessageStub] = setups.indexWithProgress2();

      await workspaceCommon.indexWithProgress();
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });
  });

  describe("registerAction", () => {
    it("1: should actionProcessor.register method be invoked", async () => {
      const [registerStub] = setups.registerAction1();

      await workspaceCommon.registerAction(
        ActionType.Rebuild,
        () => {},
        "test comment"
      );

      assert.equal(registerStub.calledOnce, true);
      assert.equal(registerStub.args[0][0].type, ActionType.Rebuild);
    });
  });

  describe("downloadData", () => {
    it("1: should return data for quick pick", async () => {
      setups.downloadData1();

      assert.deepEqual(await workspaceCommon.downloadData(), getQpItems());
    });
  });

  describe("cancelIndexing", () => {
    it("1: should dataService.cancel and dataConverter.cancel methods be invoked", () => {
      const [dataServiceCancelStub, dataConverterCancelStub] =
        setups.cancelIndexing1();

      workspaceCommon.cancelIndexing();
      assert.deepEqual(dataServiceCancelStub.calledOnce, true);
      assert.deepEqual(dataConverterCancelStub.calledOnce, true);
    });
  });

  describe("handleCancellationRequested", () => {
    it("1: should cancelIndexing method be invoked", () => {
      const [cancelIndexingStub] = setups.cancelIndexing1();

      (workspaceCommon as any).handleCancellationRequested();
      assert.deepEqual(cancelIndexingStub.calledOnce, true);
    });
  });
});
