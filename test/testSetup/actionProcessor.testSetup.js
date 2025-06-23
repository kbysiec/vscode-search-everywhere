"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const actionProcessor_1 = require("../../src/actionProcessor");
const actionProcessorEventsEmitter = require("../../src/actionProcessorEventsEmitter");
const types_1 = require("../../src/types");
const utils_1 = require("../../src/utils");
const mockFactory_1 = require("../util/mockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        register: {
            setupForAddingActionToQueue: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "add",
                    },
                ], sandbox);
            },
            setupForProcessingWhenNotBusy: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "process",
                    },
                ], sandbox);
            },
            setupForProcessingWhenBusy: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "process",
                    },
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "getIsBusy",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForQueueProcessingWithRebuildQueued: () => {
                const uri = vscode.Uri.file("./test/#");
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 5", undefined);
                const queue = [
                    (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 1", 1, true, uri),
                    (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 2", 2),
                    (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 3", 3, true, vscode.Uri.file("./#")),
                    (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 4", 4, true, uri),
                ];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "getPreviousAction",
                        returns: undefined,
                    },
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "queue",
                        returns: queue,
                        isNotMethod: true,
                    },
                    {
                        object: utils_1.utils,
                        method: "getLastFromArray",
                        returns: action,
                    },
                    {
                        object: utils_1.utils,
                        method: "groupBy",
                        returns: new Map(),
                    },
                ], sandbox);
                return {
                    action,
                    queue,
                };
            },
            setupForQueueProcessingWithoutRebuildQueued: () => {
                const uri = vscode.Uri.file("./test/#");
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 4", undefined, true, uri);
                const queue = [
                    (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 1", 1, true, uri),
                    (0, mockFactory_1.getAction)(types_1.ActionType.Remove, "test action 2", 2, true, vscode.Uri.file("./test2/#")),
                    (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 3", 3, true, vscode.Uri.file("./test3/#")),
                ];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "queue",
                        returns: queue,
                        isNotMethod: true,
                    },
                ], sandbox);
                return { action, queue };
            },
            setupForWillProcessingEventEmission: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild);
                const queue = (0, mockFactory_1.getActions)(1, undefined, types_1.ActionType.Rebuild);
                const groupedActions = new Map();
                groupedActions.set(types_1.ActionType.Update, queue);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
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
                        object: utils_1.utils,
                        method: "groupBy",
                        returns: groupedActions,
                    },
                ], sandbox);
                return { action, eventEmitter };
            },
            setupForDidProcessingEventEmission: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild);
                const queue = (0, mockFactory_1.getActions)(1, undefined, types_1.ActionType.Rebuild);
                const groupedActions = new Map();
                groupedActions.set(types_1.ActionType.Update, queue);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
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
                        object: utils_1.utils,
                        method: "groupBy",
                        returns: groupedActions,
                    },
                ], sandbox);
                return { action, eventEmitter };
            },
            setupForWillExecuteActionEventEmission: () => {
                const eventEmitter = (0, mockFactory_1.getEventEmitter)();
                const uri = vscode.Uri.file("./test/#");
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 2", 3, true, uri);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "queue",
                        returns: (0, mockFactory_1.getActions)(1, undefined, types_1.ActionType.Update, undefined, true),
                        isNotMethod: true,
                    },
                    {
                        object: actionProcessorEventsEmitter,
                        method: "onWillExecuteActionEventEmitter",
                        returns: eventEmitter,
                        isNotMethod: true,
                    },
                ], sandbox);
                return { action, eventEmitter };
            },
            setupForRebuildActionReductionWithDifferentPreviousAction: () => {
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild);
                const queue = (0, mockFactory_1.getActions)(2, undefined, types_1.ActionType.Rebuild);
                const groupedActions = new Map();
                groupedActions.set(types_1.ActionType.Rebuild, queue);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "queue",
                        returns: queue,
                        isNotMethod: true,
                    },
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "getPreviousAction",
                        returns: undefined,
                        returnsIsUndefined: true,
                    },
                    {
                        object: utils_1.utils,
                        method: "groupBy",
                        returns: groupedActions,
                    },
                ], sandbox);
                return { action, queue };
            },
            setupForRebuildActionReductionWithRebuildPreviousAction: () => {
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild);
                const queue = (0, mockFactory_1.getActions)(2, undefined, types_1.ActionType.Rebuild);
                const groupedActions = new Map();
                groupedActions.set(types_1.ActionType.Rebuild, queue);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "queue",
                        returns: queue,
                        isNotMethod: true,
                    },
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "getPreviousAction",
                        returns: (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild),
                    },
                    {
                        object: utils_1.utils,
                        method: "groupBy",
                        returns: groupedActions,
                    },
                ], sandbox);
                return { action, queue };
            },
            setupForNonRebuildActionReduction: () => {
                const uri = vscode.Uri.file("./test/#");
                const action = (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 3", 3, true, uri);
                const queue = [
                    (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 1", 1, true, uri),
                    (0, mockFactory_1.getAction)(types_1.ActionType.Update, "test action 2", 2, true, vscode.Uri.file("./#")),
                ];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: actionProcessor_1.actionProcessor,
                        method: "queue",
                        returns: queue,
                        isNotMethod: true,
                    },
                ], sandbox);
                return { action, queue };
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=actionProcessor.testSetup.js.map