import * as vscode from "vscode";
import {
  onDidProcessing,
  onWillExecuteAction,
  onWillProcessing,
} from "./actionProcessorEventsEmitter";
import {
  clear,
  clearConfig,
  clearNotSavedUriPaths as clearNotSavedUriPathsFromCache,
  getNotSavedUriPaths as getNotSavedUriPathsFromCache,
  updateNotSavedUriPaths,
} from "./cache";
import { fetchExcludeMode } from "./config";
import { dataConverter } from "./dataConverter";
import { dataService } from "./dataService";
import {
  Action,
  ActionTrigger,
  ActionType,
  DetailedActionType,
  ExcludeMode,
  QuickPickItem,
} from "./types";
import { utils } from "./utils";
import { workspaceCommon as common } from "./workspaceCommon";
import {
  onDidDebounceConfigToggleEventEmitter,
  onDidProcessingEventEmitter,
  onDidSortingConfigToggleEventEmitter,
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
  } else if (utils.isSortingConfigurationToggled(event)) {
    onDidSortingConfigToggleEventEmitter.fire();
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
    uri
  );
  const hasContentChanged = event.contentChanges.length;

  const actionType = DetailedActionType.TextChange;

  if (isUriExistingInWorkspace && hasContentChanged) {
    workspace.addNotSavedUri(uri);

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
  const uri = event.files[0];
  const actionType = utils.isDirectory(uri)
    ? DetailedActionType.CreateNewDirectory
    : DetailedActionType.CreateNewFile;

  workspace.addNotSavedUri(uri);

  await common.registerAction(
    ActionType.Update,
    updateCacheByPath.bind(null, uri, actionType),
    ActionTrigger.DidCreateFiles,
    uri
  );
}

async function handleDidDeleteFiles(event: vscode.FileDeleteEvent) {
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

function handleDidSaveTextDocument(textDocument: vscode.TextDocument) {
  workspace.removeFromNotSavedUri(textDocument.uri);
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
    "shouldItemsBeSorted",
    "shouldWorkspaceDataBeCached",
    "shouldSearchSelection",
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
  clear();
  await common.index(indexActionType);
}

async function removeDataForUnsavedUris() {
  const paths = Array.from(workspace.getNotSavedUris());
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const uri = vscode.Uri.file(path);

    await common.registerAction(
      ActionType.Remove,
      removeFromCacheByPath.bind(
        null,
        uri,
        DetailedActionType.ReloadUnsavedUri
      ),
      ActionTrigger.ReloadUnsavedUri,
      uri
    );

    await common.registerAction(
      ActionType.Update,
      updateCacheByPath.bind(null, uri, DetailedActionType.ReloadUnsavedUri),
      ActionTrigger.ReloadUnsavedUri,
      uri
    );
  }

  workspace.clearNotSavedUris();
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

  vscode.workspace.onDidSaveTextDocument(handleDidSaveTextDocument);

  onDidProcessing(handleDidActionProcessorProcessing);
  onWillProcessing(handleWillActionProcessorProcessing);
  onWillExecuteAction(handleWillActionProcessorExecuteAction);
}

function getData(): QuickPickItem[] {
  return common.getData();
}

function addNotSavedUri(uri: vscode.Uri) {
  const notSavedUris = workspace.getNotSavedUris();
  notSavedUris.add(uri.path);
  updateNotSavedUriPaths(Array.from(notSavedUris));
}

function removeFromNotSavedUri(uri: vscode.Uri) {
  const notSavedUris = workspace.getNotSavedUris();
  notSavedUris.delete(uri.path);
  updateNotSavedUriPaths(Array.from(notSavedUris));
}

function getNotSavedUris() {
  const array = getNotSavedUriPathsFromCache();
  return new Set<string>(array);
}

function clearNotSavedUris() {
  clearNotSavedUriPathsFromCache();
}

const defaultSection = "searchEverywhere";

export const workspace = {
  init,
  index,
  registerEventListeners,
  getData,
  getNotSavedUris,
  addNotSavedUri,
  removeFromNotSavedUri,
  clearNotSavedUris,
  removeDataForUnsavedUris,
  shouldReindexOnConfigurationChange,
  handleDidChangeConfiguration,
  handleDidChangeWorkspaceFolders,
  handleDidChangeTextDocument,
  handleDidSaveTextDocument,
  handleDidRenameFiles,
  handleDidCreateFiles,
  handleDidDeleteFiles,
  handleWillActionProcessorProcessing,
  handleDidActionProcessorProcessing,
  handleWillActionProcessorExecuteAction,
};
