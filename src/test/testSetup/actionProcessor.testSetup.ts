import * as sinon from "sinon";
import * as vscode from "vscode";
import { actionProcessor } from "../../actionProcessor";
import * as actionProcessorEventsEmitter from "../../actionProcessorEventsEmitter";
import { Action, ActionType } from "../../types";
import { utils } from "../../utils";
import { getAction, getActions, getEventEmitter } from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },
    register1: () => {
      return stubMultiple(
        [
          {
            object: actionProcessor,
            method: "add",
          },
        ],
        sandbox
      );
    },
    register2: () => {
      return stubMultiple(
        [
          {
            object: actionProcessor,
            method: "process",
          },
        ],
        sandbox
      );
    },
    register3: () => {
      return stubMultiple(
        [
          {
            object: actionProcessor,
            method: "process",
          },
          {
            object: actionProcessor,
            method: "getIsBusy",
            returns: true,
          },
        ],
        sandbox
      );
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

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "getPreviousAction",
            returns: undefined,
          },
          {
            object: actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          {
            object: utils,
            method: "getLastFromArray",
            returns: action,
          },
          {
            object: utils,
            method: "groupBy",
            returns: new Map<string, Action[]>(),
          },
        ],
        sandbox
      );

      return {
        action,
        queue,
      };
    },
    register5: () => {
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
          vscode.Uri.file("./test3/#")
        ),
      ];

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
        ],
        sandbox
      );

      return { action, queue };
    },
    register6: () => {
      const eventEmitter = getEventEmitter();
      const action = getAction(ActionType.Rebuild);
      const queue = getActions(1, undefined, ActionType.Rebuild);
      const groupedActions = new Map<string, Action[]>();
      groupedActions.set(ActionType.Update, queue);

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          {
            object: actionProcessorEventsEmitter,
            method: "onWillProcessingEventEmitter",
            returns: eventEmitter,
            isNotMethod: true,
          },
          {
            object: utils,
            method: "groupBy",
            returns: groupedActions,
          },
        ],
        sandbox
      );

      return { action, eventEmitter };
    },
    register7: () => {
      const eventEmitter = getEventEmitter();
      const action = getAction(ActionType.Rebuild);
      const queue = getActions(1, undefined, ActionType.Rebuild);
      const groupedActions = new Map<string, Action[]>();
      groupedActions.set(ActionType.Update, queue);

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          {
            object: actionProcessorEventsEmitter,
            method: "onDidProcessingEventEmitter",
            returns: eventEmitter,
            isNotMethod: true,
          },
          {
            object: utils,
            method: "groupBy",
            returns: groupedActions,
          },
        ],
        sandbox
      );
      return { action, eventEmitter };
    },
    register8: () => {
      const eventEmitter = getEventEmitter();
      const uri = vscode.Uri.file("./test/#");
      const action = getAction(
        ActionType.Update,
        "test action 2",
        3,
        true,
        uri
      );

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "queue",
            returns: getActions(
              1,
              undefined,
              ActionType.Update,
              undefined,
              true
            ),
            isNotMethod: true,
          },
          {
            object: actionProcessorEventsEmitter,
            method: "onWillExecuteActionEventEmitter",
            returns: eventEmitter,
            isNotMethod: true,
          },
        ],
        sandbox
      );
      return { action, eventEmitter };
    },
    register9: () => {
      const action = getAction(ActionType.Rebuild);
      const queue = getActions(2, undefined, ActionType.Rebuild);
      const groupedActions = new Map<string, Action[]>();
      groupedActions.set(ActionType.Rebuild, queue);

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          {
            object: actionProcessor,
            method: "getPreviousAction",
            returns: undefined,
            returnsIsUndefined: true,
          },
          {
            object: utils,
            method: "groupBy",
            returns: groupedActions,
          },
        ],
        sandbox
      );
      return { action, queue };
    },
    register10: () => {
      const action = getAction(ActionType.Rebuild);
      const queue = getActions(2, undefined, ActionType.Rebuild);
      const groupedActions = new Map<string, Action[]>();
      groupedActions.set(ActionType.Rebuild, queue);

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          {
            object: actionProcessor,
            method: "getPreviousAction",
            returns: getAction(ActionType.Rebuild),
          },
          {
            object: utils,
            method: "groupBy",
            returns: groupedActions,
          },
        ],
        sandbox
      );

      return { action, queue };
    },
    register11: () => {
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

      stubMultiple(
        [
          {
            object: actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
        ],
        sandbox
      );
      return { action, queue };
    },
  };
};
