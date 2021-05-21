import * as vscode from "vscode";
import * as sinon from "sinon";
import Cache from "../../cache";
import Utils from "../../utils";
import Config from "../../config";
import { getExtensionContext, getConfiguration } from "./mockFactory";
import { createStubInstance } from "./stubbedClass";
import WorkspaceCommon from "../../workspaceCommon";
import DataService from "../../dataService";
import DataConverter from "../../dataConverter";
import ActionProcessor from "../../actionProcessor";
import WorkspaceRemover from "../../workspaceRemover";
import QuickPick from "../../quickPick";

export function getCacheStub(): Cache {
  const cacheStubTemp: any = createStubInstance(Cache);
  cacheStubTemp.extensionContext = getExtensionContext();
  return cacheStubTemp as Cache;
}

export function getUtilsStub(): Utils {
  const utilsStubTemp: any = createStubInstance(Utils);
  utilsStubTemp.config = getConfigStub();

  return utilsStubTemp as Utils;
}

export function getConfigStub(): Config {
  const configStub: any = createStubInstance(Config);
  configStub.cache = getCacheStub();
  configStub.default = getConfiguration().searchEverywhere;

  return configStub as Config;
}

export function getDataServiceStub(): DataService {
  const dataServiceStub: any = createStubInstance(DataService);
  dataServiceStub.utils = getUtilsStub();
  dataServiceStub.config = getConfigStub();

  return dataServiceStub as DataService;
}

export function getDataConverterStub(): DataConverter {
  const dataConverterStub: any = createStubInstance(DataConverter);
  dataConverterStub.utils = getUtilsStub();
  dataConverterStub.config = getConfigStub();

  return dataConverterStub as DataConverter;
}

export function getActionProcessorStub(): ActionProcessor {
  const actionProcessorStub: any = createStubInstance(ActionProcessor);
  actionProcessorStub.utils = getUtilsStub();

  return actionProcessorStub as ActionProcessor;
}

export function getWorkspaceCommonStub(): WorkspaceCommon {
  const workspaceCommonStubTemp: any = createStubInstance(WorkspaceCommon);
  workspaceCommonStubTemp.cache = getCacheStub();
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
  workspaceRemoverStubTemp.cache = getCacheStub();
  workspaceRemoverStubTemp.utils = getUtilsStub();

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
