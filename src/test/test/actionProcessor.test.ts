import { assert } from "chai";
import * as sinon from "sinon";
import { actionProcessor } from "../../actionProcessor";
import { getTestSetups } from "../testSetup/actionProcessor.testSetup";
import { getAction } from "../util/mockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("ActionProcessor", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("register", () => {
    it("should add action to queue when register is called", async () => {
      const [addStub] = setups.register.setupForAddingActionToQueue();
      await actionProcessor.register(getAction());

      assert.equal(addStub.calledOnce, true);
    });

    it("should process action when action processor is not busy", async () => {
      const [processStub] = setups.register.setupForProcessingWhenNotBusy();
      await actionProcessor.register(getAction());

      assert.equal(processStub.calledOnce, true);
    });

    it("should not process action when action processor is busy", async () => {
      const [processStub] = setups.register.setupForProcessingWhenBusy();
      await actionProcessor.register(getAction());

      assert.equal(processStub.calledOnce, false);
    });

    it("should take actions from queue, reduce, and invoke its functions in appropriate order - with rebuild queued", async () => {
      const { action, queue } =
        setups.register.setupForQueueProcessingWithRebuildQueued();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[3].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });

    it("should take actions from queue, reduce, and invoke its functions in appropriate order - without rebuild queued", async () => {
      const { action, queue } =
        setups.register.setupForQueueProcessingWithoutRebuildQueued();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });

    it("should emit onWillProcessing event at the beginning of processing", async () => {
      const { action, eventEmitter } =
        setups.register.setupForWillProcessingEventEmission();
      await actionProcessor.register(action);

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("should emit onDidProcessing event at the end of processing", async () => {
      const { action, eventEmitter } =
        setups.register.setupForDidProcessingEventEmission();
      await actionProcessor.register(action);

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("should emit onWillExecuteAction event before execution of each action function", async () => {
      const { action, eventEmitter } =
        setups.register.setupForWillExecuteActionEventEmission();
      await actionProcessor.register(action);

      assert.equal(eventEmitter.fire.calledTwice, true);
    });

    it("should reduce rebuild actions and return array with last rebuild action if previous action is different type than rebuild", async () => {
      const { action, queue } =
        setups.register.setupForRebuildActionReductionWithDifferentPreviousAction();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });

    it("should reduce rebuild actions and return empty array if previous action is rebuild type", async () => {
      const { action, queue } =
        setups.register.setupForRebuildActionReductionWithRebuildPreviousAction();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, false);
    });

    it("should reduce actions with other type than rebuild", async () => {
      const { action, queue } =
        setups.register.setupForNonRebuildActionReduction();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });
  });
});
