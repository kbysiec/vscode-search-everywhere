import * as sinon from "sinon";
import * as vscode from "vscode";
import { actionProcessor } from "../../src/actionProcessor";
import * as cache from "../../src/cache";
import * as config from "../../src/config";
import { dataConverter } from "../../src/dataConverter";
import { dataService } from "../../src/dataService";
import * as dataServiceEventsEmitter from "../../src/dataServiceEventsEmitter";
import { logger } from "../../src/logger";
import { patternProvider } from "../../src/patternProvider";
import { utils } from "../../src/utils";
import { getSubscription, getWorkspaceData } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },

    getData: {
      setupForInvokingCacheGetDataMethod: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "getData",
              returns: getQpItems(),
            },
          ],
          sandbox
        );
      },

      setupForReturningEmptyArrayWhenCacheGetDataReturnsUndefined: () => {
        return stubMultiple(
          [
            {
              object: cache,
              method: "getData",
              returns: undefined,
            },
          ],
          sandbox
        );
      },
    },

    index: {
      setupForInvokingRegisterActionToRegisterRebuildAction: () => {
        return stubMultiple(
          [
            {
              object: actionProcessor,
              method: "register",
            },
            {
              object: patternProvider,
              method: "getExcludePatterns",
              returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
            },
          ],
          sandbox
        );
      },
    },

    indexWithProgress: {
      setupForInvokingVscodeWindowWithProgressWhenWorkspaceHasFolders: () => {
        return stubMultiple(
          [
            {
              object: vscode.window,
              method: "withProgress",
            },
            {
              object: utils,
              method: "hasWorkspaceAnyFolder",
              returns: true,
            },
            {
              object: patternProvider,
              method: "getExcludePatterns",
              returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
            },
            {
              object: config,
              method: "fetchShouldDisplayNotificationInStatusBar",
            },
          ],
          sandbox
        );
      },

      setupForInvokingPrintNoFolderOpenedMessageWhenWorkspaceHasNoFolders:
        () => {
          return stubMultiple(
            [
              {
                object: utils,
                method: "printNoFolderOpenedMessage",
              },
              {
                object: utils,
                method: "hasWorkspaceAnyFolder",
                returns: false,
              },
            ],
            sandbox
          );
        },
    },

    registerAction: {
      setupForInvokingActionProcessorRegisterMethod: () => {
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
      setupForReturningDataForQuickPick: () => {
        stubMultiple(
          [
            {
              object: dataService,
              method: "fetchData",
            },
            {
              object: dataConverter,
              method: "convertToQpData",
              returns: getQpItems(),
            },
          ],
          sandbox
        );
      },
    },

    cancelIndexing: {
      setupForInvokingDataServiceAndDataConverterCancelMethods: () => {
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

    getNotificationLocation: {
      setupForReturningWindowAsLocationForMessages: () => {
        return stubMultiple(
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

      setupForReturningNotificationAsLocationForMessages: () => {
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
    },

    getNotificationTitle: {
      setupForReturningLongTitle: () => {
        return stubMultiple(
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

      setupForReturningShortTitle: () => {
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
      setupForDisposingExistingOnDidItemIndexedSubscription: () => {
        const outputChannelInner =
          vscode.window.createOutputChannel("Search everywhere");
        const onDidItemIndexedSubscription = getSubscription();

        const stubs = stubMultiple(
          [
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: onDidItemIndexedSubscription,
            },
            {
              object: dataService,
              method: "fetchData",
              returns: getWorkspaceData(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: cache,
              method: "clear",
            },
            {
              object: dataConverter,
              method: "convertToQpData",
            },
            {
              object: utils,
              method: "convertMsToSec",
            },
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: utils,
              method: "sleep",
            },
            {
              object: logger,
              method: "getChannel",
              returns: outputChannelInner,
            },
          ],
          sandbox
        );

        return {
          onDidItemIndexedSubscription,
          stubs,
        };
      },

      setupForInvokingUtilsSleepMethod: () => {
        const outputChannelInner =
          vscode.window.createOutputChannel("Search everywhere");
        const onDidItemIndexedSubscription = getSubscription();

        return stubMultiple(
          [
            {
              object: utils,
              method: "sleep",
            },
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: onDidItemIndexedSubscription,
            },
            {
              object: dataService,
              method: "fetchData",
              returns: getWorkspaceData(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: cache,
              method: "clear",
            },
            {
              object: dataConverter,
              method: "convertToQpData",
            },
            {
              object: utils,
              method: "convertMsToSec",
            },
            {
              object: logger,
              method: "getChannel",
              returns: outputChannelInner,
            },
          ],
          sandbox
        );
      },

      setupForPrintingStatsMessageAfterIndexing: () => {
        const outputChannelInner =
          vscode.window.createOutputChannel("Search everywhere");
        const onDidItemIndexedSubscription = getSubscription();

        return stubMultiple(
          [
            {
              object: utils,
              method: "printStatsMessage",
            },
            {
              object: utils,
              method: "sleep",
            },
            {
              object: dataServiceEventsEmitter,
              method: "onDidItemIndexed",
              returns: onDidItemIndexedSubscription,
            },
            {
              object: dataService,
              method: "fetchData",
              returns: getWorkspaceData(),
            },
            {
              object: cache,
              method: "updateData",
            },
            {
              object: cache,
              method: "clear",
            },
            {
              object: dataConverter,
              method: "convertToQpData",
            },
            {
              object: utils,
              method: "convertMsToSec",
            },
            {
              object: logger,
              method: "getChannel",
              returns: outputChannelInner,
            },
          ],
          sandbox
        );
      },

      setupForInvokingDataServiceFetchDataAndDataConverterConvertToQpDataMethods:
        () => {
          const outputChannelInner =
            vscode.window.createOutputChannel("Search everywhere");
          const onDidItemIndexedSubscription = getSubscription();

          return stubMultiple(
            [
              {
                object: dataService,
                method: "fetchData",
                returns: getWorkspaceData(),
              },
              {
                object: dataConverter,
                method: "convertToQpData",
              },
              {
                object: utils,
                method: "printStatsMessage",
              },
              {
                object: utils,
                method: "sleep",
              },
              {
                object: dataServiceEventsEmitter,
                method: "onDidItemIndexed",
                returns: onDidItemIndexedSubscription,
              },
              {
                object: cache,
                method: "updateData",
              },
              {
                object: cache,
                method: "clear",
              },
              {
                object: utils,
                method: "convertMsToSec",
              },
              {
                object: logger,
                method: "getChannel",
                returns: outputChannelInner,
              },
            ],
            sandbox
          );
        },

      setupForInvokingUtilsPrintStatsMessageLoggerLogScanTimeAndLoggerLogStructureMethods:
        () => {
          const outputChannelInner =
            vscode.window.createOutputChannel("Search everywhere");
          const onDidItemIndexedSubscription = getSubscription();

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
                object: dataService,
                method: "fetchData",
                returns: getWorkspaceData(),
              },
              {
                object: dataConverter,
                method: "convertToQpData",
              },
              {
                object: utils,
                method: "sleep",
              },
              {
                object: dataServiceEventsEmitter,
                method: "onDidItemIndexed",
                returns: onDidItemIndexedSubscription,
              },
              {
                object: cache,
                method: "updateData",
              },
              {
                object: cache,
                method: "clear",
              },
              {
                object: utils,
                method: "convertMsToSec",
              },
              {
                object: logger,
                method: "getChannel",
                returns: outputChannelInner,
              },
            ],
            sandbox
          );
        },
    },
  };
};
