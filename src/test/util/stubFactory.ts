import * as sinon from "sinon";
import * as vscode from "vscode";
import { createStubInstance } from "./stubbedClass";

export function getTextEditorStub(
  isUntitled: boolean = true,
  getTextReturnValue: string = ""
): vscode.TextEditor {
  return {
    document: {
      uri: createStubInstance(vscode.Uri),
      fileName: "",
      isUntitled,
      languageId: "",
      version: 1,
      isDirty: true,
      isClosed: true,
      save: sinon.stub(),
      eol: vscode.EndOfLine.LF,
      lineCount: 0,
      lineAt: (arg: any) => {
        return {} as vscode.TextLine;
      },
      offsetAt: sinon.stub(),
      positionAt: sinon.stub(),
      getText: sinon.stub().returns(getTextReturnValue),
      getWordRangeAtPosition: sinon.stub(),
      validateRange: sinon.stub(),
      validatePosition: sinon.stub(),
    },
    selection: new vscode.Selection(
      new vscode.Position(1, 1),
      new vscode.Position(1, 1)
    ),
    selections: [],
    visibleRanges: [],
    options: {},
    edit: sinon.stub(),
    insertSnippet: sinon.stub(),
    setDecorations: sinon.stub(),
    revealRange: () => {},
    show: sinon.stub(),
    hide: sinon.stub(),
    viewColumn: undefined,
  } as vscode.TextEditor;
}

export function getTextDocumentStub(
  isUntitled: boolean = true,
  uriPath: string = "#"
): vscode.TextDocument {
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
    lineAt: (arg: any) => {
      return {} as vscode.TextLine;
    },
    offsetAt: sinon.stub(),
    positionAt: sinon.stub(),
    getText: () => "",
    getWordRangeAtPosition: sinon.stub(),
    validateRange: sinon.stub(),
    validatePosition: sinon.stub(),
  } as vscode.TextDocument;
}
