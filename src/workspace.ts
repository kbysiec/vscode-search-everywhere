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
import Config from "./config";

const debounce = require("debounce");

class Workspace {
  private onWillProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  private onDidProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  private onWillExecuteActionEventEmitter: vscode.EventEmitter<
    Action
  > = new vscode.EventEmitter();
  private onDidDebounceConfigToggleEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  private onWillReindexOnConfigurationChangeEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  readonly onWillProcessing: vscode.Event<void> = this
    .onWillProcessingEventEmitter.event;
  readonly onDidProcessing: vscode.Event<void> = this
    .onDidProcessingEventEmitter.event;
  readonly onWillExecuteAction: vscode.Event<Action> = this
    .onWillExecuteActionEventEmitter.event;
  readonly onDidDebounceConfigToggle: vscode.Event<void> = this
    .onDidDebounceConfigToggleEventEmitter.event;
  readonly onWillReindexOnConfigurationChange: vscode.Event<void> = this
    .onWillReindexOnConfigurationChangeEventEmitter.event;

  private dataService!: DataService;
  private dataConverter!: DataConverter;
  private actionProcessor!: ActionProcessor;

  private urisForDirectoryPathUpdate?: vscode.Uri[];
  private directoryUriBeforePathUpdate?: vscode.Uri;
  private fileSymbolKind: number = 0;

  private progressStep: number = 0;
  private currentProgressValue: number = 0;

  constructor(
    private cache: Cache,
    private utils: Utils,
    private config: Config
  ) {
    this.initComponents();
  }

  async index(comment: string) {
    await this.registerAction(
      ActionType.Rebuild,
      this.indexWithProgress.bind(this),
      comment
    );
  }

  registerEventListeners(): void {
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
    this.actionProcessor.onWillProcessing(this.onWillActionProcessorProcessing);
    this.actionProcessor.onWillExecuteAction(
      this.onWillActionProcessorExecuteAction
    );
  }

  getData(): QuickPickItem[] | undefined {
    return this.cache.getData();
  }

  private async indexWithProgress(): Promise<void> {
    if (this.utils.hasWorkspaceAnyFolder()) {
      await vscode.window.withProgress(
        {
          location: this.getNotificationLocation(),
          title: this.getNotificationTitle(),
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

  private getNotificationLocation(): vscode.ProgressLocation {
    const shouldDisplayNotificationInStatusBar = this.config.shouldDisplayNotificationInStatusBar();
    return shouldDisplayNotificationInStatusBar
      ? vscode.ProgressLocation.Window
      : vscode.ProgressLocation.Notification;
  }

  private getNotificationTitle(): string {
    const shouldDisplayNotificationInStatusBar = this.config.shouldDisplayNotificationInStatusBar();
    return shouldDisplayNotificationInStatusBar
      ? "Indexing..."
      : "Indexing workspace files and symbols...";
  }

  private initComponents(): void {
    this.dataService = new DataService(this.utils, this.config);
    this.dataConverter = new DataConverter(this.utils, this.config);
    this.actionProcessor = new ActionProcessor(this.utils);
  }

  private reloadComponents() {
    this.dataConverter.reload();
    this.dataService.reload();
  }

  private onDidChangeConfiguration = async (
    event: vscode.ConfigurationChangeEvent
  ): Promise<void> => {
    this.cache.clearConfig();
    if (this.utils.shouldReindexOnConfigurationChange(event)) {
      this.reloadComponents();
      this.onWillReindexOnConfigurationChangeEventEmitter.fire();
      await this.index("onDidChangeConfiguration");
    } else if (this.utils.isDebounceConfigurationToggled(event)) {
      this.onDidDebounceConfigToggleEventEmitter.fire();
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

  private onWillActionProcessorProcessing = () => {
    this.onWillProcessingEventEmitter.fire();
  };

  private onDidActionProcessorProcessing = () => {
    this.onDidProcessingEventEmitter.fire();
  };

  private onWillActionProcessorExecuteAction = (action: Action) => {
    this.onWillExecuteActionEventEmitter.fire(action);
  };
}

export default Workspace;
