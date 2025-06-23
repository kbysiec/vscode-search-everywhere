"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const actionProcessor_1 = require("../../src/actionProcessor");
const cache = require("../../src/cache");
const config = require("../../src/config");
const dataConverter_1 = require("../../src/dataConverter");
const dataService_1 = require("../../src/dataService");
const dataServiceEventsEmitter = require("../../src/dataServiceEventsEmitter");
const logger_1 = require("../../src/logger");
const patternProvider_1 = require("../../src/patternProvider");
const utils_1 = require("../../src/utils");
const mockFactory_1 = require("../util/mockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        getData: {
            setupForInvokingCacheGetDataMethod: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
            setupForReturningEmptyArrayWhenCacheGetDataReturnsUndefined: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "getData",
                        returns: undefined,
                    },
                ], sandbox);
            },
        },
        index: {
            setupForInvokingRegisterActionToRegisterRebuildAction: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "register",
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludePatterns",
                        returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
                    },
                ], sandbox);
            },
        },
        indexWithProgress: {
            setupForInvokingVscodeWindowWithProgressWhenWorkspaceHasFolders: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.window,
                        method: "withProgress",
                    },
                    {
                        object: utils_1.utils,
                        method: "hasWorkspaceAnyFolder",
                        returns: true,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludePatterns",
                        returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
                    },
                    {
                        object: config,
                        method: "fetchShouldDisplayNotificationInStatusBar",
                    },
                ], sandbox);
            },
            setupForInvokingPrintNoFolderOpenedMessageWhenWorkspaceHasNoFolders: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "printNoFolderOpenedMessage",
                    },
                    {
                        object: utils_1.utils,
                        method: "hasWorkspaceAnyFolder",
                        returns: false,
                    },
                ], sandbox);
            },
        },
        registerAction: {
            setupForInvokingActionProcessorRegisterMethod: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "register",
                    },
                ], sandbox);
            },
        },
        downloadData: {
            setupForReturningDataForQuickPick: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataService_1.dataService,
                        method: "fetchData",
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "convertToQpData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
        },
        cancelIndexing: {
            setupForInvokingDataServiceAndDataConverterCancelMethods: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataService_1.dataService,
                        method: "cancel",
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "cancel",
                    },
                ], sandbox);
            },
        },
        getNotificationLocation: {
            setupForReturningWindowAsLocationForMessages: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchShouldDisplayNotificationInStatusBar",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForReturningNotificationAsLocationForMessages: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchShouldDisplayNotificationInStatusBar",
                        returns: false,
                    },
                ], sandbox);
            },
        },
        getNotificationTitle: {
            setupForReturningLongTitle: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchShouldDisplayNotificationInStatusBar",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForReturningShortTitle: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchShouldDisplayNotificationInStatusBar",
                        returns: true,
                    },
                ], sandbox);
            },
        },
        indexWithProgressTask: {
            setupForDisposingExistingOnDidItemIndexedSubscription: () => {
                const outputChannelInner = vscode.window.createOutputChannel("Search everywhere");
                const onDidItemIndexedSubscription = (0, mockFactory_1.getSubscription)();
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataServiceEventsEmitter,
                        method: "onDidItemIndexed",
                        returns: onDidItemIndexedSubscription,
                    },
                    {
                        object: dataService_1.dataService,
                        method: "fetchData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
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
                        object: dataConverter_1.dataConverter,
                        method: "convertToQpData",
                    },
                    {
                        object: utils_1.utils,
                        method: "convertMsToSec",
                    },
                    {
                        object: utils_1.utils,
                        method: "printStatsMessage",
                    },
                    {
                        object: utils_1.utils,
                        method: "sleep",
                    },
                    {
                        object: logger_1.logger,
                        method: "getChannel",
                        returns: outputChannelInner,
                    },
                ], sandbox);
                return {
                    onDidItemIndexedSubscription,
                    stubs,
                };
            },
            setupForInvokingUtilsSleepMethod: () => {
                const outputChannelInner = vscode.window.createOutputChannel("Search everywhere");
                const onDidItemIndexedSubscription = (0, mockFactory_1.getSubscription)();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "sleep",
                    },
                    {
                        object: utils_1.utils,
                        method: "printStatsMessage",
                    },
                    {
                        object: dataServiceEventsEmitter,
                        method: "onDidItemIndexed",
                        returns: onDidItemIndexedSubscription,
                    },
                    {
                        object: dataService_1.dataService,
                        method: "fetchData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
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
                        object: dataConverter_1.dataConverter,
                        method: "convertToQpData",
                    },
                    {
                        object: utils_1.utils,
                        method: "convertMsToSec",
                    },
                    {
                        object: logger_1.logger,
                        method: "getChannel",
                        returns: outputChannelInner,
                    },
                ], sandbox);
            },
            setupForPrintingStatsMessageAfterIndexing: () => {
                const outputChannelInner = vscode.window.createOutputChannel("Search everywhere");
                const onDidItemIndexedSubscription = (0, mockFactory_1.getSubscription)();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "printStatsMessage",
                    },
                    {
                        object: utils_1.utils,
                        method: "sleep",
                    },
                    {
                        object: dataServiceEventsEmitter,
                        method: "onDidItemIndexed",
                        returns: onDidItemIndexedSubscription,
                    },
                    {
                        object: dataService_1.dataService,
                        method: "fetchData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
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
                        object: dataConverter_1.dataConverter,
                        method: "convertToQpData",
                    },
                    {
                        object: utils_1.utils,
                        method: "convertMsToSec",
                    },
                    {
                        object: logger_1.logger,
                        method: "getChannel",
                        returns: outputChannelInner,
                    },
                ], sandbox);
            },
            setupForInvokingDataServiceFetchDataAndDataConverterConvertToQpDataMethods: () => {
                const outputChannelInner = vscode.window.createOutputChannel("Search everywhere");
                const onDidItemIndexedSubscription = (0, mockFactory_1.getSubscription)();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataService_1.dataService,
                        method: "fetchData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "convertToQpData",
                    },
                    {
                        object: utils_1.utils,
                        method: "printStatsMessage",
                    },
                    {
                        object: utils_1.utils,
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
                        object: utils_1.utils,
                        method: "convertMsToSec",
                    },
                    {
                        object: logger_1.logger,
                        method: "getChannel",
                        returns: outputChannelInner,
                    },
                ], sandbox);
            },
            setupForInvokingUtilsPrintStatsMessageLoggerLogScanTimeAndLoggerLogStructureMethods: () => {
                const outputChannelInner = vscode.window.createOutputChannel("Search everywhere");
                const onDidItemIndexedSubscription = (0, mockFactory_1.getSubscription)();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "printStatsMessage",
                    },
                    {
                        object: logger_1.logger,
                        method: "logScanTime",
                    },
                    {
                        object: logger_1.logger,
                        method: "logStructure",
                    },
                    {
                        object: dataService_1.dataService,
                        method: "fetchData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
                    },
                    {
                        object: dataConverter_1.dataConverter,
                        method: "convertToQpData",
                    },
                    {
                        object: utils_1.utils,
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
                        object: utils_1.utils,
                        method: "convertMsToSec",
                    },
                    {
                        object: logger_1.logger,
                        method: "getChannel",
                        returns: outputChannelInner,
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=workspaceCommon.testSetup.js.map