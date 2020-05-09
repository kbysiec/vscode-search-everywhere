import * as vscode from "vscode";
import Cache from "./cache";
import Utils from "./utils";
import DataService from "./dataService";
import DataConverter from "./dataConverter";
import QuickPickItem from "./interface/quickPickItem";
import { appConfig } from "./appConfig";
import ActionType from "./enum/actionType";
import Action from "./interface/action";
import ActionProcessor from "./actionProcessor";

const debounce = require("debounce");

class Workspace {
  private onDidProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  readonly onDidProcessing: vscode.Event<void> = this
    .onDidProcessingEventEmitter.event;

  private dataService: DataService;
  private dataConverter: DataConverter;
  private actionProcessor: ActionProcessor;

  private urisForDirectoryPathUpdate?: vscode.Uri[];
  private directoryUriBeforePathUpdate?: vscode.Uri;
  private fileSymbolKind: number = 0;

  private progressStep: number = 0;
  private currentProgressValue: number = 0;

  constructor(private cache: Cache, private utils: Utils) {
    this.dataService = new DataService(this.cache, this.utils);
    this.dataConverter = new DataConverter(this.utils);
    this.actionProcessor = new ActionProcessor(this.utils);
  }

  async index(comment: string) {
    await this.registerAction(
      ActionType.Rebuild,
      this.indexWithProgress.bind(this),
      comment
    );
  }

  async registerEventListeners(): Promise<void> {
    vscode.workspace.onDidChangeConfiguration(
      debounce(this.onDidChangeConfiguration, 250)
    );
    vscode.workspace.onDidChangeWorkspaceFolders(
      debounce(this.onDidChangeWorkspaceFolders, 250)
    );
    vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument);
    vscode.workspace.onDidRenameFiles(this.onDidRenameFiles);

    const fileWatcher = vscode.workspace.createFileSystemWatcher(
      appConfig.globPattern
    );
    fileWatcher.onDidChange(this.onDidFileSave);
    // necessary to invoke updateCacheByPath after removeCacheByPath
    fileWatcher.onDidCreate(debounce(this.onDidFileFolderCreate, 260));
    fileWatcher.onDidDelete(this.onDidFileFolderDelete);

    this.actionProcessor.onDidProcessing(this.onDidActionProcessorProcessing);
  }

  getData(): QuickPickItem[] | undefined {
    return this.cache.getData();
  }

  private async indexWithProgress(): Promise<void> {
    if (this.utils.hasWorkspaceAnyFolder()) {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Indexing workspace files and symbols...",
        },
        this.indexWithProgressTask.bind(this)
      );
    } else {
      this.utils.printNoFolderOpenedMessage();
    }
  }

  private async indexWithProgressTask(
    progress: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ) {
    const onDidItemIndexedSubscription = this.dataService.onDidItemIndexed(
      this.onDidItemIndexed.bind(this, progress)
    );

    await this.indexWorkspace();

    this.resetProgress();
    onDidItemIndexedSubscription.dispose();

    // necessary for proper way to complete progress
    this.utils.sleep(250);
  }

  private async indexWorkspace(): Promise<void> {
    this.cache.clear();
    const qpData = await this.downloadData();
    this.cache.updateData(qpData);
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
        this.cleanDirectoryRenamingData();

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
        this.cleanDirectoryRenamingData();
      }
    } catch (error) {
      this.utils.printErrorMessage(error);
      await this.index("on error catch");
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

  private cleanDirectoryRenamingData() {
    this.directoryUriBeforePathUpdate = undefined;
    this.urisForDirectoryPathUpdate = undefined;
  }

  private async registerAction(
    type: ActionType,
    fn: Function,
    comment: string,
    uri?: vscode.Uri
  ): Promise<void> {
    const action: Action = {
      type,
      fn,
      comment,
      uri,
    };
    await this.actionProcessor.register(action);
  }

  private resetProgress() {
    this.currentProgressValue = 0;
    this.progressStep = 0;
  }

  private onDidChangeConfiguration = async (
    event: vscode.ConfigurationChangeEvent
  ): Promise<void> => {
    if (this.utils.hasConfigurationChanged(event)) {
      await this.index("onDidChangeConfiguration");
    }
  };

  private onDidChangeWorkspaceFolders = async (
    event: vscode.WorkspaceFoldersChangeEvent
  ): Promise<void> => {
    if (this.utils.hasWorkspaceChanged(event)) {
      await this.index("onDidChangeWorkspaceFolders");
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
      await this.registerAction(
        ActionType.Update,
        this.updateCacheByPath.bind(this, uri),
        "onDidChangeTextDocument",
        uri
      );
    }
  };

  /* fileWatcher.onDidDelete(this.onDelete) is not invoked if workspace
    contains more than one folder opened. It is a workaround for this
    visual studio code issue.
 */
  // TODO Submit issue on github
  private onDidRenameFiles = async (event: vscode.FileRenameEvent) => {
    const uri = event.files[0].oldUri;
    const hasWorkspaceMoreThanOneFolder = this.utils.hasWorkspaceMoreThanOneFolder();

    if (hasWorkspaceMoreThanOneFolder) {
      await this.registerAction(
        ActionType.Remove,
        this.removeFromCacheByPath.bind(this, uri),
        "onDidRenameFiles",
        uri
      );
    }
  };

  private onDidFileSave = async (uri: vscode.Uri) => {
    const isUriExistingInWorkspace = await this.dataService.isUriExistingInWorkspace(
      uri
    );
    if (isUriExistingInWorkspace) {
      await this.registerAction(
        ActionType.Update,
        this.updateCacheByPath.bind(this, uri),
        "onDidFileSave",
        uri
      );
    }
  };

  private onDidFileFolderCreate = async (uri: vscode.Uri) => {
    // necessary to invoke updateCacheByPath after removeCacheByPath
    // TODO: check if necessary
    await this.utils.sleep(1);

    await this.registerAction(
      ActionType.Update,
      this.updateCacheByPath.bind(this, uri),
      "onDidFileFolderCreate",
      uri
    );
  };

  private onDidFileFolderDelete = async (uri: vscode.Uri) => {
    await this.registerAction(
      ActionType.Remove,
      this.removeFromCacheByPath.bind(this, uri),
      "onDidFileFolderDelete",
      uri
    );
  };

  private onDidItemIndexed(
    progress: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
    urisCount: number
  ) {
    if (!this.progressStep) {
      this.progressStep = 100 / urisCount;
    }

    this.currentProgressValue += this.progressStep;

    progress.report({
      increment: this.progressStep,
      message: ` ${
        (progress as any).value
          ? `${Math.round(this.currentProgressValue)}%`
          : ""
      }`,
    });
  }

  private onDidActionProcessorProcessing = async () => {
    this.onDidProcessingEventEmitter.fire();
  };
}

export default Workspace;
