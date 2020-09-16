import * as vscode from "vscode";
import ActionProcessor from "../../actionProcessor";
import ActionType from "../../enum/actionType";
import Action from "../../interface/action";
import { getAction, getEventEmitter, getActions } from "../util/mockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (actionProcessor: ActionProcessor) => {
  const actionProcessorAny = actionProcessor as any;
  return {
    register1: () => {
      return stubMultiple([
        {
          object: actionProcessorAny,
          method: "add",
        },
      ]);
    },
    register2: () => {
      return stubMultiple([
        {
          object: actionProcessorAny,
          method: "process",
        },
        {
          object: actionProcessorAny,
          method: "isBusy",
          returns: false,
          isNotMethod: true,
        },
      ]);
    },
    register3: () => {
      return stubMultiple([
        {
          object: actionProcessorAny,
          method: "process",
        },
        {
          object: actionProcessorAny,
          method: "isBusy",
          returns: true,
          isNotMethod: true,
        },
      ]);
    },
    add1: () => {
      const action = getAction(ActionType.Rebuild);
      const queue: Action[] = [];

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
      ]);

      return {
        action: action,
        queue: queue,
      };

      // return {
      //   stubs,
      //   other,
      // } as StubMultipleOutput<typeof other>;
    },
    process1: () => {
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

      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "previousAction",
          returns: undefined,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          returns: queue[4],
        },
        {
          object: actionProcessorAny.utils,
          method: "groupBy",
          returns: new Map<string, Action[]>(),
        },
      ]);

      return queue;
    },
    process2: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

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

      const groupedActions = new Map<string, Action[]>();
      groupedActions.set(uri.fsPath, [queue[0], queue[3]]);

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          returns: queue[3],
        },
        {
          object: actionProcessorAny.utils,
          method: "groupBy",
          returns: groupedActions,
        },
      ]);

      return queue;
    },
    process3: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const eventEmitter = getEventEmitter();

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: getActions(2, undefined, ActionType.Rebuild),
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          returns: getAction(),
        },
        {
          object: actionProcessorAny.utils,
          method: "groupBy",
          returns: new Map<string, Action[]>(),
        },
        {
          object: actionProcessorAny,
          method: "onWillProcessingEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);

      return eventEmitter;
    },
    process4: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const eventEmitter = getEventEmitter();

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: getActions(2, undefined, ActionType.Rebuild),
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          returns: getAction(),
        },
        {
          object: actionProcessorAny.utils,
          method: "groupBy",
          returns: new Map<string, Action[]>(),
        },
        {
          object: actionProcessorAny,
          method: "onDidProcessingEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);
      return eventEmitter;
    },
    process5: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const eventEmitter = getEventEmitter();

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: getActions(2, undefined, ActionType.Update, undefined, true),
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          returns: getAction(),
        },
        {
          object: actionProcessorAny.utils,
          method: "groupBy",
          returns: new Map<string, Action[]>(),
        },
        {
          object: actionProcessorAny,
          method: "onWillExecuteActionEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);
      return eventEmitter;
    },
    reduce1: () => {
      return stubMultiple([
        {
          object: actionProcessorAny,
          method: "reduceRebuilds",
        },
        {
          object: actionProcessorAny,
          method: "reduceUpdates",
        },
        {
          object: actionProcessorAny,
          method: "reduceRemoves",
        },
      ]);
    },
    reduceRebuilds1: () => {
      return stubMultiple([
        {
          object: actionProcessorAny,
          method: "reduceByActionType",
        },
      ]);
    },
    reduceUpdates1: () => {
      return stubMultiple([
        {
          object: actionProcessorAny,
          method: "reduceByActionType",
        },
      ]);
    },
    reduceRemoves1: () => {
      return stubMultiple([
        {
          object: actionProcessorAny,
          method: "reduceByActionType",
        },
      ]);
    },
    reduceByActionType1: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
      ]);

      const queue = [...getActions(3, undefined, ActionType.Rebuild)];

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "previousAction",
          returns: undefined,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          returns: queue[2],
        },
      ]);
      return queue;
    },
    reduceByActionType2: () => {
      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: getActions(3, undefined, ActionType.Rebuild),
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "previousAction",
          returns: getAction(ActionType.Rebuild),
          isNotMethod: true,
        },
      ]);
    },
    reduceByActionType3: () => {
      const queue = getActions(3, undefined, ActionType.Update);

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
      ]);
      return queue;
    },
    reduceByActionType4: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

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
      const groupedActions = new Map<string, Action[]>();
      groupedActions.set(uri.fsPath, [queue[0], queue[2]]);
      groupedActions.set(vscode.Uri.file("./#").fsPath, [queue[1]]);

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          customReturns: true,
          returns: [
            {
              onCall: 0,
              returns: queue[2],
            },
            {
              onCall: 1,
              returns: queue[1],
            },
          ],
        },
        {
          object: actionProcessorAny.utils,
          method: "groupBy",
          returns: groupedActions,
        },
        {
          object: actionProcessorAny,
          method: "getActionsFromQueueByType",
          customReturns: true,
          returns: [
            {
              withArgs: ActionType.Rebuild,
              returns: [],
            },
          ],
        },
      ]);
      return queue;
    },
    reduceByActionType5: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

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
      const groupedActions = new Map<string, Action[]>();
      groupedActions.set(uri.fsPath, [queue[0], queue[2]]);
      groupedActions.set(vscode.Uri.file("./#").fsPath, [queue[1]]);

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny.utils,
          method: "getLastFromArray",
          customReturns: true,
          returns: [
            {
              onCall: 0,
              returns: queue[2],
            },
            {
              onCall: 1,
              returns: queue[1],
            },
          ],
        },
        {
          object: actionProcessorAny,
          method: "getActionsFromQueueByType",
          customReturns: true,
          returns: [
            {
              withArgs: ActionType.Rebuild,
              returns: [],
            },
            {
              withArgs: ActionType.Remove,
              returns: queue,
            },
          ],
        },
      ]);
      return queue;
    },
    reduceByFsPath1: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
      ]);

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

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
      ]);
      return { queue, uri };
    },
    reduceByFsPath2: () => {
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

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
      ]);
      return { queue, uri };
    },
    getActionsFromQueueByType1: () => {
      const queue = [
        getAction(ActionType.Rebuild, "test action 1", 1),
        getAction(ActionType.Remove, "test action 2", 2),
        getAction(ActionType.Rebuild, "test action 3", 3),
      ];

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
      ]);
      return queue;
    },
  };
};
