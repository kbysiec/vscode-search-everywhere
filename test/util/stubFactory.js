"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextDocumentStub = exports.getTextEditorStub = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const stubbedClass_1 = require("./stubbedClass");
function getTextEditorStub(isUntitled = true, getTextReturnValue = "") {
    return {
        document: {
            uri: (0, stubbedClass_1.createStubInstance)(vscode.Uri),
            fileName: "",
            isUntitled,
            languageId: "",
            version: 1,
            isDirty: true,
            isClosed: true,
            save: sinon.stub(),
            eol: vscode.EndOfLine.LF,
            lineCount: 0,
            lineAt: (arg) => {
                return {};
            },
            offsetAt: sinon.stub(),
            positionAt: sinon.stub(),
            getText: sinon.stub().returns(getTextReturnValue),
            getWordRangeAtPosition: sinon.stub(),
            validateRange: sinon.stub(),
            validatePosition: sinon.stub(),
        },
        selection: new vscode.Selection(new vscode.Position(1, 1), new vscode.Position(1, 1)),
        selections: [],
        visibleRanges: [],
        options: {},
        edit: sinon.stub(),
        insertSnippet: sinon.stub(),
        setDecorations: sinon.stub(),
        revealRange: () => { },
        show: sinon.stub(),
        hide: sinon.stub(),
        viewColumn: undefined,
    };
}
exports.getTextEditorStub = getTextEditorStub;
function getTextDocumentStub(isUntitled = true, uriPath = "#") {
    return {
        uri: vscode.Uri.file(uriPath),
        fileName: "",
        isUntitled,
        languageId: "",
        version: 1,
        isDirty: true,
        isClosed: true,
        save: sinon.stub(),
        eol: vscode.EndOfLine.LF,
        lineCount: 0,
        lineAt: (arg) => {
            return {};
        },
        offsetAt: sinon.stub(),
        positionAt: sinon.stub(),
        getText: () => "",
        getWordRangeAtPosition: sinon.stub(),
        validateRange: sinon.stub(),
        validatePosition: sinon.stub(),
    };
}
exports.getTextDocumentStub = getTextDocumentStub;
//# sourceMappingURL=stubFactory.js.map