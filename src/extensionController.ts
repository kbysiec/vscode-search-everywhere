import * as vscode from "vscode";
import QuickPick from "./quickPick";
import Utils from "./utils";
import Cache from "./cache";
import Workspace from "./workspace";
import Config from "./config";
import Action from "./interface/action";
import ActionType from "./enum/actionType";
import IndexActionType from "./enum/indexActionType";

class ExtensionController {
  private utils!: Utils;
  private cache!: Cache;
  private config!: Config;
  private workspace!: Workspace;
  private quickPick!: QuickPick;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.initComponents();
    this.workspace.registerEventListeners();
    this.registerEventListeners();
  }

  async search(): Promise<void> {
    if (this.utils.hasWorkspaceAnyFolder()) {
      this.shouldIndexOnQuickPickOpen() &&
        (await this.workspace.index(IndexActionType.Search));

      this.quickPick.isInitialized() && this.loadItemsAndShowQuickPick();
    } else {
      this.utils.printNoFolderOpenedMessage();
    }
  }

  async reload(): Promise<void> {
    this.utils.hasWorkspaceAnyFolder()
      ? await this.workspace.index(IndexActionType.Reload)
      : this.utils.printNoFolderOpenedMessage();
  }

  async startup(): Promise<void> {
    this.config.shouldInitOnStartup() &&
      (await this.workspace.index(IndexActionType.Startup));
  }

  private loadItemsAndShowQuickPick() {
    this.quickPick.loadItems();
    this.quickPick.show();
  }

  private async setQuickPickData(): Promise<void> {
    const data = (await this.workspace.getData()) || [];
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
    return (
      !this.config.shouldInitOnStartup() && !this.quickPick.isInitialized()
    );
  }

  private initComponents(): void {
    this.cache = new Cache(this.extensionContext);
    this.config = new Config(this.cache);
    this.utils = new Utils(this.config);
    this.workspace = new Workspace(this.cache, this.utils, this.config);
    this.quickPick = new QuickPick(this.config);
  }

  private registerEventListeners() {
    this.workspace.events.onWillProcessing(this.handleWillProcessing);
    this.workspace.events.onDidProcessing(this.handleDidProcessing);
    this.workspace.events.onWillExecuteAction(this.handleWillExecuteAction);
    this.workspace.events.onDidDebounceConfigToggle(
      this.handleDidDebounceConfigToggle
    );
    this.workspace.events.onWillReindexOnConfigurationChange(
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
