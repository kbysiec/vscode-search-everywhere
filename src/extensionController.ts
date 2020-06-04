import * as vscode from "vscode";
import QuickPick from "./quickPick";
import Utils from "./utils";
import Cache from "./cache";
import Workspace from "./workspace";
import Config from "./config";
import Action from "./interface/action";
import ActionType from "./enum/actionType";

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
      const shouldIndexOnQuickPickOpen = this.shouldIndexOnQuickPickOpen();
      const isQuickPickInitialized = this.quickPick.isInitialized();

      if (shouldIndexOnQuickPickOpen) {
        await this.workspace.index("search");
      }

      if (isQuickPickInitialized) {
        this.quickPick.loadItems();
        this.quickPick.show();
      }
    } else {
      this.utils.printNoFolderOpenedMessage();
    }
  }

  async startup(): Promise<void> {
    const shouldInitOnStartup = this.config.shouldInitOnStartup();
    if (shouldInitOnStartup) {
      await this.workspace.index("startup");
    }
  }

  private async setQuickPickData(): Promise<void> {
    const data = (await this.workspace.getData()) || [];
    this.quickPick.setItems(data);
  }

  private setBusy(isBusy: boolean) {
    const isQuickPickInitialized = this.quickPick.isInitialized();
    if (isQuickPickInitialized) {
      this.setQuickPickLoading(isBusy);
      this.setQuickPickPlaceholder(isBusy);
    }
  }

  private setQuickPickLoading(isBusy: boolean) {
    this.quickPick.showLoading(isBusy);
  }

  private setQuickPickPlaceholder(isBusy: boolean) {
    const placeholder = isBusy
      ? "Please wait, loading..."
      : "Start typing file or symbol name...";

    this.quickPick.setPlaceholder(placeholder);
  }

  private shouldIndexOnQuickPickOpen() {
    return (
      !this.config.shouldInitOnStartup() && !this.quickPick.isInitialized()
    );
  }

  private initComponents(): void {
    this.cache = new Cache(this.extensionContext);
    this.config = new Config(this.cache);
    this.utils = new Utils();
    this.workspace = new Workspace(this.cache, this.utils, this.config);
    this.quickPick = new QuickPick(this.config);
  }

  private registerEventListeners() {
    this.workspace.onWillProcessing(this.onWillProcessing);
    this.workspace.onDidProcessing(this.onDidProcessing);
    this.workspace.onWillExecuteAction(this.onWillExecuteAction);
    this.workspace.onDidDebounceConfigToggle(this.onDidDebounceConfigToggle);
  }

  private onWillProcessing = () => {
    this.setBusy(true);
  };

  private onDidProcessing = async () => {
    await this.setQuickPickData();
    if (!this.quickPick.isInitialized()) {
      this.quickPick.init();
    }
    this.quickPick.loadItems();
    this.setBusy(false);
  };

  private onWillExecuteAction = (action: Action) => {
    if (action.type === ActionType.Rebuild) {
      this.quickPick.setItems([]);
      this.quickPick.loadItems();
    }
  };

  private onDidDebounceConfigToggle = () => {
    this.setBusy(true);
    this.quickPick.reloadOnDidChangeValueEventListener();
    this.setBusy(false);
  };
}

export default ExtensionController;
