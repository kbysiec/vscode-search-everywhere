import { assert } from "chai";
import { logger } from "../../src/logger";
import { getTestSetups } from "../testSetup/logger.testSetup";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("Logger", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  beforeEach(() => setups.beforeEach());
  afterEach(() => setups.afterEach());

  describe("init", () => {
    it("should output channel be created", () => {
      const [createOutputChannelStub] =
        setups.init.setupForCreatingOutputChannel();
      logger.init();
      assert.equal(createOutputChannelStub.calledOnce, true);
    });
  });

  describe("log", () => {
    it("should log message with timestamp", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
      } = setups.log.setupForLoggingMessageWithTimestamp();
      logger.log("test message");

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });

  describe("logAction", () => {
    it("should log message with executed action", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
        action,
      } = setups.logAction.setupForLoggingExecutedAction();
      logger.logAction(action);

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });

  describe("logScanTime", () => {
    it("should log message with scan time", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
        indexStats,
      } = setups.logScanTime.setupForLoggingScanTimeWithStats();
      logger.logScanTime(indexStats);

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });

  describe("logStructure", () => {
    it("should log message with scanned workspace struture", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
        workspaceData,
      } = setups.logStructure.setupForLoggingWorkspaceStructure();
      logger.logStructure(workspaceData);

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });
});
