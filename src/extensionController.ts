import * as vscode from "vscode";
import QuickPick from "./quickPick";
import Utils from "./utils";
import Cache from "./cache";
import Workspace from "./workspace";

class ExtensionController {
  private utils!: Utils;
  private cache!: Cache;
  private workspace!: Workspace;
  private quickPick!: QuickPick;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.initComponents();
    this.workspace.registerEventListeners();
    this.registerEventListeners();
  }

  async search(): Promise<void> {
    if (this.utils.hasWorkspaceAnyFolder()) {
      this.quickPick.show();
    } else {
      this.utils.printNoFolderOpenedMessage();
    }
  }

  async startup(): Promise<void> {
    await this.workspace.index("startup");
  }

  private async loadQuickPickData(): Promise<void> {
    const data = (await this.workspace.getData()) || [];
    this.quickPick.loadItems(data);
  }

  private setBusy(isBusy: boolean) {
    this.setQuickPickLoading(isBusy);
    this.setQuickPickPlaceholder(isBusy);
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

  private initComponents(): void {
    this.cache = new Cache(this.extensionContext);
    this.utils = new Utils();
    this.workspace = new Workspace(this.cache, this.utils);
    this.quickPick = new QuickPick();
  }

  private registerEventListeners() {
    this.workspace.onWillProcessing(this.onWillProcessing);
    this.workspace.onDidProcessing(this.onDidProcessing);
  }

  private onWillProcessing = () => {
    this.setBusy(true);
  };

  private onDidProcessing = async () => {
    await this.loadQuickPickData();
    this.setBusy(false);
  };
}

export default ExtensionController;
