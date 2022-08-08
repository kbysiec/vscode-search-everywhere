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

class ExtensionController {
  constructor(private extensionContext: vscode.ExtensionContext) {
    this.initComponents();
    workspace.registerEventListeners();
    this.registerEventListeners();
  }

  async search(): Promise<void> {
    if (utils.hasWorkspaceAnyFolder()) {
      this.shouldIndexOnQuickPickOpen() &&
        (await workspace.index(ActionTrigger.Search));
      quickPick.isInitialized() && this.loadItemsAndShowQuickPick();
    } else {
      utils.printNoFolderOpenedMessage();
    }
  }

  async reload(): Promise<void> {
    utils.hasWorkspaceAnyFolder()
      ? await workspace.index(ActionTrigger.Reload)
      : utils.printNoFolderOpenedMessage();
  }

  async startup(): Promise<void> {
    fetchShouldInitOnStartup() &&
      (await workspace.index(ActionTrigger.Startup));
  }

  private loadItemsAndShowQuickPick() {
    quickPick.loadItems();
    quickPick.show();
  }

  private async setQuickPickData(): Promise<void> {
    const data = await workspace.getData();
    quickPick.setItems(data);
  }

  private setBusy(isBusy: boolean) {
    if (quickPick.isInitialized()) {
      this.setQuickPickLoading(isBusy);
      this.setQuickPickPlaceholder(isBusy);
    }
  }

  private setQuickPickLoading(isBusy: boolean) {
    quickPick.showLoading(isBusy);
  }

  private setQuickPickPlaceholder(isBusy: boolean) {
    quickPick.setPlaceholder(isBusy);
  }

  private shouldIndexOnQuickPickOpen() {
    return !fetchShouldInitOnStartup() && !quickPick.isInitialized();
  }

  private initComponents(): void {
    initCache(this.extensionContext);
    workspace.init();
    // this.quickPick = new QuickPick();
  }

  private registerEventListeners() {
    onWillProcessing(this.handleWillProcessing);
    onDidProcessing(this.handleDidProcessing);
    onWillExecuteAction(this.handleWillExecuteAction);
    onDidDebounceConfigToggle(this.handleDidDebounceConfigToggle);
    onWillReindexOnConfigurationChange(
      this.handleWillReindexOnConfigurationChange
    );
  }

  private handleWillProcessing = () => {
    this.setBusy(true);
    !quickPick.isInitialized() && quickPick.init();
  };

  private handleDidProcessing = async () => {
    await this.setQuickPickData();

    quickPick.loadItems();
    this.setBusy(false);
  };

  private handleWillExecuteAction = (action: Action) => {
    if (action.type === ActionType.Rebuild) {
      quickPick.setItems([]);
      quickPick.loadItems();
    }
  };

  private handleDidDebounceConfigToggle = () => {
    this.setBusy(true);
    quickPick.reloadOnDidChangeValueEventListener();
    this.setBusy(false);
  };

  private handleWillReindexOnConfigurationChange = () => {
    quickPick.reload();
  };
}

export default ExtensionController;
