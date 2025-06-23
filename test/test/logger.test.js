"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const logger_1 = require("../../src/logger");
const logger_testSetup_1 = require("../testSetup/logger.testSetup");
describe("Logger", () => {
    let setups;
    before(() => {
        setups = (0, logger_testSetup_1.getTestSetups)();
    });
    beforeEach(() => setups.beforeEach());
    afterEach(() => setups.afterEach());
    describe("init", () => {
        it("should output channel be created", () => {
            const [createOutputChannelStub] = setups.init.setupForCreatingOutputChannel();
            logger_1.logger.init();
            chai_1.assert.equal(createOutputChannelStub.calledOnce, true);
        });
    });
    describe("log", () => {
        it("should log message with timestamp", () => {
            const { stubs: [outputChannelInnerStub], expectedMessage, fakeTimer, } = setups.log.setupForLoggingMessageWithTimestamp();
            logger_1.logger.log("test message");
            chai_1.assert.equal(outputChannelInnerStub.calledOnceWith(expectedMessage), true);
            fakeTimer.restore();
        });
    });
    describe("logAction", () => {
        it("should log message with executed action", () => {
            const { stubs: [outputChannelInnerStub], expectedMessage, fakeTimer, action, } = setups.logAction.setupForLoggingExecutedAction();
            logger_1.logger.logAction(action);
            chai_1.assert.equal(outputChannelInnerStub.calledOnceWith(expectedMessage), true);
            fakeTimer.restore();
        });
    });
    describe("logScanTime", () => {
        it("should log message with scan time", () => {
            const { stubs: [outputChannelInnerStub], expectedMessage, fakeTimer, indexStats, } = setups.logScanTime.setupForLoggingScanTimeWithStats();
            logger_1.logger.logScanTime(indexStats);
            chai_1.assert.equal(outputChannelInnerStub.calledOnceWith(expectedMessage), true);
            fakeTimer.restore();
        });
    });
    describe("logStructure", () => {
        it("should log message with scanned workspace struture", () => {
            const { stubs: [outputChannelInnerStub], expectedMessage, fakeTimer, workspaceData, } = setups.logStructure.setupForLoggingWorkspaceStructure();
            logger_1.logger.logStructure(workspaceData);
            chai_1.assert.equal(outputChannelInnerStub.calledOnceWith(expectedMessage), true);
            fakeTimer.restore();
        });
    });
});
//# sourceMappingURL=logger.test.js.map