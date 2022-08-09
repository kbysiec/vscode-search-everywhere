import * as vscode from "vscode";
import {
  onDidProcessing,
  onWillExecuteAction,
  onWillProcessing,
} from "./actionProcessorEventsEmitter";
import { clearConfig } from "./cache";
import { fetchExcludeMode } from "./config";
import { dataConverter } from "./dataConverter";
import { dataService } from "./dataService";
import ActionTrigger from "./enum/actionTrigger";
import ActionType from "./enum/actionType";
import DetailedActionType from "./enum/detailedActionType";
import ExcludeMode from "./enum/excludeMode";
import Action from "./interface/action";
import QuickPickItem from "./interface/quickPickItem";
import { utils } from "./utils";
import { workspaceCommon as common } from "./workspaceCommon";
import {
  onDidDebounceConfigToggleEventEmitter,
  onDidProcessingEventEmitter,
  onWillExecuteActionEventEmitter,
  onWillProcessingEventEmitter,
  onWillReindexOnConfigurationChangeEventEmitter,
} from "./workspaceEventsEmitter";
import { removeFromCacheByPath } from "./workspaceRemover";
import { updateCacheByPath } from "./workspaceUpdater";

const debounce = require("debounce");

function reloadComponents() {
  dataConverter.reload();
  dataService.reload();
}

async function handleDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent
) {
  clearConfig();
  if (workspace.shouldReindexOnConfigurationChange(event)) {
    reloadComponents();
    onWillReindexOnConfigurationChangeEventEmitter.fire();
    await workspace.index(ActionTrigger.ConfigurationChange);
  } else if (utils.isDebounceConfigurationToggled(event)) {
    onDidDebounceConfigToggleEventEmitter.fire();
  }
}

async function handleDidChangeWorkspaceFolders(
  event: vscode.WorkspaceFoldersChangeEvent
) {
  utils.hasWorkspaceChanged(event) &&
    (await workspace.index(ActionTrigger.WorkspaceFoldersChange));
}

async function handleDidChangeTextDocument(
  event: vscode.TextDocumentChangeEvent
) {
  const uri = event.document.uri;
  const isUriExistingInWorkspace = await dataService.isUriExistingInWorkspace(
    uri,
    true
  );
  const hasContentChanged = event.contentChanges.length;

  const actionType = DetailedActionType.TextChange;

  if (isUriExistingInWorkspace && hasContentChanged) {
    await common.registerAction(
      ActionType.Remove,
      removeFromCacheByPath.bind(null, uri, actionType),
      ActionTrigger.DidChangeTextDocument,
      uri
    );

    await common.registerAction(
      ActionType.Update,
      updateCacheByPath.bind(null, uri, actionType),
      ActionTrigger.DidChangeTextDocument,
      uri
    );
  }
}

async function handleDidRenameFiles(event: vscode.FileRenameEvent) {
  dataService.clearCachedUris();

  const firstFile = event.files[0];
  const actionType = utils.isDirectory(firstFile.oldUri)
    ? DetailedActionType.RenameOrMoveDirectory
    : DetailedActionType.RenameOrMoveFile;

  for (let i = 0; i < event.files.length; i++) {
    const file = event.files[i];

    await common.registerAction(
      ActionType.Update,
      updateCacheByPath.bind(null, file.newUri, actionType, file.oldUri),
      ActionTrigger.DidRenameFiles,
      file.newUri
    );

    actionType === DetailedActionType.RenameOrMoveFile &&
      (await common.registerAction(
        ActionType.Remove,
        removeFromCacheByPath.bind(null, file.oldUri, actionType),
        ActionTrigger.DidRenameFiles,
        file.oldUri
      ));
  }
}

async function handleDidCreateFiles(event: vscode.FileCreateEvent) {
  dataService.clearCachedUris();

  const uri = event.files[0];
  const actionType = utils.isDirectory(uri)
    ? DetailedActionType.CreateNewDirectory
    : DetailedActionType.CreateNewFile;

  await common.registerAction(
    ActionType.Update,
    updateCacheByPath.bind(null, uri, actionType),
    ActionTrigger.DidCreateFiles,
    uri
  );
}

async function handleDidDeleteFiles(event: vscode.FileDeleteEvent) {
  dataService.clearCachedUris();

  const uri = event.files[0];
  const actionType = utils.isDirectory(uri)
    ? DetailedActionType.RemoveDirectory
    : DetailedActionType.RemoveFile;

  await common.registerAction(
    ActionType.Remove,
    removeFromCacheByPath.bind(null, uri, actionType),
    ActionTrigger.DidDeleteFiles,
    uri
  );
}

function handleWillActionProcessorProcessing() {
  onWillProcessingEventEmitter.fire();
}

function handleDidActionProcessorProcessing() {
  onDidProcessingEventEmitter.fire();
}

function handleWillActionProcessorExecuteAction(action: Action) {
  onWillExecuteActionEventEmitter.fire(action);
}

function shouldReindexOnConfigurationChange(
  event: vscode.ConfigurationChangeEvent
): boolean {
  const excludeMode = fetchExcludeMode();
  const excluded: string[] = [
    "shouldDisplayNotificationInStatusBar",
    "shouldInitOnStartup",
    "shouldHighlightSymbol",
    "shouldUseDebounce",
  ].map((config: string) => `${defaultSection}.${config}`);

  return (
    (event.affectsConfiguration("searchEverywhere") &&
      !excluded.some((config: string) => event.affectsConfiguration(config))) ||
    (excludeMode === ExcludeMode.FilesAndSearch &&
      (event.affectsConfiguration("files.exclude") ||
        event.affectsConfiguration("search.exclude")))
  );
}

async function init() {
  utils.setWorkspaceFoldersCommonPath();
  await dataService.fetchConfig();
  dataConverter.fetchConfig();
  workspace.registerEventListeners();
}

async function index(indexActionType: ActionTrigger): Promise<void> {
  await common.index(indexActionType);
}

function registerEventListeners(): void {
  vscode.workspace.onDidChangeConfiguration(
    debounce(handleDidChangeConfiguration, 250)
  );
  vscode.workspace.onDidChangeWorkspaceFolders(
    debounce(handleDidChangeWorkspaceFolders, 250)
  );
  vscode.workspace.onDidChangeTextDocument(
    debounce(handleDidChangeTextDocument, 700)
  );
  vscode.workspace.onDidRenameFiles(handleDidRenameFiles);
  vscode.workspace.onDidCreateFiles(handleDidCreateFiles);
  vscode.workspace.onDidDeleteFiles(handleDidDeleteFiles);

  onDidProcessing(handleDidActionProcessorProcessing);
  onWillProcessing(handleWillActionProcessorProcessing);
  onWillExecuteAction(handleWillActionProcessorExecuteAction);
}

function getData(): QuickPickItem[] {
  return common.getData();
}

const defaultSection = "searchEverywhere";

export const workspace = {
  init,
  index,
  registerEventListeners,
  getData,
  shouldReindexOnConfigurationChange,
  handleDidChangeConfiguration,
  handleDidChangeWorkspaceFolders,
  handleDidChangeTextDocument,
  handleDidRenameFiles,
  handleDidCreateFiles,
  handleDidDeleteFiles,
  handleWillActionProcessorProcessing,
  handleDidActionProcessorProcessing,
  handleWillActionProcessorExecuteAction,
};
