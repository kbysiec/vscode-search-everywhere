"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const logger_1 = require("../../src/logger");
const utils_1 = require("../../src/utils");
const mockFactory_1 = require("../util/mockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    const now = new Date("2022-01-01");
    const outputChannelInner = vscode.window.createOutputChannel("Search everywhere");
    return {
        beforeEach: () => {
            (0, stubHelpers_1.stubMultiple)([
                {
                    object: logger_1.logger,
                    method: "getChannel",
                    returns: outputChannelInner,
                },
            ], sandbox);
        },
        afterEach: () => {
            sandbox.restore();
        },
        init: {
            setupForCreatingOutputChannel: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.window,
                        method: "createOutputChannel",
                    },
                ], sandbox);
            },
        },
        log: {
            setupForLoggingMessageWithTimestamp: () => {
                const fakeTimer = sandbox.useFakeTimers(now);
                const timestamp = new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
                const expectedMessage = `[${timestamp}] test message`;
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: outputChannelInner,
                        method: "appendLine",
                    },
                ], sandbox);
                return { stubs, expectedMessage, fakeTimer };
            },
        },
        logAction: {
            setupForLoggingExecutedAction: () => {
                const fakeTimer = sandbox.useFakeTimers(now);
                const timestamp = new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
                const action = (0, mockFactory_1.getAction)(undefined, undefined, undefined, true);
                const expectedMessage = `[${timestamp}] Execute action - type: ${action.type} | fn: ${action.fn.name} | trigger: ${action.trigger} | uri: ${action.uri}`;
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: outputChannelInner,
                        method: "appendLine",
                    },
                ], sandbox);
                return { stubs, expectedMessage, fakeTimer, action };
            },
        },
        logScanTime: {
            setupForLoggingScanTimeWithStats: () => {
                const fakeTimer = sandbox.useFakeTimers(now);
                const timestamp = new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
                const indexStats = (0, mockFactory_1.getIndexStats)();
                const expectedMessage = `[${timestamp}] Workspace scan completed - elapsed time: ${indexStats.ElapsedTimeInSeconds}s | scanned files: ${indexStats.ScannedUrisCount} | indexed items: ${indexStats.IndexedItemsCount}`;
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: outputChannelInner,
                        method: "appendLine",
                    },
                ], sandbox);
                return { stubs, expectedMessage, fakeTimer, indexStats };
            },
        },
        logStructure: {
            setupForLoggingWorkspaceStructure: () => {
                const fakeTimer = sandbox.useFakeTimers(now);
                const timestamp = new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
                const workspaceDataItems = [
                    {
                        uri: vscode.Uri.file("/fake/fake-1.ts"),
                        get elements() {
                            return [
                                this.uri,
                                {
                                    name: "fake-1.ts§&§test name",
                                    detail: "test details",
                                    kind: 1,
                                    range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(3, 0)),
                                    selectionRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(3, 0)),
                                    children: [],
                                },
                                {
                                    name: "fake-1.ts§&§test name 2",
                                    detail: "test details 2",
                                    kind: 1,
                                    range: new vscode.Range(new vscode.Position(4, 0), new vscode.Position(5, 0)),
                                    selectionRange: new vscode.Range(new vscode.Position(4, 0), new vscode.Position(5, 0)),
                                    children: [],
                                },
                                {
                                    name: "test name 3",
                                    detail: "test details 3",
                                    kind: 1,
                                    range: new vscode.Range(new vscode.Position(9, 0), new vscode.Position(9, 0)),
                                    selectionRange: new vscode.Range(new vscode.Position(9, 0), new vscode.Position(9, 0)),
                                    children: [],
                                },
                            ];
                        },
                    },
                    {
                        uri: vscode.Uri.file("/fake-other/fake-2.ts"),
                        get elements() {
                            return [this.uri];
                        },
                    },
                    {
                        uri: vscode.Uri.file("/fake-another/fake-3.ts"),
                        get elements() {
                            return [];
                        },
                    },
                ];
                const workspaceData = (0, mockFactory_1.getWorkspaceData)(workspaceDataItems);
                const structure = `{
  "fake": {
    "fake-1.ts": "4 items"
  },
  "fake-other": {
    "fake-2.ts": "1 item"
  },
  "fake-another": {
    "fake-3.ts": "0 items"
  }
}`.replaceAll(" ", "");
                const expectedMessage = `[${timestamp}] Scanned files:
  ${structure}`;
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: outputChannelInner,
                        method: "appendLine",
                    },
                    {
                        object: utils_1.utils,
                        method: "getStructure",
                        returns: structure,
                    },
                ], sandbox);
                return { stubs, expectedMessage, fakeTimer, workspaceData };
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=logger.testSetup.js.map