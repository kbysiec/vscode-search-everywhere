import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import ActionProcessor from "../../actionProcessor";
import Action from "../../interface/action";
import {
  getAction,
  getActions,
  getEventEmitter,
  getUtilsStub,
} from "../util/mockFactory";
import ActionType from "../../enum/actionType";
import Utils from "../../utils";

describe("ActionProcessor", () => {
  let actionProcessor: ActionProcessor;
  let actionProcessorAny: any;
  let utilsStub: Utils;

  before(() => {
    utilsStub = getUtilsStub();
    actionProcessor = new ActionProcessor(utilsStub);
  });

  beforeEach(() => {
    actionProcessorAny = actionProcessor as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should action processor be initialized", () => {
      actionProcessor = new ActionProcessor(utilsStub);

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
    it(`should take actions from queue, reduce, and invoke
      its functions in appropriate order - with rebuild queued`, async () => {
      const uri = vscode.Uri.file("./test/#");
      const queue = [
        getAction(ActionType.Update, "test action 1", 1, true, uri),
        getAction(ActionType.Rebuild, "test action 2", 2),
        getAction(
          ActionType.Update,
          "test action 3",
          3,
          true,
          vscode.Uri.file("./#")
        ),
        getAction(ActionType.Update, "test action 4", 4, true, uri),
        getAction(ActionType.Rebuild, "test action 5", 5),
      ];
      sinon.stub(actionProcessorAny, "queue").value(queue);
      await actionProcessorAny.process();

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[3].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[4].fn as sinon.SinonStub).calledOnce, true);
    });

    it(`should take actions from queue, reduce, and invoke
      its functions in appropriate order - without rebuild queued`, async () => {
      const uri = vscode.Uri.file("./test/#");
      const queue = [
        getAction(ActionType.Update, "test action 1", 1, true, uri),
        getAction(
          ActionType.Remove,
          "test action 2",
          2,
          true,
          vscode.Uri.file("./test2/#")
        ),
        getAction(
          ActionType.Update,
          "test action 3",
          3,
          true,
          vscode.Uri.file("./#")
        ),
        getAction(ActionType.Update, "test action 4", 4, true, uri),
      ];
      sinon.stub(actionProcessorAny, "queue").value(queue);
      await actionProcessorAny.process();

      assert.equal((queue[0].fn as sinon.SinonStub).calledOnce, false);
      assert.equal((queue[1].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((queue[2].fn as sinon.SinonStub).calledOnce, true);
      assert.equal((queue[3].fn as sinon.SinonStub).calledOnce, true);
    });

    it("should onDidProcessing be emitted on the end of processing", async () => {
      const eventEmitter = getEventEmitter();
      sinon
        .stub(actionProcessorAny, "onDidProcessingEventEmitter")
        .value(eventEmitter);
      sinon
        .stub(actionProcessorAny, "queue")
        .value(getActions(2, undefined, ActionType.Rebuild));
      await actionProcessorAny.process();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("reduce", () => {
    it(`should reduceRebuilds, reduceUpdates,
      reduceRemoves methods be invoked`, () => {
      const reduceRebuildsStub = sinon.stub(
        actionProcessorAny,
        "reduceRebuilds"
      );
      const reduceUpdatesStub = sinon.stub(actionProcessorAny, "reduceUpdates");
      const reduceRemovesStub = sinon.stub(actionProcessorAny, "reduceRemoves");

      actionProcessorAny.reduce();

      assert.equal(reduceRebuildsStub.calledOnce, true);
      assert.equal(reduceUpdatesStub.calledOnce, true);
      assert.equal(reduceRemovesStub.calledOnce, true);
    });
  });

  describe("reduceRebuilds", () => {
    it(`should reduceByActionType method be invoked
      with rebuild action type`, () => {
      const reduceByActionTypeStub = sinon.stub(
        actionProcessorAny,
        "reduceByActionType"
      );
      actionProcessorAny.reduceRebuilds();

      assert.equal(reduceByActionTypeStub.calledWith(ActionType.Rebuild), true);
    });
  });

  describe("reduceUpdates", () => {
    it(`should reduceByActionType method be invoked
      with update action type`, () => {
      const reduceByActionTypeStub = sinon.stub(
        actionProcessorAny,
        "reduceByActionType"
      );
      actionProcessorAny.reduceUpdates();

      assert.equal(reduceByActionTypeStub.calledWith(ActionType.Update), true);
    });
  });

  describe("reduceRemoves", () => {
    it(`should reduceByActionType method be invoked
      with remove action type`, () => {
      const reduceByActionTypeStub = sinon.stub(
        actionProcessorAny,
        "reduceByActionType"
      );
      actionProcessorAny.reduceRemoves();

      assert.equal(reduceByActionTypeStub.calledWith(ActionType.Remove), true);
    });
  });

  describe("reduceByActionType", () => {
    it("should reduce rebuild actions", () => {
      const queue = getActions(3, undefined, ActionType.Rebuild);
      sinon.stub(actionProcessorAny, "queue").value(queue);
      actionProcessorAny.reduceByActionType(ActionType.Rebuild);

      assert.deepEqual(actionProcessorAny.queue, [queue[2]]);
    });

    it(`should do nothing for rebuild action type if
      there is not any queued actions for this type`, () => {
      const queue = getActions(3, undefined, ActionType.Update);
      sinon.stub(actionProcessorAny, "queue").value(queue);
      actionProcessorAny.reduceByActionType(ActionType.Rebuild);

      assert.deepEqual(actionProcessorAny.queue, queue);
    });

    it("should reduce update actions", () => {
      const uri = vscode.Uri.file("./test/#");
      const queue = [
        getAction(ActionType.Update, "test action 1", 1, true, uri),
        getAction(
          ActionType.Update,
          "test action 2",
          2,
          true,
          vscode.Uri.file("./#")
        ),
        getAction(ActionType.Update, "test action 3", 3, true, uri),
      ];
      sinon.stub(actionProcessorAny, "queue").value(queue);
      actionProcessorAny.reduceByActionType(ActionType.Update);

      assert.deepEqual(actionProcessorAny.queue, [queue[1], queue[2]]);
    });

    it("should reduce remove actions", () => {
      const uri = vscode.Uri.file("./test/#");
      const queue = [
        getAction(ActionType.Remove, "test action 1", 1, true, uri),
        getAction(
          ActionType.Remove,
          "test action 2",
          2,
          true,
          vscode.Uri.file("./#")
        ),
        getAction(ActionType.Remove, "test action 3", 3, true, uri),
      ];
      sinon.stub(actionProcessorAny, "queue").value(queue);
      actionProcessorAny.reduceByActionType(ActionType.Remove);

      assert.deepEqual(actionProcessorAny.queue, [queue[1], queue[2]]);
    });
  });

  describe("reduceByFsPath", () => {
    it("should reduce queued actions for given type to the last for specific uri", () => {
      const uri = vscode.Uri.file("./test/#");
      const queue = [
        getAction(ActionType.Update, "test action 1", 1, true, uri),
        getAction(
          ActionType.Update,
          "test action 2",
          2,
          true,
          vscode.Uri.file("./#")
        ),
        getAction(ActionType.Update, "test action 3", 3, true, uri),
      ];
      const actionsByFsPath = [queue[0], queue[2]];

      sinon.stub(actionProcessorAny, "queue").value(queue);

      actionProcessorAny.reduceByFsPath(
        ActionType.Update,
        actionsByFsPath,
        uri.fsPath
      );

      assert.deepEqual(actionProcessorAny.queue, [queue[1], queue[2]]);
    });

    it("should do nothing if actionsByFsPath array is empty", () => {
      const uri = vscode.Uri.file("./test/#");
      const queue = [
        getAction(ActionType.Update, "test action 1", 1, true, uri),
        getAction(
          ActionType.Update,
          "test action 2",
          2,
          true,
          vscode.Uri.file("./#")
        ),
        getAction(ActionType.Update, "test action 3", 3, true, uri),
      ];
      const actionsByUri: Action[] = [];

      sinon.stub(actionProcessorAny, "queue").value(queue);

      actionProcessorAny.reduceByFsPath(
        ActionType.Update,
        actionsByUri,
        uri.fsPath
      );

      assert.deepEqual(actionProcessorAny.queue, queue);
    });
  });

  describe("getActionsFromQueueByType", () => {
    it("should return array with queued actions only for given type", () => {
      const queue = [
        getAction(ActionType.Rebuild, "test action 1", 1),
        getAction(ActionType.Remove, "test action 2", 2),
        getAction(ActionType.Rebuild, "test action 3", 3),
      ];
      sinon.stub(actionProcessorAny, "queue").value(queue);

      assert.deepEqual(
        actionProcessorAny.getActionsFromQueueByType(ActionType.Rebuild),
        [queue[0], queue[2]]
      );
    });
  });
});
