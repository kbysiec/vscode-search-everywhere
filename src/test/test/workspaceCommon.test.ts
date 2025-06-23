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
    it("should cache.getData method be invoked", () => {
      setups.getData.setupForInvokingCacheGetDataMethod();

      assert.deepEqual(workspaceCommon.getData(), getQpItems());
    });

    it("should return empty array if cache.getData method returns undefined", () => {
      setups.getData.setupForReturningEmptyArrayWhenCacheGetDataReturnsUndefined();

      assert.deepEqual(workspaceCommon.getData(), []);
    });
  });

  describe("index", () => {
    it("should registerAction method be invoked which register rebuild action", async () => {
      const [registerStub] =
        setups.index.setupForInvokingRegisterActionToRegisterRebuildAction();
      await workspaceCommon.index("test comment");

      assert.equal(registerStub.calledOnce, true);
      assert.equal(registerStub.args[0][0].type, ActionType.Rebuild);
    });
  });

  describe("indexWithProgress", () => {
    it("should vscode.window.withProgress method be invoked if workspace has opened at least one folder", async () => {
      const [withProgressStub] =
        setups.indexWithProgress.setupForInvokingVscodeWindowWithProgressWhenWorkspaceHasFolders();

      await workspaceCommon.indexWithProgress();
      assert.equal(withProgressStub.calledOnce, true);
    });

    it("should printNoFolderOpenedMessage method be invoked if workspace does not has opened at least one folder", async () => {
      const [printNoFolderOpenedMessageStub] =
        setups.indexWithProgress.setupForInvokingPrintNoFolderOpenedMessageWhenWorkspaceHasNoFolders();

      await workspaceCommon.indexWithProgress();
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });
  });

  describe("registerAction", () => {
    it("should actionProcessor.register method be invoked", async () => {
      const [registerStub] =
        setups.registerAction.setupForInvokingActionProcessorRegisterMethod();

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
    it("should return data for quick pick", async () => {
      setups.downloadData.setupForReturningDataForQuickPick();

      assert.deepEqual(await workspaceCommon.downloadData(), getQpItems());
    });
  });

  describe("cancelIndexing", () => {
    it("should dataService.cancel and dataConverter.cancel methods be invoked", () => {
      const [dataServiceCancelStub, dataConverterCancelStub] =
        setups.cancelIndexing.setupForInvokingDataServiceAndDataConverterCancelMethods();

      workspaceCommon.cancelIndexing();
      assert.deepEqual(dataServiceCancelStub.calledOnce, true);
      assert.deepEqual(dataConverterCancelStub.calledOnce, true);
    });
  });

  describe("handleCancellationRequested", () => {
    it("should cancelIndexing method be invoked", () => {
      const [cancelIndexingStub] =
        setups.cancelIndexing.setupForInvokingDataServiceAndDataConverterCancelMethods();

      (workspaceCommon as any).handleCancellationRequested();
      assert.deepEqual(cancelIndexingStub.calledOnce, true);
    });
  });

  describe("getNotificationLocation", () => {
    it("should return Window as the location for messages", () => {
      setups.getNotificationLocation.setupForReturningWindowAsLocationForMessages();

      assert.equal(
        workspaceCommon.getNotificationLocation(),
        vscode.ProgressLocation.Window
      );
    });

    it("should return Notification as the location for messages", () => {
      setups.getNotificationLocation.setupForReturningNotificationAsLocationForMessages();

      assert.equal(
        workspaceCommon.getNotificationLocation(),
        vscode.ProgressLocation.Notification
      );
    });
  });

  describe("getNotificationTitle", () => {
    it("should return long title", () => {
      setups.getNotificationTitle.setupForReturningLongTitle();

      assert.equal(
        workspaceCommon.getNotificationTitle(),
        "Indexing workspace... file"
      );
    });

    it("should return short title", () => {
      setups.getNotificationTitle.setupForReturningShortTitle();

      assert.equal(workspaceCommon.getNotificationTitle(), "Indexing...");
    });
  });

  describe("indexWithProgressTask", () => {
    it("should existing onDidItemIndexed subscription be disposed", async () => {
      const {
        onDidItemIndexedSubscription,
        stubs: [onDidItemIndexedStub],
      } =
        setups.indexWithProgressTask.setupForDisposingExistingOnDidItemIndexedSubscription();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(onDidItemIndexedStub.calledOnce, true);
      assert.equal(onDidItemIndexedSubscription.dispose.calledOnce, true);
    });

    it("should utils.sleep method be invoked", async () => {
      const [sleepStub] =
        setups.indexWithProgressTask.setupForInvokingUtilsSleepMethod();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(sleepStub.calledOnce, true);
    });

    it("should print stats message be printed after indexing", async () => {
      const [printStatsMessageStub] =
        setups.indexWithProgressTask.setupForPrintingStatsMessageAfterIndexing();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(printStatsMessageStub.calledOnce, true);
    });

    it("should dataService.fetchData and dataConverter.convertToQpData methods be invoked", async () => {
      const [fetchDataStub, convertToQpDataStub] =
        setups.indexWithProgressTask.setupForInvokingDataServiceFetchDataAndDataConverterConvertToQpDataMethods();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceCommon.indexWithProgressTask(
        getProgress(),
        cancellationTokenSource.token
      );

      assert.equal(fetchDataStub.calledOnce, true);
      assert.equal(convertToQpDataStub.calledOnce, true);
    });

    it("should utils.printStatsMessage, logger.logScanTime and logger.logStructure methods be invoked", async () => {
      const [printStatsMessageStub, logScanTimeStub, logStructureMessageStub] =
        setups.indexWithProgressTask.setupForInvokingUtilsPrintStatsMessageLoggerLogScanTimeAndLoggerLogStructureMethods();
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
    it("should calculate progress step if doesn't exit", () => {
      workspaceCommon.handleDidItemIndexed(getProgress(), 5);

      assert.equal(workspaceCommon.getProgressStep(), 20);
    });

    it("should report current progress", () => {
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
