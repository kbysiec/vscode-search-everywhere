"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQpHelpItems = exports.getQpHelpItem = exports.getDocumentSymbolQpItemMultiLine = exports.getQpItemDocumentSymbolSingleLine = exports.getQpItemsSymbolAndUriExt = exports.getQpItemsSymbolAndUri = exports.getQpItems = exports.getUntitledQpItem = exports.getQpItem = void 0;
const vscode = require("vscode");
const itemMockFactory_1 = require("./itemMockFactory");
const mockFactory_1 = require("./mockFactory");
const getQpItem = (path = "/./fake/", suffix = 1, differentStartAndEnd = false, withIcon = false, withFilterPhrase = false, symbolKind = 0) => {
    const configuration = (0, mockFactory_1.getConfiguration)().searchEverywhere;
    const icons = configuration.icons;
    const itemsFilterPhrases = configuration.itemsFilterPhrases;
    const qpItem = {
        label: `${withIcon ? `$(${icons[symbolKind]})  ` : ""}fake-${suffix ? `${suffix}` : ""}.ts`,
        description: `${withFilterPhrase
            ? `[${itemsFilterPhrases[symbolKind]}fake-${suffix ? `${suffix}` : ""}.ts] `
            : ""}File`,
        detail: `${path}fake-${suffix ? `${suffix}` : ""}.ts`,
        uri: vscode.Uri.file(`${path}fake-${suffix ? `${suffix}` : ""}.ts`),
        symbolKind,
        range: {
            start: new vscode.Position(0, 0),
            end: differentStartAndEnd
                ? new vscode.Position(0, 5)
                : new vscode.Position(0, 0),
        },
        buttons: [
            {
                iconPath: new vscode.ThemeIcon("open-preview"),
                tooltip: "Open to the side",
            },
        ],
    };
    const qpItemAny = qpItem;
    qpItemAny.uri._fsPath = qpItemAny.uri.path;
    qpItemAny.detail = qpItemAny.uri.path;
    return qpItem;
};
exports.getQpItem = getQpItem;
const getUntitledQpItem = () => {
    return {
        label: "fake-1.ts",
        uri: (0, itemMockFactory_1.getUntitledItem)(),
        symbolKind: 0,
        range: {
            start: new vscode.Position(0, 0),
            end: new vscode.Position(0, 5),
        },
    };
};
exports.getUntitledQpItem = getUntitledQpItem;
const getQpItems = (count = 2, path = "/./fake/", suffixStartOffset = 0, withIcon = false) => {
    const array = [];
    for (let i = 1; i <= count; i++) {
        array.push((0, exports.getQpItem)(path, i + suffixStartOffset, withIcon));
    }
    return array;
};
exports.getQpItems = getQpItems;
const getQpItemsSymbolAndUri = (path = "/./fake/") => {
    const qpItemsSymbolAndUri = [
        {
            label: "fake-2.ts",
            description: "File",
            detail: `${path}fake-2.ts`,
            uri: vscode.Uri.file(`${path}fake-2.ts`),
            symbolKind: 0,
            range: {
                start: new vscode.Position(0, 0),
                end: new vscode.Position(0, 0),
            },
        },
        {
            label: "test symbol name",
            description: "Module at lines: 1 - 3 in test parent",
            detail: `${path}fake-2.ts`,
            uri: vscode.Uri.file(`${path}fake-2.ts`),
            symbolKind: 1,
            range: {
                start: new vscode.Position(0, 0),
                end: new vscode.Position(3, 0),
            },
        },
    ];
    qpItemsSymbolAndUri.forEach((qpItem) => {
        qpItem.uri._fsPath = qpItem.uri.path;
        qpItem.detail = qpItem.uri.path;
    });
    return qpItemsSymbolAndUri;
};
exports.getQpItemsSymbolAndUri = getQpItemsSymbolAndUri;
const getQpItemsSymbolAndUriExt = (path = "/./fake/") => {
    const qpItemsSymbolAndUriExt = [
        {
            label: "fake-2.ts",
            description: "File",
            detail: `${path}fake-2.ts`,
            uri: vscode.Uri.file(`${path}fake-2.ts`),
            symbolKind: 0,
            range: {
                start: new vscode.Position(0, 0),
                end: new vscode.Position(0, 0),
            },
        },
        {
            label: "test symbol name",
            description: "Module at lines: 1 - 3 in test parent",
            detail: `${path}fake-2.ts`,
            uri: vscode.Uri.file(`${path}fake-2.ts`),
            symbolKind: 1,
            range: {
                start: new vscode.Position(0, 0),
                end: new vscode.Position(3, 0),
            },
        },
    ];
    qpItemsSymbolAndUriExt.forEach((qpItem) => {
        qpItem.uri._fsPath = qpItem.uri.path;
        qpItem.detail = qpItem.uri.path;
    });
    return qpItemsSymbolAndUriExt;
};
exports.getQpItemsSymbolAndUriExt = getQpItemsSymbolAndUriExt;
const getQpItemDocumentSymbolSingleLine = (withIcon = false, withFilterPhrase = false) => {
    const configuration = (0, mockFactory_1.getConfiguration)().searchEverywhere;
    const icons = configuration.icons;
    const itemsFilterPhrases = configuration.itemsFilterPhrases;
    const symbolKind = 1;
    const qpItem = {
        label: `${withIcon ? `$(${icons[symbolKind]})  ` : ""}test name`,
        description: `${withFilterPhrase ? `[${itemsFilterPhrases[symbolKind]}test name] ` : ""}Module at line: 1`,
        detail: "/./fake/fake-1.ts",
        uri: vscode.Uri.file("./fake/fake-1.ts"),
        symbolKind,
        range: {
            start: new vscode.Position(0, 0),
            end: new vscode.Position(0, 0),
        },
    };
    const qpItemAny = qpItem;
    qpItemAny.uri._fsPath = qpItemAny.uri.path;
    qpItemAny.detail = qpItemAny.uri.path;
    return qpItem;
};
exports.getQpItemDocumentSymbolSingleLine = getQpItemDocumentSymbolSingleLine;
const getDocumentSymbolQpItemMultiLine = (withParent = false) => {
    const qpItem = {
        label: "test name",
        description: `Module at lines: 1 - 3${withParent ? " in test parent" : ""}`,
        detail: "/./fake/fake-1.ts",
        uri: vscode.Uri.file("./fake/fake-1.ts"),
        symbolKind: 1,
        range: {
            start: new vscode.Position(0, 0),
            end: new vscode.Position(3, 0),
        },
    };
    const qpItemAny = qpItem;
    qpItemAny.uri._fsPath = qpItemAny.uri.path;
    qpItemAny.detail = qpItemAny.uri.path;
    return qpItem;
};
exports.getDocumentSymbolQpItemMultiLine = getDocumentSymbolQpItemMultiLine;
const getQpHelpItem = (helpPhrase = "?", kind, itemFilterPhrase) => {
    const qpItem = {
        label: `${helpPhrase} Type ${itemFilterPhrase} for limit results to ${vscode.SymbolKind[Number(kind)]} only`,
        symbolKind: Number(kind),
        isHelp: true,
        uri: vscode.Uri.parse("#"),
    };
    return qpItem;
};
exports.getQpHelpItem = getQpHelpItem;
const getQpHelpItems = (helpPhrase = "?", itemFilterPhrases = { 0: "$$", 4: "@@" }) => {
    const array = [];
    Object.keys(itemFilterPhrases).forEach((kind) => array.push((0, exports.getQpHelpItem)(helpPhrase, kind, itemFilterPhrases[Number(kind)])));
    return array;
};
exports.getQpHelpItems = getQpHelpItems;
//# sourceMappingURL=qpItemMockFactory.js.map