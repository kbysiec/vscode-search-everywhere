"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentSymbolItemMultiLine = exports.getDocumentSymbolItemSingleLineArray = exports.getDocumentSymbolItemSingleLine = exports.getItems = exports.getItem = exports.getUntitledItem = exports.getDirectory = void 0;
const vscode = require("vscode");
const getDirectory = (path) => {
    return vscode.Uri.file(path);
};
exports.getDirectory = getDirectory;
const getUntitledItem = () => {
    const itemUntitledUri = vscode.Uri.file("./fake/fake-1.ts");
    itemUntitledUri.scheme = "untitled";
    return itemUntitledUri;
};
exports.getUntitledItem = getUntitledItem;
const getItem = (path = "/./fake/", suffix = 1, fixPrivateFsPathProperty = false) => {
    const item = vscode.Uri.file(`${path}fake-${suffix ? `${suffix}` : ""}.ts`);
    fixPrivateFsPathProperty && (item._fsPath = item.path);
    return item;
};
exports.getItem = getItem;
const getItems = (count = 2, path = "/./fake/", suffixStartOffset = 0, fixPrivateFsPathProperty = false) => {
    const array = [];
    for (let i = 1; i <= count; i++) {
        array.push((0, exports.getItem)(path, i + suffixStartOffset, fixPrivateFsPathProperty));
    }
    return array;
};
exports.getItems = getItems;
const getDocumentSymbolItemSingleLine = (suffix, withChild = false, kind = 1) => {
    return {
        name: `test name${suffix ? ` ${suffix}` : ""}`,
        detail: `test details${suffix ? ` ${suffix}` : ""}`,
        kind,
        range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
        selectionRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
        children: withChild
            ? [
                {
                    name: `test child name${suffix ? ` ${suffix}` : ""}`,
                    detail: `test child details${suffix ? ` ${suffix}` : ""}`,
                    kind,
                    range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                    selectionRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                    children: [],
                },
            ]
            : [],
    };
};
exports.getDocumentSymbolItemSingleLine = getDocumentSymbolItemSingleLine;
const getDocumentSymbolItemSingleLineArray = (count = 0, withChild = false, kind = 1, kindsFromFirstItem = []) => {
    const array = [];
    for (let i = 0; i < count; i++) {
        array.push((0, exports.getDocumentSymbolItemSingleLine)(i + 1, withChild, kindsFromFirstItem[i] ? kindsFromFirstItem[i] : kind));
    }
    return array;
};
exports.getDocumentSymbolItemSingleLineArray = getDocumentSymbolItemSingleLineArray;
const getDocumentSymbolItemMultiLine = (withParent = false) => {
    return {
        name: `${withParent ? "test parent§&§" : ""}test name`,
        detail: "test details",
        kind: 1,
        range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(3, 0)),
        selectionRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(3, 0)),
        children: [],
    };
};
exports.getDocumentSymbolItemMultiLine = getDocumentSymbolItemMultiLine;
//# sourceMappingURL=itemMockFactory.js.map