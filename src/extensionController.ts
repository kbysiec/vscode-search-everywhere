import * as vscode from "vscode";
import { initCache } from "./cache";
import { fetchShouldInitOnStartup } from "./config";
import ActionTrigger from "./enum/actionTrigger";
import ActionType from "./enum/actionType";
import Action from "./interface/action";
import { quickPick } from "./quickPick";
import { utils } from "./utils";
import { workspace } from "./workspace";
import {
  onDidDebounceConfigToggle,
  onDidProcessing,
  onWillExecuteAction,
  onWillProcessing,
  onWillReindexOnConfigurationChange,
} from "./workspaceEventsEmitter";

function loadItemsAndShowQuickPick() {
  quickPick.loadItems();
  quickPick.show();
}

async function setQuickPickData(): Promise<void> {
  const data = await workspace.getData();
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

function shouldIndexOnQuickPickOpen() {
  return !fetchShouldInitOnStartup() && !quickPick.isInitialized();
}

function handleWillProcessing() {
  extensionController.setBusy(true);
  !quickPick.isInitialized() && quickPick.init();
}

async function handleDidProcessing() {
  await extensionController.setQuickPickData();

  quickPick.loadItems();
  extensionController.setBusy(false);
}

function handleWillExecuteAction(action: Action) {
  if (action.type === ActionType.Rebuild) {
    quickPick.setItems([]);
    quickPick.loadItems();
  }
}

function handleDidDebounceConfigToggle() {
  extensionController.setBusy(true);
  quickPick.reloadOnDidChangeValueEventListener();
  extensionController.setBusy(false);
}

function handleWillReindexOnConfigurationChange() {
  quickPick.reload();
}

async function search(): Promise<void> {
  if (utils.hasWorkspaceAnyFolder()) {
    extensionController.shouldIndexOnQuickPickOpen() &&
      (await workspace.index(ActionTrigger.Search));
    quickPick.isInitialized() && loadItemsAndShowQuickPick();
  } else {
    utils.printNoFolderOpenedMessage();
  }
}

async function reload(): Promise<void> {
  utils.hasWorkspaceAnyFolder()
    ? await workspace.index(ActionTrigger.Reload)
    : utils.printNoFolderOpenedMessage();
}

async function startup(): Promise<void> {
  fetchShouldInitOnStartup() && (await workspace.index(ActionTrigger.Startup));
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
  onWillReindexOnConfigurationChange(handleWillReindexOnConfigurationChange);
}

function init(newExtensionContext: vscode.ExtensionContext) {
  setExtensionContext(newExtensionContext);
  initCache(extensionController.getExtensionContext());
  workspace.init();
  registerWorkspaceEventListeners();
}

export const extensionController = {
  shouldIndexOnQuickPickOpen,
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
  handleWillReindexOnConfigurationChange,
};
