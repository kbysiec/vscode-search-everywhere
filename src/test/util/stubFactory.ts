import * as sinon from "sinon";
import * as vscode from "vscode";
import ActionProcessor from "../../actionProcessor";
import DataConverter from "../../dataConverter";
import DataService from "../../dataService";
import QuickPick from "../../quickPick";
import WorkspaceCommon from "../../workspaceCommon";
import WorkspaceRemover from "../../workspaceRemover";
import { createStubInstance } from "./stubbedClass";

export function getDataServiceStub(): DataService {
  const dataServiceStub: any = createStubInstance(DataService);

  return dataServiceStub as DataService;
}

export function getDataConverterStub(): DataConverter {
  const dataConverterStub: any = createStubInstance(DataConverter);

  return dataConverterStub as DataConverter;
}

export function getActionProcessorStub(): ActionProcessor {
  const actionProcessorStub: any = createStubInstance(ActionProcessor);

  return actionProcessorStub as ActionProcessor;
}

export function getWorkspaceCommonStub(): WorkspaceCommon {
  const workspaceCommonStubTemp: any = createStubInstance(WorkspaceCommon);
  workspaceCommonStubTemp.dataService = getDataServiceStub();
  workspaceCommonStubTemp.dataConverter = getDataConverterStub();
  workspaceCommonStubTemp.actionProcessor = getActionProcessorStub();
  workspaceCommonStubTemp.urisForDirectoryPathUpdate = null;
  workspaceCommonStubTemp.directoryUriBeforePathUpdate = null;
  workspaceCommonStubTemp.directoryUriAfterPathUpdate = null;

  return workspaceCommonStubTemp as WorkspaceCommon;
}

export function getWorkspaceRemoverStub(): WorkspaceRemover {
  const workspaceRemoverStubTemp: any = createStubInstance(WorkspaceRemover);
  workspaceRemoverStubTemp.common = getWorkspaceCommonStub();
  workspaceRemoverStubTemp.dataService = getDataServiceStub();

  return workspaceRemoverStubTemp as WorkspaceRemover;
}

export function getQuickPickStub(): QuickPick {
  const quickPickStubTemp: any = createStubInstance(QuickPick);
  return quickPickStubTemp as QuickPick;
}

export function getTextEditorStub(
  isUntitled: boolean = true
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
      getText: sinon.stub(),
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
  } as vscode.TextEditor;
}

export function getTextDocumentStub(
  isUntitled: boolean = true
): vscode.TextDocument {
  return {
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
    getText: () => "",
    getWordRangeAtPosition: sinon.stub(),
    validateRange: sinon.stub(),
    validatePosition: sinon.stub(),
  } as vscode.TextDocument;
}
