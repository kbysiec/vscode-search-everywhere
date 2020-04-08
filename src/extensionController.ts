import * as vscode from "vscode";
import QuickPick from "./quickPick";
import QuickPickItem from "./interface/quickPickItem";
import DataService from "./dataService";
import Utils from "./utils";
import Cache from "./cache";
import DataConverter from "./dataConverter";

class ExtensionController {
  private quickPick!: QuickPick;
  private dataService!: DataService;
  private dataConverter!: DataConverter;
  private utils!: Utils;
  private cache!: Cache;

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
    await this.cacheWorkspaceFiles();
  }

  private async cacheWorkspaceFiles(): Promise<void> {
    this.cache.clearCache();
    const qpData = await this.getQuickPickData();
    this.cache.updateDataCache(qpData);
  }

  private async loadQuickPickData(): Promise<void> {
    this.quickPick.showLoading(true);
    const data = (await this.getQuickPickDataFromCache()) || [];
    this.quickPick.loadItems(data);
    this.quickPick.showLoading(false);
  }

  private async getQuickPickData(): Promise<QuickPickItem[]> {
    const data = await this.dataService.getData();
    const qpData = this.dataConverter.prepareQpData(data);
    return qpData;
  }

  private getQuickPickDataFromCache(): QuickPickItem[] | undefined {
    return this.cache.getDataFromCache();
  }

  private initComponents(): void {
    this.cache = new Cache(this.extensionContext);
    this.dataService = new DataService(this.cache);
    this.dataConverter = new DataConverter();
    this.utils = new Utils();
    this.quickPick = new QuickPick();
  }
}

export default ExtensionController;
