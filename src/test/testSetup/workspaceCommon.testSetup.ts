import * as sinon from "sinon";
import * as vscode from "vscode";
import { actionProcessor } from "../../actionProcessor";
import * as cache from "../../cache";
import * as config from "../../config";
import { dataConverter } from "../../dataConverter";
import { dataService } from "../../dataService";
import * as dataServiceEventsEmitter from "../../dataServiceEventsEmitter";
import { logger } from "../../logger";
import { patternProvider } from "../../patternProvider";
import { utils } from "../../utils";
import { getSubscription, getWorkspaceData } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },
    getData1: () => {
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
    getData2: () => {
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
    index1: () => {
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
    indexWithProgress1: () => {
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
    indexWithProgress2: () => {
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
    registerAction1: () => {
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
    downloadData1: () => {
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
    cancelIndexing1: () => {
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
    getNotificationLocation1: () => {
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
    getNotificationLocation2: () => {
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
    getNotificationTitle1: () => {
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
    getNotificationTitle2: () => {
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
    indexWithProgressTask1: () => {
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
    indexWithProgressTask2: () => {
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
    indexWithProgressTask3: () => {
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
    indexWithProgressTask4: () => {
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
    indexWithProgressTask5: () => {
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
  };
};
