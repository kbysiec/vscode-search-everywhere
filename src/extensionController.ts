import * as vscode from "vscode";
import QuickPick from "./quickPick";
import QuickPickItem from "./interface/quickPickItem";
import DataService from "./dataService";
import Utils from "./utils";
import Cache from "./cache";
import DataConverter from "./dataConverter";
import Workspace from "./workspace";

class ExtensionController {
  private quickPick!: QuickPick;
  private utils!: Utils;
  private cache!: Cache;
  private workspace!: Workspace;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.initComponents();
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
    await this.workspace.cacheWorkspaceFiles();
  }

  private async loadQuickPickData(): Promise<void> {
    this.quickPick.showLoading(true);
    const data = (await this.workspace.getQuickPickDataFromCache()) || [];
    this.quickPick.loadItems(data);
    this.quickPick.showLoading(false);
  }

  private initComponents(): void {
    this.cache = new Cache(this.extensionContext);
    this.utils = new Utils();
    this.workspace = new Workspace(this.cache);
    this.quickPick = new QuickPick();
  }
}

export default ExtensionController;
