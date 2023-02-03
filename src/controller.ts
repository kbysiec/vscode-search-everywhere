import * as vscode from "vscode";
import { clear, clearConfig, clearNotSavedUriPaths, initCache } from "./cache";
import {
  fetchShouldInitOnStartup,
  fetchShouldSearchSelection,
  fetchShouldWorkspaceDataBeCached,
} from "./config";
import { logger } from "./logger";
import { quickPick } from "./quickPick";
import { Action, ActionTrigger, ActionType } from "./types";
import { utils } from "./utils";
import { workspace } from "./workspace";
import {
  onDidDebounceConfigToggle,
  onDidProcessing,
  onDidSortingConfigToggle,
  onWillExecuteAction,
  onWillProcessing,
  onWillReindexOnConfigurationChange,
} from "./workspaceEventsEmitter";

function loadItemsAndShowQuickPick() {
  quickPick.loadItems();
  quickPick.show();

  const activeEditorOrUndefined = vscode.window.activeTextEditor;

  if (controller.shouldSearchSelection(activeEditorOrUndefined)) {
    const activeEditor = activeEditorOrUndefined as vscode.TextEditor;

    const { start, end } = activeEditor.selection;
    quickPick.setText(
      activeEditor.document.getText(new vscode.Range(start, end))
    );
  }
}
function setQuickPickData() {
  const data = workspace.getData();
  quickPick.setItems(data);
}

function setBusy(isBusy: boolean) {
  if (quickPick.isInitialized()) {
    setQuickPickLoading(isBusy);
    setQuickPickPlaceholder(isBusy);
  }
}

function setQuickPickLoading(isBusy: boolean) {
  quickPick.showLoading(isBusy);
}

function setQuickPickPlaceholder(isBusy: boolean) {
  quickPick.setPlaceholder(isBusy);
}

function isDataEmpty() {
  const data = workspace.getData();
  return !data.length;
}

function shouldIndexOnQuickPickOpen() {
  return (
    controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled() ||
    controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty()
  );
}

function isInitOnStartupDisabledAndWorkspaceCachingDisabled() {
  return (
    !fetchShouldInitOnStartup() &&
    !quickPick.isInitialized() &&
    !fetchShouldWorkspaceDataBeCached()
  );
}

function isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty() {
  return (
    !fetchShouldInitOnStartup() &&
    !quickPick.isInitialized() &&
    fetchShouldWorkspaceDataBeCached() &&
    isDataEmpty()
  );
}

function shouldIndexOnStartup() {
  return (
    controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled() ||
    controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty()
  );
}

function isInitOnStartupEnabledAndWorkspaceCachingDisabled() {
  return (
    fetchShouldInitOnStartup() &&
    !quickPick.isInitialized() &&
    !fetchShouldWorkspaceDataBeCached()
  );
}

function isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty() {
  return (
    fetchShouldInitOnStartup() &&
    !quickPick.isInitialized() &&
    fetchShouldWorkspaceDataBeCached() &&
    isDataEmpty()
  );
}

function shouldLoadDataFromCacheOnQuickPickOpen() {
  return (
    !fetchShouldInitOnStartup() &&
    !quickPick.isInitialized() &&
    fetchShouldWorkspaceDataBeCached()
  );
}

function shouldLoadDataFromCacheOnStartup() {
  return (
    fetchShouldInitOnStartup() &&
    !quickPick.isInitialized() &&
    fetchShouldWorkspaceDataBeCached()
  );
}

function shouldSearchSelection(editor: vscode.TextEditor | undefined) {
  return quickPick.isInitialized() && fetchShouldSearchSelection() && !!editor;
}

function handleWillProcessing() {
  controller.setBusy(true);
  !quickPick.isInitialized() && quickPick.init();
}

function handleDidProcessing() {
  controller.setQuickPickData();

  quickPick.loadItems();
  controller.setBusy(false);
}

function handleWillExecuteAction(action: Action) {
  if (action.type === ActionType.Rebuild) {
    quickPick.setItems([]);
    quickPick.loadItems();
  }
  logger.logAction(action);
}

