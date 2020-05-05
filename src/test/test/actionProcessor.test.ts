import { assert } from "chai";
import * as sinon from "sinon";
import ActionProcessor from "../../actionProcessor";
import Action from "../../interface/action";
import { getAction, getActions, getEventEmitter } from "../util/mockFactory";
import ActionType from "../../enum/actionType";

describe("ActionProcessor", () => {
  let actionProcessor: ActionProcessor;
  let actionProcessorAny: any;

  before(() => {
    actionProcessor = new ActionProcessor();
  });

  beforeEach(() => {
    actionProcessorAny = actionProcessor as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should action processor be initialized", () => {
      actionProcessor = new ActionProcessor();

      assert.exists(actionProcessor);
    });
  });

  describe("register", () => {
    it("should add method be invoked", async () => {
      const addStub = sinon.stub(actionProcessorAny, "add");
      await actionProcessorAny.register(getAction());

      assert.equal(addStub.calledOnce, true);
    });

    it("should process method be invoked if action processor is not busy", async () => {
      sinon.stub(actionProcessorAny, "isBusy").value(false);
      const processStub = sinon.stub(actionProcessorAny, "process");
      await actionProcessor.register(getAction());

      assert.equal(processStub.calledOnce, true);
    });

    it("should not process method be invoked if action processor is busy", async () => {
      sinon.stub(actionProcessorAny, "isBusy").value(true);
      const processStub = sinon.stub(actionProcessorAny, "process");
      await actionProcessor.register(getAction());

      assert.equal(processStub.calledOnce, false);
    });
  });

  describe("add", () => {
    it("should add action to queue", () => {
      const action = getAction(ActionType.Rebuild);
      const queue: Action[] = [];
      sinon.stub(actionProcessorAny, "queue").value(queue);
      actionProcessorAny.add(action);

      assert.equal(queue.length, 1);
      assert.deepEqual(queue[0], action);
    });
  });

  describe("process", () => {
    it(`should take actions from queue and invoke its functions
      in appropriate order`, async () => {
      const action = getAction(ActionType.Rebuild);
      const queue = getActions(2, action);
      sinon.stub(actionProcessorAny, "queue").value(queue);
      await actionProcessorAny.process();

      assert.deepEqual((action.fn as sinon.SinonStub).calledTwice, true);
    });

    it("should onDidProcessing be emitted on the end of processing", async () => {
      const eventEmitter = getEventEmitter();
      sinon
        .stub(actionProcessorAny, "onDidProcessingEventEmitter")
        .value(eventEmitter);
      sinon.stub(actionProcessorAny, "queue").value(getActions());
      await actionProcessorAny.process();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });
});
