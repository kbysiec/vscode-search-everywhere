import * as vscode from "vscode";
import Cache from "./cache";
import Utils from "./utils";
import DataService from "./dataService";
import DataConverter from "./dataConverter";
import QuickPickItem from "./interface/quickPickItem";

class Workspace {
  private dataService: DataService;
  private dataConverter: DataConverter;

  private urisForDirectoryPathUpdate?: vscode.Uri[];
  private directoryUriBeforePathUpdate?: vscode.Uri;
  private fileSymbolKind: number = 0;

  constructor(
    private cache: Cache,
    private utils: Utils,
    private onDidChangeTextDocumentCallback: Function
  ) {
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
    vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument);
  }

  getData(): QuickPickItem[] | undefined {
    return this.cache.getData();
  }

  private async downloadData(uris?: vscode.Uri[]): Promise<QuickPickItem[]> {
    const data = await this.dataService.fetchData(uris);
    const qpData = this.dataConverter.convertToQpData(data);
    return qpData;
  }

  private async updateCacheByPath(uri: vscode.Uri): Promise<void> {
    try {
      const isUriExistingInWorkspace = await this.dataService.isUriExistingInWorkspace(
        uri
      );
      let data: QuickPickItem[];

      if (isUriExistingInWorkspace) {
        await this.removeFromCacheByPath(uri);
        data = await this.downloadData([uri]);
        data = this.mergeWithDataFromCache(data);
        this.cache.updateData(data);
      } else {
        if (
          this.urisForDirectoryPathUpdate &&
          this.urisForDirectoryPathUpdate.length
        ) {
          const urisWithNewDirectoryName = this.updateUrisWithNewDirectoryName(
            this.urisForDirectoryPathUpdate,
            this.directoryUriBeforePathUpdate!,
            uri
          );
          data = await this.downloadData(urisWithNewDirectoryName);
          data = this.mergeWithDataFromCache(data);
          this.cache.updateData(data);
        }
        this.directoryUriBeforePathUpdate = undefined;
        this.urisForDirectoryPathUpdate = undefined;
      }
    } catch (error) {
      this.utils.printErrorMessage(error);
      await this.indexWorkspace();
    }
  }

  private async removeFromCacheByPath(uri: vscode.Uri): Promise<void> {
    let data = this.getData();
    const isUriExistingInWorkspace = await this.dataService.isUriExistingInWorkspace(
      uri
    );
    if (data) {
      if (isUriExistingInWorkspace) {
        data = data.filter(
          (qpItem: QuickPickItem) => qpItem.uri.fsPath !== uri.fsPath
        );
      } else {
        this.directoryUriBeforePathUpdate = uri;
        this.urisForDirectoryPathUpdate = this.getUrisForDirectoryPathUpdate(
          data,
          uri
        );
        data = data.filter(
          (qpItem: QuickPickItem) => !qpItem.uri.fsPath.includes(uri.fsPath)
        );
      }
      this.cache.updateData(data);
    }
  }

  private getUrisForDirectoryPathUpdate(
    data: QuickPickItem[],
    uri: vscode.Uri
  ): vscode.Uri[] {
    return data
      .filter(
        (qpItem: QuickPickItem) =>
          qpItem.uri.fsPath.includes(uri.fsPath) &&
          qpItem.symbolKind === this.fileSymbolKind
      )
      .map((qpItem: QuickPickItem) => qpItem.uri);
  }

  private mergeWithDataFromCache(data: QuickPickItem[]): QuickPickItem[] {
    const dataFromCache = this.getData();
    if (dataFromCache) {
      return dataFromCache.concat(data);
    }
    return data;
  }

  private updateUrisWithNewDirectoryName(
    uris: vscode.Uri[],
    oldDirectoryUri: vscode.Uri,
    newDirectoryUri: vscode.Uri
  ): vscode.Uri[] {
    return uris.map((oldUri: vscode.Uri) => {
      const path = oldUri.fsPath.replace(
        oldDirectoryUri.fsPath,
        newDirectoryUri.fsPath
      );
      return vscode.Uri.file(path);
    });
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

  private onDidChangeTextDocument = async (
    event: vscode.TextDocumentChangeEvent
  ) => {
    const uri = event.document.uri;
    const isUriExistingInWorkspace = await this.dataService.isUriExistingInWorkspace(
      uri
    );

    if (isUriExistingInWorkspace && event.contentChanges.length) {
      await this.updateCacheByPath(uri);
      await this.onDidChangeTextDocumentCallback();
    }
  };
}

export default Workspace;
