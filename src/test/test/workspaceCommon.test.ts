import { assert } from "chai";
import * as vscode from "vscode";
import { ActionType } from "../../types";
import { workspaceCommon } from "../../workspaceCommon";
import { getTestSetups } from "../testSetup/workspaceCommon.testSetup";
import { getProgress } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("WorkspaceCommon", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

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
        "test trigger"
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

  describe("getNotificationLocation", () => {
    it("1: should return Window as the location for messages", () => {
      setups.getNotificationLocation1();

      assert.equal(
        workspaceCommon.getNotificationLocation(),
        vscode.ProgressLocation.Window
      );
    });

    it("2: should return Notification as the location for messages", () => {
      setups.getNotificationLocation2();

      assert.equal(
        workspaceCommon.getNotificationLocation(),
        vscode.ProgressLocation.Notification
      );
    });
  });

  describe("getNotificationTitle", () => {
    it("1: should return long title", () => {
      setups.getNotificationTitle1();

      assert.equal(
        workspaceCommon.getNotificationTitle(),
        "Indexing workspace... file"
      );
    });

    it("2: should return short title", () => {
      setups.getNotificationTitle2();

      assert.equal(workspaceCommon.getNotificationTitle(), "Indexing...");
    });
  });

  describe("indexWithProgressTask", () => {
    it("1: should existing onDidItemIndexed subscription be disposed", async () => {
      const {
        onDidItemIndexedSubscription,
        stubs: [onDidItemIndexedStub],
      } = setups.indexWithProgressTask1();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(onDidItemIndexedStub.calledOnce, true);
      assert.equal(onDidItemIndexedSubscription.dispose.calledOnce, true);
    });

    it("2: should utils.sleep method be invoked", async () => {
      const [sleepStub] = setups.indexWithProgressTask2();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(sleepStub.calledOnce, true);
    });

    it("3: should print stats message be printed after indexing", async () => {
      const [printStatsMessageStub] = setups.indexWithProgressTask3();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(printStatsMessageStub.calledOnce, true);
    });

    it("4: should dataService.fetchData and dataConverter.convertToQpData methods be invoked", async () => {
      const [fetchDataStub, convertToQpDataStub] =
        setups.indexWithProgressTask4();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(fetchDataStub.calledOnce, true);
      assert.equal(convertToQpDataStub.calledOnce, true);
    });

    it("5: should utils.printStatsMessage, logger.logScanTime and logger.logStructure methods be invoked", async () => {
      const [printStatsMessageStub, logScanTimeStub, logStructureMessageStub] =
        setups.indexWithProgressTask5();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(printStatsMessageStub.calledOnce, true);
      assert.equal(logScanTimeStub.calledOnce, true);
      assert.equal(logStructureMessageStub.calledOnce, true);
    });
  });

  describe("handleDidItemIndexed", () => {
    it("1: should calculate progress step if doesn't exit", () => {
      workspaceCommon.handleDidItemIndexed(getProgress(), 5);

      assert.equal(workspaceCommon.getProgressStep(), 20);
    });

    it("2: should report current progress", () => {
      const progress = getProgress(40);
      workspaceCommon.handleDidItemIndexed(progress, 5);

      assert.equal(
        progress.report.calledOnceWith({
          increment: 20,
          message: " 2 / 5 ... 40%",
        }),
        true
      );
    });
  });
});
