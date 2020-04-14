import * as vscode from "vscode";
import Cache from "./cache";
import Utils from "./utils";
import DataService from "./dataService";
import DataConverter from "./dataConverter";
import QuickPickItem from "./interface/quickPickItem";

class Workspace {
  private dataService: DataService;
  private dataConverter: DataConverter;

  constructor(private cache: Cache, private utils: Utils) {
    this.dataService = new DataService(this.cache);
    this.dataConverter = new DataConverter();
  }

  async cacheWorkspaceFiles(): Promise<void> {
    this.cache.clear();
    const qpData = await this.getQuickPickData();
    this.cache.updateData(qpData);
  }

  async registerEventListeners(): Promise<void> {
    vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration);
    vscode.workspace.onDidChangeWorkspaceFolders(
      this.onDidChangeWorkspaceFolders
    );
  }

  getQuickPickDataFromCache(): QuickPickItem[] | undefined {
    return this.cache.getData();
  }

  private async getQuickPickData(): Promise<QuickPickItem[]> {
    const data = await this.dataService.getData();
    const qpData = this.dataConverter.prepareQpData(data);
    return qpData;
  }

  private onDidChangeConfiguration = async (
    event: vscode.ConfigurationChangeEvent
  ): Promise<void> => {
    if (this.utils.hasConfigurationChanged(event)) {
      await this.cacheWorkspaceFiles();
    }
  };

  private onDidChangeWorkspaceFolders = async (
    event: vscode.WorkspaceFoldersChangeEvent
  ): Promise<void> => {
    if (this.utils.hasWorkspaceChanged(event)) {
      await this.cacheWorkspaceFiles();
    }
  };
}

export default Workspace;
