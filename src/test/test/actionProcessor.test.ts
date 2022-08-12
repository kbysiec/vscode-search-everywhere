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
    it("1: should add method be invoked", async () => {
      const [addStub] = setups.register1();
      await actionProcessor.register(getAction());

      assert.equal(addStub.calledOnce, true);
    });

    it("2: should process method be invoked if action processor is not busy", async () => {
      const [processStub] = setups.register2();
      await actionProcessor.register(getAction());

      assert.equal(processStub.calledOnce, true);
    });

    it("3: should not process method be invoked if action processor is busy", async () => {
      const [processStub] = setups.register3();
      await actionProcessor.register(getAction());

      assert.equal(processStub.calledOnce, false);
    });

    it(`4: should take actions from queue, reduce, and invoke
      its functions in appropriate order - with rebuild queued`, async () => {
      const { action, queue } = setups.register4();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[3].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });

    it(`5: should take actions from queue, reduce, and invoke
       its functions in appropriate order - without rebuild queued`, async () => {
      const { action, queue } = setups.register5();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });

    it("6: should onWillProcessing be emitted at the beginning of processing", async () => {
      const { action, eventEmitter } = setups.register6();
      await actionProcessor.register(action);

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("7: should onDidProcessing be emitted in the end of processing", async () => {
      const { action, eventEmitter } = setups.register7();
      await actionProcessor.register(action);

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it(`8: should onWillExecuteAction be emitted before execution
        of each action function`, async () => {
      const { action, eventEmitter } = setups.register8();
      await actionProcessor.register(action);

      assert.equal(eventEmitter.fire.calledTwice, true);
    });

    it(`9: should reduce rebuild actions and return array with last
      rebuild action if previous action is different type than rebuild`, async () => {
      const { action, queue } = setups.register9();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });

    it(`10: should reduce rebuild actions and return empty array
          if previous action is rebuild type`, async () => {
      const { action, queue } = setups.register10();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, false);
    });

    it("11: should reduce actions with other type than rebuild", async () => {
      const { action, queue } = setups.register11();
      await actionProcessor.register(action);

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((action.fn as sinon.SinonStub).calledOnce, true);
    });
  });
});