function handleDidDebounceConfigToggle() {
  controller.setBusy(true);
  quickPick.reloadOnDidChangeValueEventListener();
  controller.setBusy(false);
}

function handleDidSortingConfigToggle() {
  controller.setBusy(true);
  quickPick.reloadSortingSettings();
  controller.setBusy(false);
}

function handleWillReindexOnConfigurationChange() {
  quickPick.reload();
}

async function search(): Promise<void> {
  if (controller.shouldIndexOnQuickPickOpen()) {
    clear();
    await workspace.index(ActionTrigger.Search);
  }

  if (controller.shouldLoadDataFromCacheOnQuickPickOpen()) {
    clearConfig();
    !quickPick.isInitialized() && quickPick.init();
    await workspace.removeDataForUnsavedUris();
    controller.setQuickPickData();
  }

  const activeEditorOrUndefined = vscode.window.activeTextEditor;

  if (controller.shouldSearchSelection(activeEditorOrUndefined)) {
    const timeInMsToAvoidListFlashing = 380;
    const activeEditor = activeEditorOrUndefined as vscode.TextEditor;
    quickPick.disposeOnDidChangeValueEventListeners();

    const { start, end } = activeEditor.selection;
    quickPick.setText(
      activeEditor.document.getText(new vscode.Range(start, end))
    );

    await utils.sleepAndExecute(
      timeInMsToAvoidListFlashing,
      quickPick.reloadOnDidChangeValueEventListener
    );

    // setTimeout(() => {
    //   quickPick.reloadOnDidChangeValueEventListener();
    // }, timeInMsToAvoidListFlashing);
  }
  quickPick.isInitialized() && loadItemsAndShowQuickPick();
}

async function reload(): Promise<void> {
  clear();
  clearNotSavedUriPaths();

  utils.hasWorkspaceAnyFolder()
    ? await workspace.index(ActionTrigger.Reload)
    : utils.printNoFolderOpenedMessage();
}

async function startup(): Promise<void> {
  if (controller.shouldIndexOnStartup()) {
    await workspace.index(ActionTrigger.Startup);
  }

  if (controller.shouldLoadDataFromCacheOnStartup()) {
    clearConfig();
    !quickPick.isInitialized() && quickPick.init();
    await workspace.removeDataForUnsavedUris();
    controller.setQuickPickData();
  }
}

let extensionContext: vscode.ExtensionContext;

function getExtensionContext() {
  return extensionContext;
}

function setExtensionContext(newExtensionContext: vscode.ExtensionContext) {
  extensionContext = newExtensionContext;
}

function registerWorkspaceEventListeners() {
  onWillProcessing(handleWillProcessing);
  onDidProcessing(handleDidProcessing);
  onWillExecuteAction(handleWillExecuteAction);
  onDidDebounceConfigToggle(handleDidDebounceConfigToggle);
  onDidSortingConfigToggle(handleDidSortingConfigToggle);
  onWillReindexOnConfigurationChange(handleWillReindexOnConfigurationChange);
}

async function init(newExtensionContext: vscode.ExtensionContext) {
  logger.init();
  setExtensionContext(newExtensionContext);
  initCache(controller.getExtensionContext());
  await workspace.init();
  registerWorkspaceEventListeners();

  logger.log(`Extension "vscode-search-everywhere" has been activated.`);
}

export const controller = {
  shouldIndexOnQuickPickOpen,
  shouldLoadDataFromCacheOnQuickPickOpen,
  shouldIndexOnStartup,
  shouldLoadDataFromCacheOnStartup,
  shouldSearchSelection,
  isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty,
  isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty,
  isInitOnStartupEnabledAndWorkspaceCachingDisabled,
  isInitOnStartupDisabledAndWorkspaceCachingDisabled,
  setQuickPickData,
  setBusy,
  getExtensionContext,
  init,
  search,
  startup,
  reload,
  handleWillProcessing,
  handleDidProcessing,
  handleWillExecuteAction,
  handleDidDebounceConfigToggle,
  handleDidSortingConfigToggle,
  handleWillReindexOnConfigurationChange,
};
