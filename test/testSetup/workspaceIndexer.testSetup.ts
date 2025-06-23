import { performance } from "perf_hooks";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { actionProcessor } from "../../src/actionProcessor";
import * as cache from "../../src/cache";
import * as config from "../../src/config";
import { dataConverter } from "../../src/dataConverter";
import { dataService } from "../../src/dataService";
import * as dataServiceEventsEmitter from "../../src/dataServiceEventsEmitter";
import { logger } from "../../src/logger";
import { utils } from "../../src/utils";
import { workspaceIndexer } from "../../src/workspaceIndexer";
import { getWorkspaceData } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },

    getData: {
      setupForReturningData: () => {
        stubMultiple(
          [
            {
              object: cache,
              method: "getData",
              returns: getQpItems(),
            },
          ],
          sandbox
        );
        return getQpItems();
      },

      setupForEmptyCache: () => {
        stubMultiple(
          [
            {
              object: cache,
              method: "getData",
              returns: undefined,
            },
          ],
          sandbox
        );
        return [];
      },
    },

    index: {
      setupForActionRegistration: () => {
        return stubMultiple(
          [
            {
              object: actionProcessor,
              method: "register",
            },
          ],
          sandbox
        );
      },
    },

    indexWithProgress: {
      setupForWorkspaceFolderCheck: () => {
        return stubMultiple(
          [
            {
              object: utils,
              method: "hasWorkspaceAnyFolder",
              returns: true,
            },
            {
              object: vscode.window,
              method: "withProgress",
            },
          ],
          sandbox
        );
      },

      setupForNoFolderMessage: () => {
        return stubMultiple(
          [
            {
              object: utils,
              method: "hasWorkspaceAnyFolder",
              returns: false,
            },
            {
              object: utils,
              method: "printNoFolderOpenedMessage",
            },
          ],
          sandbox
        );
      },
    },

    registerAction: {
      setupForActionRegistration: () => {
        return stubMultiple(
          [
            {
              object: actionProcessor,
              method: "register",
            },
          ],
          sandbox
        );
      },
    },

    downloadData: {
      setupForDataDownload: () => {
        stubMultiple(
          [
            {
              object: dataService,
              method: "fetchData",
              returns: Promise.resolve(getWorkspaceData()),
            },
            {
              object: dataConverter,
              method: "convertToQpData",
              returns: getQpItems(),
            },
          ],
          sandbox
        );
        return getQpItems();
      },
    },

    cancelIndexing: {
      setupForCancellation: () => {
        return stubMultiple(
          [
            {
              object: dataService,
              method: "cancel",
            },
            {
              object: dataConverter,
              method: "cancel",
            },
          ],
          sandbox
        );
      },
    },

    handleCancellationRequested: {
      setupForCancellationHandling: () => {
        return stubMultiple(
          [
            {
              object: workspaceIndexer,
              method: "cancelIndexing",
            },
          ],
          sandbox
        );
      },
    },

    getNotificationLocation: {
      setupForNotificationLocation: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchShouldDisplayNotificationInStatusBar",
              returns: false,
            },
          ],
          sandbox
        );
      },

      setupForWindowLocation: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchShouldDisplayNotificationInStatusBar",
              returns: true,
            },
          ],
          sandbox
        );
      },
    },

    getNotificationTitle: {
      setupForNotificationTitle: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchShouldDisplayNotificationInStatusBar",
              returns: false,
            },
          ],
          sandbox
        );
      },

      setupForStatusBarTitle: () => {
        stubMultiple(
          [
            {
              object: config,
              method: "fetchShouldDisplayNotificationInStatusBar",
              returns: true,
            },
          ],
          sandbox
        );
      },
    },

    indexWithProgressTask: {
      setupForCancellationToken: () => {
        const onCancellationRequestedStub = sinon
          .stub()
          .returns({ dispose: sinon.stub() });
        const token = {
          onCancellationRequested: onCancellationRequestedStub,
          isCancellationRequested: false,
        };

        stubMultiple(
          [
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: { dispose: sinon.stub() },
            },
            {
              object: dataService,
              method: "fetchData",
              returns: Promise.resolve(getWorkspaceData()),
            },
            {
              object: dataConverter,
              method: "convertToQpData",
              returns: getQpItems(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: utils,
              method: "sleep",
            },
            {
              object: utils,
              method: "convertMsToSec",
              returns: 1,
            },
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: logger,
              method: "logScanTime",
            },
            {
              object: logger,
              method: "logStructure",
            },
          ],
          sandbox
        );

        return {
          token,
        };
      },

      setupForItemIndexedEvent: () => {
        return stubMultiple(
          [
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: { dispose: sinon.stub() },
            },
            {
              object: dataService,
              method: "fetchData",
              returns: Promise.resolve(getWorkspaceData()),
            },
            {
              object: dataConverter,
              method: "convertToQpData",
              returns: getQpItems(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: utils,
              method: "sleep",
            },
            {
              object: utils,
              method: "convertMsToSec",
              returns: 1,
            },
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: logger,
              method: "logScanTime",
            },
            {
              object: logger,
              method: "logStructure",
            },
          ],
          sandbox
        );
      },

      setupForPerformanceMeasurement: () => {
        return stubMultiple(
          [
            {
              object: performance,
              method: "now",
              returns: 1000,
            },
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: { dispose: sinon.stub() },
            },
            {
              object: dataService,
              method: "fetchData",
              returns: Promise.resolve(getWorkspaceData()),
            },
            {
              object: dataConverter,
              method: "convertToQpData",
              returns: getQpItems(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: utils,
              method: "sleep",
            },
            {
              object: utils,
              method: "convertMsToSec",
              returns: 1,
            },
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: logger,
              method: "logScanTime",
            },
            {
              object: logger,
              method: "logStructure",
            },
          ],
          sandbox
        );
      },

      setupForSleepCall: () => {
        return stubMultiple(
          [
            {
              object: utils,
              method: "sleep",
            },
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: { dispose: sinon.stub() },
            },
            {
              object: dataService,
              method: "fetchData",
              returns: Promise.resolve(getWorkspaceData()),
            },
            {
              object: dataConverter,
              method: "convertToQpData",
              returns: getQpItems(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: utils,
              method: "convertMsToSec",
              returns: 1,
            },
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: logger,
              method: "logScanTime",
            },
            {
              object: logger,
              method: "logStructure",
            },
          ],
          sandbox
        );
      },

      setupForStatsLogging: () => {
        return stubMultiple(
          [
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: logger,
              method: "logScanTime",
            },
            {
              object: logger,
              method: "logStructure",
            },
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: { dispose: sinon.stub() },
            },
            {
              object: dataService,
              method: "fetchData",
              returns: Promise.resolve(getWorkspaceData()),
            },
            {
              object: dataConverter,
              method: "convertToQpData",
              returns: getQpItems(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: utils,
              method: "sleep",
            },
            {
              object: utils,
              method: "convertMsToSec",
              returns: 1,
            },
          ],
          sandbox
        );
      },
    },

    handleDidItemIndexed: {
      setupForProgressCalculation: () => {
        // Don't stub getProgressStep - let it work naturally to return the calculated value
      },

      setupForProgressReporting: () => {
        stubMultiple(
          [
            {
              object: workspaceIndexer,
              method: "getProgressStep",
              returns: 20,
            },
            {
              object: workspaceIndexer,
              method: "getCurrentProgressValue",
              returns: 20,
            },
          ],
          sandbox
        );
      },
    },
  };
};
