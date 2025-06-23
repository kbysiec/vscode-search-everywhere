"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuickPickOnDidChangeValueEventListeners = exports.getFileWatcherStub = exports.getFileDeleteEvent = exports.getFileCreateEvent = exports.getQuickPickItemButtonEvent = exports.getFileRenameEvent = exports.getTextDocumentChangeEvent = exports.getConfigurationChangeEvent = exports.getWorkspaceFoldersChangeEvent = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const types_1 = require("../../src/types");
const qpItemMockFactory_1 = require("./qpItemMockFactory");
const stubFactory_1 = require("./stubFactory");
const getWorkspaceFoldersChangeEvent = (flag) => {
    return flag
        ? {
            added: [
                {
                    uri: vscode.Uri.file("#"),
                    name: "test workspace folder",
                    index: 1,
                },
            ],
            removed: [],
        }
        : {
            added: [],
            removed: [],
        };
};
exports.getWorkspaceFoldersChangeEvent = getWorkspaceFoldersChangeEvent;
const getConfigurationChangeEvent = (flag = true, shouldUseExcludedArray = true, isExcluded = true, excludeMode = types_1.ExcludeMode.SearchEverywhere, flagForFilesExclude = false, flagForSearchExclude = false) => {
    const defaultSection = "searchEverywhere";
    return {
        affectsConfiguration: (section) => defaultSection === section
            ? flag
            : shouldUseExcludedArray
                ? flag && isExcluded
                : excludeMode === types_1.ExcludeMode.FilesAndSearch
                    ? section === "files.exclude"
                        ? flagForFilesExclude
                        : section === "search.exclude"
                            ? flagForSearchExclude
                            : false
                    : flag,
    };
};
exports.getConfigurationChangeEvent = getConfigurationChangeEvent;
const getTextDocumentChangeEvent = (shouldContentBeChanged = false) => {
    const textDocumentChangeEvent = {
        document: (0, stubFactory_1.getTextDocumentStub)(),
        contentChanges: [],
        reason: undefined,
    };
    shouldContentBeChanged &&
        textDocumentChangeEvent.contentChanges.push("test change");
    return textDocumentChangeEvent;
};
exports.getTextDocumentChangeEvent = getTextDocumentChangeEvent;
const getFileRenameEvent = (isDirectory = false) => ({
    files: isDirectory
        ? [
            {
                oldUri: vscode.Uri.file("./test"),
                newUri: vscode.Uri.file("./testNew"),
            },
        ]
        : [
            {
                oldUri: vscode.Uri.file("./test/#"),
                newUri: vscode.Uri.file("./testNew/#"),
            },
            {
                oldUri: vscode.Uri.file("./test2/#"),
                newUri: vscode.Uri.file("./testNew2/#"),
            },
        ],
});
exports.getFileRenameEvent = getFileRenameEvent;
const getQuickPickItemButtonEvent = () => {
    const quickPickItemButtonEvent = {
        button: {
            iconPath: vscode.Uri.parse("#"),
            tooltip: undefined,
        },
        item: (0, qpItemMockFactory_1.getQpItem)(),
    };
    return quickPickItemButtonEvent;
};
exports.getQuickPickItemButtonEvent = getQuickPickItemButtonEvent;
const getFileCreateEvent = () => ({
    files: [vscode.Uri.file("./#")],
});
exports.getFileCreateEvent = getFileCreateEvent;
const getFileDeleteEvent = () => ({
    files: [vscode.Uri.file("./#")],
});
exports.getFileDeleteEvent = getFileDeleteEvent;
const getFileWatcherStub = () => {
    return {
        ignoreCreateEvents: false,
        ignoreChangeEvents: false,
        ignoreDeleteEvents: false,
        onDidChange: sinon.stub(),
        onDidCreate: sinon.stub(),
        onDidDelete: sinon.stub(),
        dispose: () => { },
    };
};
exports.getFileWatcherStub = getFileWatcherStub;
const getQuickPickOnDidChangeValueEventListeners = (count = 2) => {
    const array = [];
    for (let i = 0; i < count; i++) {
        array.push(new vscode.Disposable(() => { }));
    }
    return array;
};
exports.getQuickPickOnDidChangeValueEventListeners = getQuickPickOnDidChangeValueEventListeners;
//# sourceMappingURL=eventMockFactory.js.map