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
    register4: () => {
      const uri = vscode.Uri.file("./test/#");
      const action = getAction(ActionType.Rebuild, "test action 5", undefined);
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
          object: actionProcessorAny,
          method: "actionId",
          returns: 5,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "isBusy",
          returns: false,
          isNotMethod: true,
        },
      ]);

      return {
        action,
        queue,
      };
    },
    register5: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const uri = vscode.Uri.file("./test/#");
      const action = getAction(
        ActionType.Update,
        "test action 4",
        undefined,
        true,
        uri
      );
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
      ];

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "actionId",
          returns: 4,
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "isBusy",
          returns: false,
          isNotMethod: true,
        },
      ]);

      return { action, queue };
    },
    register6: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const eventEmitter = getEventEmitter();
      const action = getAction(ActionType.Rebuild);

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: getActions(1, undefined, ActionType.Rebuild),
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "onWillProcessingEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);

      return { action, eventEmitter };
    },
    register7: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const eventEmitter = getEventEmitter();
      const action = getAction(ActionType.Rebuild);

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: getActions(1, undefined, ActionType.Rebuild),
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "onDidProcessingEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);
      return { action, eventEmitter };
    },
    register8: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const eventEmitter = getEventEmitter();
      const uri = vscode.Uri.file("./test/#");
      const action = getAction(
        ActionType.Update,
        "test action 2",
        3,
        true,
        uri
      );

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: getActions(1, undefined, ActionType.Update, undefined, true),
          isNotMethod: true,
        },
        {
          object: actionProcessorAny,
          method: "onWillExecuteActionEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);
      return { action, eventEmitter };
    },
    register9: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const action = getAction(ActionType.Rebuild);
      const queue = getActions(2, undefined, ActionType.Rebuild);

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
          returnsIsUndefined: true,
        },
      ]);
      return { action, queue };
    },
    register10: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const action = getAction(ActionType.Rebuild);
      const queue = getActions(2, undefined, ActionType.Rebuild);

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
          returns: getAction(ActionType.Rebuild),
          isNotMethod: true,
        },
      ]);

      return { action, queue };
    },
    register11: () => {
      restoreStubbedMultiple([
        { object: actionProcessorAny.utils, method: "getLastFromArray" },
        { object: actionProcessorAny.utils, method: "groupBy" },
      ]);

      const uri = vscode.Uri.file("./test/#");
      const action = getAction(
        ActionType.Update,
        "test action 3",
        3,
        true,
        uri
      );

      const queue = [
        getAction(ActionType.Update, "test action 1", 1, true, uri),
        getAction(
          ActionType.Update,
          "test action 2",
          2,
          true,
          vscode.Uri.file("./#")
        ),
      ];

      stubMultiple([
        {
          object: actionProcessorAny,
          method: "queue",
          returns: queue,
          isNotMethod: true,
        },
      ]);
      return { action, queue };
    },
  };
};
