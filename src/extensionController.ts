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
  }

  async search(): Promise<void> {
    if (this.utils.hasWorkspaceAnyFolder()) {
      await this.loadQuickPickData();
      this.quickPick.show();
    } else {
      this.utils.printNoFolderOpenedMessage();
    }
  }

  async startup(): Promise<void> {
    await this.workspace.indexWorkspace();
  }

  private async loadQuickPickData(): Promise<void> {
    this.quickPick.showLoading(true);
    const data = (await this.workspace.getData()) || [];
    this.quickPick.loadItems(data);
    this.quickPick.showLoading(false);
  }

  private initComponents(): void {
    this.cache = new Cache(this.extensionContext);
    this.utils = new Utils();
    this.workspace = new Workspace(this.cache, this.utils);
    this.quickPick = new QuickPick();
  }
}

export default ExtensionController;
