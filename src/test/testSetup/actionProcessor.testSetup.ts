import * as sinon from "sinon";
import * as vscode from "vscode";
import * as actionProcessorModule from "../../actionProcessor";
import ActionType from "../../enum/actionType";
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
            object: actionProcessorModule.actionProcessor,
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
            object: actionProcessorModule.actionProcessor,
            method: "process",
          },
          // {
          //   object: ap.actionProcessor,
          //   method: "isBusy",
          //   returns: false,
          //   isNotMethod: true,
          // },
        ],
        sandbox
      );
    },
    register3: () => {
      return stubMultiple(
        [
          {
            object: actionProcessorModule.actionProcessor,
            method: "process",
          },
          {
            object: actionProcessorModule.actionProcessor,
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

      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

      stubMultiple(
        [
          {
            object: actionProcessorModule.actionProcessor,
            method: "getPreviousAction",
            returns: undefined,
          },
          {
            object: actionProcessorModule.actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          // {
          //   object: ap,
          //   method: "getActionId",
          //   returns: 5,
          // },
          // {
          //   object: ap.actionProcessor,
          //   method: "isBusy",
          //   returns: false,
          //   isNotMethod: true,
          // },
        ],
        sandbox
      );

      return {
        action,
        queue,
      };
    },
    register5: () => {
      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

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
            object: actionProcessorModule.actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          // {
          //   object: ap,
          //   method: "getActionId",
          //   returns: 3,
          // },
          // {
          //   object: ap.actionProcessor,
          //   method: "isBusy",
          //   returns: false,
          //   isNotMethod: true,
          // },
        ],
        sandbox
      );

      return { action, queue };
    },
    register6: () => {
      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

      const eventEmitter = getEventEmitter();
      const action = getAction(ActionType.Rebuild);

      stubMultiple(
        [
          {
            object: actionProcessorModule.actionProcessor,
            method: "queue",
            returns: getActions(1, undefined, ActionType.Rebuild),
            isNotMethod: true,
          },
          {
            object: actionProcessorModule,
            method: "onWillProcessingEventEmitter",
            returns: eventEmitter,
            isNotMethod: true,
          },
        ],
        sandbox
      );

      return { action, eventEmitter };
    },
    register7: () => {
      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

      const eventEmitter = getEventEmitter();
      const action = getAction(ActionType.Rebuild);

      stubMultiple(
        [
          {
            object: actionProcessorModule.actionProcessor,
            method: "queue",
            returns: getActions(1, undefined, ActionType.Rebuild),
            isNotMethod: true,
          },
          {
            object: actionProcessorModule,
            method: "onDidProcessingEventEmitter",
            returns: eventEmitter,
            isNotMethod: true,
          },
        ],
        sandbox
      );
      return { action, eventEmitter };
    },
    register8: () => {
      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

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
            object: actionProcessorModule.actionProcessor,
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
            object: actionProcessorModule,
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
      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

      const action = getAction(ActionType.Rebuild);
      const queue = getActions(2, undefined, ActionType.Rebuild);

      stubMultiple(
        [
          {
            object: actionProcessorModule.actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          {
            object: actionProcessorModule.actionProcessor,
            method: "getPreviousAction",
            returns: undefined,
            returnsIsUndefined: true,
          },
        ],
        sandbox
      );
      return { action, queue };
    },
    register10: () => {
      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

      const action = getAction(ActionType.Rebuild);
      const queue = getActions(2, undefined, ActionType.Rebuild);

      stubMultiple(
        [
          {
            object: actionProcessorModule.actionProcessor,
            method: "queue",
            returns: queue,
            isNotMethod: true,
          },
          {
            object: actionProcessorModule.actionProcessor,
            method: "getPreviousAction",
            returns: getAction(ActionType.Rebuild),
          },
        ],
        sandbox
      );

      return { action, queue };
    },
    register11: () => {
      // restoreStubbedMultiple([
      //   { object: utils, method: "getLastFromArray" },
      //   { object: utils, method: "groupBy" },
      // ], sandbox);

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
            object: actionProcessorModule.actionProcessor,
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
