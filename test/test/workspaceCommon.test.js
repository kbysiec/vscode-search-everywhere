"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const vscode = require("vscode");
const types_1 = require("../../src/types");
const workspaceCommon_1 = require("../../src/workspaceCommon");
const workspaceCommon_testSetup_1 = require("../testSetup/workspaceCommon.testSetup");
const mockFactory_1 = require("../util/mockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
describe("WorkspaceCommon", () => {
    let setups;
    before(() => {
        setups = (0, workspaceCommon_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("getData", () => {
        it("should cache.getData method be invoked", () => {
            setups.getData.setupForInvokingCacheGetDataMethod();
            chai_1.assert.deepEqual(workspaceCommon_1.workspaceCommon.getData(), (0, qpItemMockFactory_1.getQpItems)());
        });
        it("should return empty array if cache.getData method returns undefined", () => {
            setups.getData.setupForReturningEmptyArrayWhenCacheGetDataReturnsUndefined();
            chai_1.assert.deepEqual(workspaceCommon_1.workspaceCommon.getData(), []);
        });
    });
    describe("index", () => {
        it("should registerAction method be invoked which register rebuild action", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerStub] = setups.index.setupForInvokingRegisterActionToRegisterRebuildAction();
            yield workspaceCommon_1.workspaceCommon.index("test comment");
            chai_1.assert.equal(registerStub.calledOnce, true);
            chai_1.assert.equal(registerStub.args[0][0].type, types_1.ActionType.Rebuild);
        }));
    });
    describe("indexWithProgress", () => {
        it("should vscode.window.withProgress method be invoked if workspace has opened at least one folder", () => __awaiter(void 0, void 0, void 0, function* () {
            const [withProgressStub] = setups.indexWithProgress.setupForInvokingVscodeWindowWithProgressWhenWorkspaceHasFolders();
            yield workspaceCommon_1.workspaceCommon.indexWithProgress();
            chai_1.assert.equal(withProgressStub.calledOnce, true);
        }));
        it("should printNoFolderOpenedMessage method be invoked if workspace does not has opened at least one folder", () => __awaiter(void 0, void 0, void 0, function* () {
            const [printNoFolderOpenedMessageStub] = setups.indexWithProgress.setupForInvokingPrintNoFolderOpenedMessageWhenWorkspaceHasNoFolders();
            yield workspaceCommon_1.workspaceCommon.indexWithProgress();
            chai_1.assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
        }));
    });
    describe("registerAction", () => {
        it("should actionProcessor.register method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerStub] = setups.registerAction.setupForInvokingActionProcessorRegisterMethod();
            yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Rebuild, () => { }, "test trigger");
            chai_1.assert.equal(registerStub.calledOnce, true);
            chai_1.assert.equal(registerStub.args[0][0].type, types_1.ActionType.Rebuild);
        }));
    });
    describe("downloadData", () => {
        it("should return data for quick pick", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.downloadData.setupForReturningDataForQuickPick();
            chai_1.assert.deepEqual(yield workspaceCommon_1.workspaceCommon.downloadData(), (0, qpItemMockFactory_1.getQpItems)());
        }));
    });
    describe("cancelIndexing", () => {
        it("should dataService.cancel and dataConverter.cancel methods be invoked", () => {
            const [dataServiceCancelStub, dataConverterCancelStub] = setups.cancelIndexing.setupForInvokingDataServiceAndDataConverterCancelMethods();
            workspaceCommon_1.workspaceCommon.cancelIndexing();
            chai_1.assert.deepEqual(dataServiceCancelStub.calledOnce, true);
            chai_1.assert.deepEqual(dataConverterCancelStub.calledOnce, true);
        });
    });
    describe("handleCancellationRequested", () => {
        it("should cancelIndexing method be invoked", () => {
            const [cancelIndexingStub] = setups.cancelIndexing.setupForInvokingDataServiceAndDataConverterCancelMethods();
            workspaceCommon_1.workspaceCommon.handleCancellationRequested();
            chai_1.assert.deepEqual(cancelIndexingStub.calledOnce, true);
        });
    });
    describe("getNotificationLocation", () => {
        it("should return Window as the location for messages", () => {
            setups.getNotificationLocation.setupForReturningWindowAsLocationForMessages();
            chai_1.assert.equal(workspaceCommon_1.workspaceCommon.getNotificationLocation(), vscode.ProgressLocation.Window);
        });
        it("should return Notification as the location for messages", () => {
            setups.getNotificationLocation.setupForReturningNotificationAsLocationForMessages();
            chai_1.assert.equal(workspaceCommon_1.workspaceCommon.getNotificationLocation(), vscode.ProgressLocation.Notification);
        });
    });
    describe("getNotificationTitle", () => {
        it("should return long title", () => {
            setups.getNotificationTitle.setupForReturningLongTitle();
            chai_1.assert.equal(workspaceCommon_1.workspaceCommon.getNotificationTitle(), "Indexing workspace... file");
        });
        it("should return short title", () => {
            setups.getNotificationTitle.setupForReturningShortTitle();
            chai_1.assert.equal(workspaceCommon_1.workspaceCommon.getNotificationTitle(), "Indexing...");
        });
    });
    describe("indexWithProgressTask", () => {
        it("should existing onDidItemIndexed subscription be disposed", () => __awaiter(void 0, void 0, void 0, function* () {
            const { onDidItemIndexedSubscription, stubs: [onDidItemIndexedStub], } = setups.indexWithProgressTask.setupForDisposingExistingOnDidItemIndexedSubscription();
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            yield workspaceCommon_1.workspaceCommon.indexWithProgressTask((0, mockFactory_1.getProgress)(), cancellationTokenSource.token);
            chai_1.assert.equal(onDidItemIndexedStub.calledOnce, true);
            chai_1.assert.equal(onDidItemIndexedSubscription.dispose.calledOnce, true);
        }));
        it("should utils.sleep method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [sleepStub] = setups.indexWithProgressTask.setupForInvokingUtilsSleepMethod();
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            yield workspaceCommon_1.workspaceCommon.indexWithProgressTask((0, mockFactory_1.getProgress)(), cancellationTokenSource.token);
            chai_1.assert.equal(sleepStub.calledOnce, true);
        }));
        it("should print stats message be printed after indexing", () => __awaiter(void 0, void 0, void 0, function* () {
            const [printStatsMessageStub] = setups.indexWithProgressTask.setupForPrintingStatsMessageAfterIndexing();
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            yield workspaceCommon_1.workspaceCommon.indexWithProgressTask((0, mockFactory_1.getProgress)(), cancellationTokenSource.token);
            chai_1.assert.equal(printStatsMessageStub.calledOnce, true);
        }));
        it("should dataService.fetchData and dataConverter.convertToQpData methods be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [fetchDataStub, convertToQpDataStub] = setups.indexWithProgressTask.setupForInvokingDataServiceFetchDataAndDataConverterConvertToQpDataMethods();
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            yield workspaceCommon_1.workspaceCommon.indexWithProgressTask((0, mockFactory_1.getProgress)(), cancellationTokenSource.token);
            chai_1.assert.equal(fetchDataStub.calledOnce, true);
            chai_1.assert.equal(convertToQpDataStub.calledOnce, true);
        }));
        it("should utils.printStatsMessage, logger.logScanTime and logger.logStructure methods be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [printStatsMessageStub, logScanTimeStub, logStructureMessageStub] = setups.indexWithProgressTask.setupForInvokingUtilsPrintStatsMessageLoggerLogScanTimeAndLoggerLogStructureMethods();
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            yield workspaceCommon_1.workspaceCommon.indexWithProgressTask((0, mockFactory_1.getProgress)(), cancellationTokenSource.token);
            chai_1.assert.equal(printStatsMessageStub.calledOnce, true);
            chai_1.assert.equal(logScanTimeStub.calledOnce, true);
            chai_1.assert.equal(logStructureMessageStub.calledOnce, true);
        }));
    });
    describe("handleDidItemIndexed", () => {
        it("should calculate progress step if doesn't exit", () => {
            workspaceCommon_1.workspaceCommon.handleDidItemIndexed((0, mockFactory_1.getProgress)(), 5);
            chai_1.assert.equal(workspaceCommon_1.workspaceCommon.getProgressStep(), 20);
        });
        it("should report current progress", () => {
            const progress = (0, mockFactory_1.getProgress)(40);
            workspaceCommon_1.workspaceCommon.handleDidItemIndexed(progress, 5);
            chai_1.assert.equal(progress.report.calledOnceWith({
                increment: 20,
                message: " 2 / 5 ... 40%",
            }), true);
        });
    });
});
//# sourceMappingURL=workspaceCommon.test.js.map