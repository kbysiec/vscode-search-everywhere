import * as vscode from "vscode";
import { initCache } from "./cache";
import { fetchShouldInitOnStartup } from "./config";
import ActionTrigger from "./enum/actionTrigger";
import ActionType from "./enum/actionType";
import Action from "./interface/action";
import QuickPick from "./quickPick";
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
  private quickPick!: QuickPick;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.initComponents();
    workspace.registerEventListeners();
    this.registerEventListeners();
  }

  async search(): Promise<void> {
    if (utils.hasWorkspaceAnyFolder()) {
      this.shouldIndexOnQuickPickOpen() &&
        (await workspace.index(ActionTrigger.Search));
      this.quickPick.isInitialized() && this.loadItemsAndShowQuickPick();
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
    this.quickPick.loadItems();
    this.quickPick.show();
  }

  private async setQuickPickData(): Promise<void> {
    const data = await workspace.getData();
    this.quickPick.setItems(data);
  }

  private setBusy(isBusy: boolean) {
    if (this.quickPick.isInitialized()) {
      this.setQuickPickLoading(isBusy);
      this.setQuickPickPlaceholder(isBusy);
    }
  }

  private setQuickPickLoading(isBusy: boolean) {
    this.quickPick.showLoading(isBusy);
  }

  private setQuickPickPlaceholder(isBusy: boolean) {
    this.quickPick.setPlaceholder(isBusy);
  }

  private shouldIndexOnQuickPickOpen() {
    return !fetchShouldInitOnStartup() && !this.quickPick.isInitialized();
  }

  private initComponents(): void {
    initCache(this.extensionContext);
    workspace.init();
    this.quickPick = new QuickPick();
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
    !this.quickPick.isInitialized() && this.quickPick.init();
  };

  private handleDidProcessing = async () => {
    await this.setQuickPickData();

    this.quickPick.loadItems();
    this.setBusy(false);
  };

  private handleWillExecuteAction = (action: Action) => {
    if (action.type === ActionType.Rebuild) {
      this.quickPick.setItems([]);
      this.quickPick.loadItems();
    }
  };

  private handleDidDebounceConfigToggle = () => {
    this.setBusy(true);
    this.quickPick.reloadOnDidChangeValueEventListener();
    this.setBusy(false);
  };

  private handleWillReindexOnConfigurationChange = () => {
    this.quickPick.reload();
  };
}

export default ExtensionController;
