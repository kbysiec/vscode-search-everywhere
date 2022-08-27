import { assert } from "chai";
import { logger } from "../../logger";
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
    it("1: should output channel be created", () => {
      const [createOutputChannelStub] = setups.init1();
      logger.init();
      assert.equal(createOutputChannelStub.calledOnce, true);
    });
  });

  describe("log", () => {
    it("1: should log message with timestamp", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
      } = setups.log1();
      logger.log("test message");

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });

  describe("logAction", () => {
    it("1: should log message with executed action", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
        action,
      } = setups.logAction1();
      logger.logAction(action);

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });

  describe("logScanTime", () => {
    it("1: should log message with scan time", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
        indexStats,
      } = setups.logScanTime1();
      logger.logScanTime(indexStats);

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });

  describe("logStructure", () => {
    it("1: should log message with scanned workspace struture", () => {
      const {
        stubs: [outputChannelInnerStub],
        expectedMessage,
        fakeTimer,
        workspaceData,
      } = setups.logStructure1();
      logger.logStructure(workspaceData);

      assert.equal(
        outputChannelInnerStub.calledOnceWith(expectedMessage),
        true
      );

      fakeTimer.restore();
    });
  });
});
