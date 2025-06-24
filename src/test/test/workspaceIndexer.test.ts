import { assert } from "chai";
import * as vscode from "vscode";
import { ActionType } from "../../types";
import { workspaceIndexer } from "../../workspaceIndexer";
import { getTestSetups } from "../testSetup/workspaceIndexer.testSetup";
import { getProgress } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("WorkspaceIndexer", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("getData", () => {
    it("should return array of indexed symbols and files from cache", () => {
      const qpItems = setups.getData.setupForReturningData();
      assert.deepEqual(workspaceIndexer.getData(), getQpItems());
    });

    it("should return empty array if cache is undefined", () => {
      const qpItems = setups.getData.setupForEmptyCache();
      assert.deepEqual(workspaceIndexer.getData(), []);
    });
  });

  describe("index", () => {
    it("should call actionProcessor.register method", async () => {
      const [registerStub] = setups.index.setupForActionRegistration();
      await workspaceIndexer.index("test comment");

      assert.equal(registerStub.calledOnce, true);
    });
  });

  describe("indexWithProgress", () => {
    it("should utils.hasWorkspaceAnyFolder method be invoked", async () => {
      const [hasWorkspaceAnyFolderStub] =
        setups.indexWithProgress.setupForWorkspaceFolderCheck();
      await workspaceIndexer.indexWithProgress();

      assert.equal(hasWorkspaceAnyFolderStub.calledOnce, true);
    });

    it("should utils.printNoFolderOpenedMessage method be invoked if utils.hasWorkspaceAnyFolder returns false", async () => {
      const [printNoFolderOpenedMessageStub] =
        setups.indexWithProgress.setupForNoFolderMessage();
      await workspaceIndexer.indexWithProgress();

      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });
  });

  describe("registerAction", () => {
    it("should call actionProcessor.register method", async () => {
      const [registerStub] = setups.registerAction.setupForActionRegistration();
      await workspaceIndexer.registerAction(
        ActionType.Rebuild,
        () => {},
        "test trigger"
      );

      assert.equal(registerStub.calledOnce, true);
    });
  });

  describe("downloadData", () => {
    it("should return downloaded qp items", async () => {
      const qpItems = setups.downloadData.setupForDataDownload();
      assert.deepEqual(await workspaceIndexer.downloadData(), getQpItems());
    });
  });

  describe("cancelIndexing", () => {
    it("should call dataService.cancel and dataConverter.cancel methods", () => {
      const [dataServiceCancelStub, dataConverterCancelStub] =
        setups.cancelIndexing.setupForCancellation();
      workspaceIndexer.cancelIndexing();

      assert.equal(dataServiceCancelStub.calledOnce, true);
      assert.equal(dataConverterCancelStub.calledOnce, true);
    });
  });

  describe("handleCancellationRequested", () => {
    it("should call cancelIndexing method", () => {
      const [cancelIndexingStub] =
        setups.handleCancellationRequested.setupForCancellationHandling();
      (workspaceIndexer as any).handleCancellationRequested();

      assert.equal(cancelIndexingStub.calledOnce, true);
    });
  });

  describe("getNotificationLocation", () => {
    it("should return vscode.ProgressLocation.Notification if shouldDisplayNotificationInStatusBar returns false", () => {
      setups.getNotificationLocation.setupForNotificationLocation();
      assert.equal(
        workspaceIndexer.getNotificationLocation(),
        vscode.ProgressLocation.Notification
      );
    });

    it("should return vscode.ProgressLocation.Window if shouldDisplayNotificationInStatusBar returns true", () => {
      setups.getNotificationLocation.setupForWindowLocation();
      assert.equal(
        workspaceIndexer.getNotificationLocation(),
        vscode.ProgressLocation.Window
      );
    });
  });

  describe("getNotificationTitle", () => {
    it("should return 'Indexing workspace... file' if shouldDisplayNotificationInStatusBar returns false", () => {
      setups.getNotificationTitle.setupForNotificationTitle();
      assert.equal(
        workspaceIndexer.getNotificationTitle(),
        "Indexing workspace... file"
      );
    });

    it("should return 'Indexing...' if shouldDisplayNotificationInStatusBar returns true", () => {
      setups.getNotificationTitle.setupForStatusBarTitle();
      assert.equal(workspaceIndexer.getNotificationTitle(), "Indexing...");
    });
  });

  describe("indexWithProgressTask", () => {
    it("should invoke token.onCancellationRequested method", async () => {
      const { token } =
        setups.indexWithProgressTask.setupForCancellationToken();
      await workspaceIndexer.indexWithProgressTask(getProgress(), token as any);

      assert.equal(token.onCancellationRequested.calledOnce, true);
    });

    it("should invoke onDidItemIndexed method", async () => {
      const [onDidItemIndexedStub] =
        setups.indexWithProgressTask.setupForItemIndexedEvent();
      const token = {
        onCancellationRequested: () => ({ dispose: () => {} }),
      };
      await workspaceIndexer.indexWithProgressTask(getProgress(), token as any);

      assert.equal(onDidItemIndexedStub.calledOnce, true);
    });

    it("should invoke performance.now method", async () => {
      const [performanceNowStub] =
        setups.indexWithProgressTask.setupForPerformanceMeasurement();
      const token = {
        onCancellationRequested: () => ({ dispose: () => {} }),
      };
      await workspaceIndexer.indexWithProgressTask(getProgress(), token as any);

      assert.equal(performanceNowStub.calledTwice, true);
    });

    it("should invoke utils.sleep method", async () => {
      const [sleepStub] = setups.indexWithProgressTask.setupForSleepCall();
      const token = {
        onCancellationRequested: () => ({ dispose: () => {} }),
      };
      await workspaceIndexer.indexWithProgressTask(getProgress(), token as any);

      assert.equal(sleepStub.calledOnce, true);
    });

    it("should invoke utils.printStatsMessage, logger.logScanTime and logger.logStructure methods", async () => {
      const [printStatsMessageStub, logScanTimeStub, logStructureStub] =
        setups.indexWithProgressTask.setupForStatsLogging();
      const token = {
        onCancellationRequested: () => ({ dispose: () => {} }),
      };
      await workspaceIndexer.indexWithProgressTask(getProgress(), token as any);

      assert.equal(printStatsMessageStub.calledOnce, true);
      assert.equal(logScanTimeStub.calledOnce, true);
      assert.equal(logStructureStub.calledOnce, true);
    });
  });

  describe("handleDidItemIndexed", () => {
    it("should call calculateProgressStep and other progress methods on first call", () => {
      setups.handleDidItemIndexed.setupForProgressCalculation();
      // Call the method twice to test the calculation
      workspaceIndexer.handleDidItemIndexed(getProgress(), 5);
      workspaceIndexer.handleDidItemIndexed(getProgress(), 5);

      assert.equal(workspaceIndexer.getProgressStep(), 20);
    });

    it("should call progress.report method", () => {
      const progress = getProgress();
      setups.handleDidItemIndexed.setupForProgressReporting();
      workspaceIndexer.handleDidItemIndexed(progress, 5);

      assert.equal(progress.report.calledOnce, true);
    });
  });
});
