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
    this.dataService = new DataService(this.cache, this.utils);
    this.dataConverter = new DataConverter(this.utils);
  }

  async indexWorkspace(): Promise<void> {
    this.cache.clear();
    const qpData = await this.downloadData();
    this.cache.updateData(qpData);
  }

  async registerEventListeners(): Promise<void> {
    vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration);
    vscode.workspace.onDidChangeWorkspaceFolders(
      this.onDidChangeWorkspaceFolders
    );
  }

  getData(): QuickPickItem[] | undefined {
    return this.cache.getData();
  }

  private async downloadData(): Promise<QuickPickItem[]> {
    const data = await this.dataService.fetchData();
    const qpData = this.dataConverter.convertToQpData(data);
    return qpData;
  }

  private onDidChangeConfiguration = async (
    event: vscode.ConfigurationChangeEvent
  ): Promise<void> => {
    if (this.utils.hasConfigurationChanged(event)) {
      await this.indexWorkspace();
    }
  };

  private onDidChangeWorkspaceFolders = async (
    event: vscode.WorkspaceFoldersChangeEvent
  ): Promise<void> => {
    if (this.utils.hasWorkspaceChanged(event)) {
      await this.indexWorkspace();
    }
  };
}

export default Workspace;
