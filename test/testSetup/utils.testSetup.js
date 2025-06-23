"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const utils_1 = require("../../src/utils");
const itemMockFactory_1 = require("../util/itemMockFactory");
const mockFactory_1 = require("../util/mockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    const stubWorkspaceFolders = (paths) => {
        let index = 0;
        const workspaceFolders = paths
            ? paths.map((path) => ({
                index: index++,
                name: path,
                uri: vscode.Uri.file(path),
            }))
            : undefined;
        (0, stubHelpers_1.stubMultiple)([
            {
                object: vscode.workspace,
                method: "workspaceFolders",
                returns: workspaceFolders,
                isNotMethod: true,
            },
        ], sandbox);
    };
    return {
        afterEach: () => {
            sandbox.restore();
        },
        hasWorkspaceAnyFolder: {
            setupForReturningTrueWhenWorkspaceHasFolders: () => {
                stubWorkspaceFolders(["/#"]);
            },
            setupForReturningFalseWhenWorkspaceHasNoFolders: () => {
                stubWorkspaceFolders([]);
            },
        },
        hasWorkspaceMoreThanOneFolder: {
            setupForReturningTrueWhenWorkspaceHasMultipleFolders: () => {
                stubWorkspaceFolders(["/#", "/test/#"]);
            },
            setupForReturningFalseWhenWorkspaceHasOneOrNoFolders: () => {
                stubWorkspaceFolders(["/#"]);
            },
        },
        printNoFolderOpenedMessage: {
            setupForDisplayingNotification: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.window,
                        method: "showInformationMessage",
                    },
                ], sandbox);
            },
        },
        printErrorMessage: {
            setupForDisplayingNotification: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.window,
                        method: "showInformationMessage",
                    },
                ], sandbox);
            },
        },
        printStatsMessage: {
            setupForDisplayingStatsNotification: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.window,
                        method: "showInformationMessage",
                    },
                ], sandbox);
            },
        },
        clearWorkspaceData: {
            setupForClearingWorkspaceDataObject: () => {
                const workspaceDataItems = [
                    {
                        uri: vscode.Uri.file("/./fake/fake-1.ts"),
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
                            ];
                        },
                    },
                ];
                return (0, mockFactory_1.getWorkspaceData)(workspaceDataItems);
            },
        },
        sleepAndExecute: {
            setupForInvokingFunctionAfterDelay: () => {
                return sinon.stub();
            },
        },
        updateQpItemsWithNewDirectoryPath: {
            setupForUpdatingItemsWithNewDirectoryPath: () => {
                stubWorkspaceFolders([
                    "/test/path/to/workspace",
                    "/test2/path2/to2/workspace2",
                ]);
            },
            setupForReturningUnchangedItemsWhenDirectoryNotFound: () => {
                stubWorkspaceFolders([
                    "/test/path/to/workspace",
                    "/test2/path2/to2/workspace2",
                ]);
            },
        },
        normalizeUriPath: {
            setupForRemovingWorkspacePartWhenMultipleFolders: () => {
                stubWorkspaceFolders([
                    "/common/path/folder1/subfolder",
                    "/common/path/folder2/subfolder",
                ]);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "getWorkspaceFoldersCommonPathProp",
                        returns: "/common/path",
                    },
                ], sandbox);
                return {
                    item: (0, itemMockFactory_1.getItem)("/common/path/folder1/subfolder/"),
                    qpItem: (0, qpItemMockFactory_1.getQpItem)("/folder1/subfolder/"),
                };
            },
            setupForRemovingWorkspacePartWhenSingleFolder: () => {
                stubWorkspaceFolders(["/test/path/to/workspace"]);
                return {
                    item: (0, itemMockFactory_1.getItem)("/test/path/to/workspace/"),
                    qpItem: (0, qpItemMockFactory_1.getQpItem)(""),
                };
            },
            setupForKeepingWorkspacePartWhenNoFolders: () => {
                stubWorkspaceFolders(undefined);
                return {
                    item: (0, itemMockFactory_1.getItem)(),
                    qpItem: (0, qpItemMockFactory_1.getQpItem)(),
                };
            },
        },
        getStructure: {
            setupForReturningTreeStructureFromWorkspaceData: () => {
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
                return (0, mockFactory_1.getWorkspaceData)(workspaceDataItems);
            },
        },
        setWorkspaceFoldersCommonPath: {
            setupForDoingNothingWhenSingleFolder: () => {
                stubWorkspaceFolders(["/#"]);
            },
            setupForDoingNothingWhenNoFolders: () => {
                stubWorkspaceFolders(undefined);
            },
            setupForExtractingCommonPathWhenMultipleFolders: () => {
                stubWorkspaceFolders([
                    "/common/path/folder1/subfolder",
                    "/common/path/folder2/subfolder",
                ]);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=utils.testSetup.js.map