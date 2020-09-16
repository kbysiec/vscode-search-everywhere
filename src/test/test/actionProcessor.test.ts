import * as sinon from "sinon";
import { assert } from "chai";
import { getAction } from "../util/mockFactory";
import { getUtilsStub } from "../util/stubFactory";
import ActionProcessor from "../../actionProcessor";
import ActionType from "../../enum/actionType";
import Utils from "../../utils";
import { getTestSetups } from "../testSetup/actionProcessor.testSetup";

describe("ActionProcessor", () => {
  let utilsStub: Utils = getUtilsStub();
  let actionProcessor: ActionProcessor = new ActionProcessor(utilsStub);
  let actionProcessorAny: any;
  let setups = getTestSetups(actionProcessor);

  beforeEach(() => {
    utilsStub = getUtilsStub();
    actionProcessor = new ActionProcessor(utilsStub);
    actionProcessorAny = actionProcessor as any;
    setups = getTestSetups(actionProcessor);
  });

  describe("register", () => {
    it("1: should add method be invoked", async () => {
      const [addStub] = setups.register1();
      await actionProcessorAny.register(getAction());

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
  });

  describe("add", () => {
    it("1: should add action to queue", () => {
      const { action, queue } = setups.add1();
      actionProcessorAny.add(action);

      assert.equal(queue.length, 1);
      assert.deepEqual(queue[0], action);
    });
  });

  describe("process", () => {
    it(`1: should take actions from queue, reduce, and invoke
      its functions in appropriate order - with rebuild queued`, async () => {
      const queue = setups.process1();
      await actionProcessorAny.process();

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[3].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[4].fn as sinon.SinonStub).calledOnce, true);
    });

    it(`2: should take actions from queue, reduce, and invoke
    its functions in appropriate order - without rebuild queued`, async () => {
      const queue = setups.process2();
      await actionProcessorAny.process();

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((queue[3].fn as sinon.SinonStub).calledOnce, true);
    });

    it("3: should onWillProcessing be emitted at the beginning of processing", async () => {
      const eventEmitter = setups.process3();
      await actionProcessorAny.process();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("4: should onDidProcessing be emitted in the end of processing", async () => {
      const eventEmitter = setups.process4();
      await actionProcessorAny.process();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it(`5: should onWillExecuteAction be emitted before execution
      of each action function`, async () => {
      const eventEmitter = setups.process5();
      await actionProcessorAny.process();

      assert.equal(eventEmitter.fire.calledTwice, true);
    });
  });

  describe("reduce", () => {
    it(`1: should reduceRebuilds, reduceUpdates,
      reduceRemoves methods be invoked`, () => {
      const [
        reduceRebuildsStub,
        reduceUpdatesStub,
        reduceRemovesStub,
      ] = setups.reduce1();

      actionProcessorAny.reduce();

      assert.equal(reduceRebuildsStub.calledOnce, true);
      assert.equal(reduceUpdatesStub.calledOnce, true);
      assert.equal(reduceRemovesStub.calledOnce, true);
    });
  });

  describe("reduceRebuilds", () => {
    it(`1: should reduceByActionType method be invoked
      with rebuild action type`, () => {
      const [reduceByActionTypeStub] = setups.reduceRebuilds1();
      actionProcessorAny.reduceRebuilds();

      assert.equal(reduceByActionTypeStub.calledWith(ActionType.Rebuild), true);
    });
  });

  describe("reduceUpdates", () => {
    it(`1: should reduceByActionType method be invoked
      with update action type`, () => {
      const [reduceByActionTypeStub] = setups.reduceUpdates1();
      actionProcessorAny.reduceUpdates();

      assert.equal(reduceByActionTypeStub.calledWith(ActionType.Update), true);
    });
  });

  describe("reduceRemoves", () => {
    it(`1: should reduceByActionType method be invoked
      with remove action type`, () => {
      const [reduceByActionTypeStub] = setups.reduceRemoves1();
      actionProcessorAny.reduceRemoves();

      assert.equal(reduceByActionTypeStub.calledWith(ActionType.Remove), true);
    });
  });

  describe("reduceByActionType", () => {
    it(`1: should reduce rebuild actions and return array with last
      rebuild action if previous action is different type than rebuild`, () => {
      const queue = setups.reduceByActionType1();
      actionProcessorAny.reduceByActionType(ActionType.Rebuild);

      assert.deepEqual(actionProcessorAny.queue, [queue[2]]);
    });

    it(`2: should reduce rebuild actions and return empty array
        if previous action is rebuild type`, () => {
      setups.reduceByActionType2();
      actionProcessorAny.reduceByActionType(ActionType.Rebuild);

      assert.deepEqual(actionProcessorAny.queue, []);
    });

    it(`3: should do nothing for rebuild action type if
        there is not any queued actions for this type`, () => {
      const queue = setups.reduceByActionType3();
      actionProcessorAny.reduceByActionType(ActionType.Rebuild);

      assert.deepEqual(actionProcessorAny.queue, queue);
    });

    it("4: should reduce update actions", () => {
      const queue = setups.reduceByActionType4();
      actionProcessorAny.reduceByActionType(ActionType.Update);

      assert.deepEqual(actionProcessorAny.queue, [queue[1], queue[2]]);
    });

    it("5: should reduce remove actions", () => {
      const queue = setups.reduceByActionType5();
      actionProcessorAny.reduceByActionType(ActionType.Remove);

      assert.deepEqual(actionProcessorAny.queue, [queue[1], queue[2]]);
    });
  });

  describe("reduceByFsPath", () => {
    it("1: should reduce queued actions for given type to the last for specific uri", () => {
      const { queue, uri } = setups.reduceByFsPath1();
      actionProcessorAny.reduceByFsPath(
        ActionType.Update,
        [queue[0], queue[2]],
        uri.fsPath
      );

      assert.deepEqual(actionProcessorAny.queue, [queue[1], queue[2]]);
    });

    it("2: should do nothing if actionsByFsPath array is empty", () => {
      const { queue, uri } = setups.reduceByFsPath2();
      actionProcessorAny.reduceByFsPath(ActionType.Update, [], uri.fsPath);

      assert.deepEqual(actionProcessorAny.queue, queue);
    });
  });

  describe("getActionsFromQueueByType", () => {
    it("1: should return array with queued actions only for given type", () => {
      const queue = setups.getActionsFromQueueByType1();
      assert.deepEqual(
        actionProcessorAny.getActionsFromQueueByType(ActionType.Rebuild),
        [queue[0], queue[2]]
      );
    });
  });
});
