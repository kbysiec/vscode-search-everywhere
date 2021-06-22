import * as vscode from "vscode";
import Cache from "./cache";
import Utils from "./utils";
import DataService from "./dataService";
import DataConverter from "./dataConverter";
import QuickPickItem from "./interface/quickPickItem";
import { appConfig } from "./appConfig";
import ActionType from "./enum/actionType";
import IndexActionType from "./enum/indexActionType";
import Action from "./interface/action";
import ActionProcessor from "./actionProcessor";
import Config from "./config";
import WorkspaceEventsEmitter from "./workspaceEventsEmitter";
import WorkspaceCommon from "./workspaceCommon";
import WorkspaceRemover from "./workspaceRemover";
import WorkspaceUpdater from "./workspaceUpdater";

const debounce = require("debounce");

class Workspace {
  events!: WorkspaceEventsEmitter;

  private dataService!: DataService;
  private dataConverter!: DataConverter;
  private actionProcessor!: ActionProcessor;

  private common!: WorkspaceCommon;
  private remover!: WorkspaceRemover;
  private updater!: WorkspaceUpdater;

  constructor(
    private cache: Cache,
    private utils: Utils,
    private config: Config
  ) {
    this.initComponents();
  }

  async index(indexActionType: IndexActionType): Promise<void> {
    await this.common.index(indexActionType);
  }

  registerEventListeners(): void {
    vscode.workspace.onDidChangeConfiguration(
      debounce(this.handleDidChangeConfiguration, 250)
    );
    vscode.workspace.onDidChangeWorkspaceFolders(
      debounce(this.handleDidChangeWorkspaceFolders, 250)
    );
    vscode.workspace.onDidChangeTextDocument(this.handleDidChangeTextDocument);
    vscode.workspace.onDidRenameFiles(this.handleDidRenameFiles);

    const fileWatcher = vscode.workspace.createFileSystemWatcher(
      appConfig.globPattern
    );
    fileWatcher.onDidChange(this.handleDidFileSave);
    // necessary to invoke updateCacheByPath after removeCacheByPath
    fileWatcher.onDidCreate(debounce(this.handleDidFileFolderCreate, 260));
    fileWatcher.onDidDelete(this.handleDidFileFolderDelete);

    this.actionProcessor.onDidProcessing(
      this.handleDidActionProcessorProcessing
    );
    this.actionProcessor.onWillProcessing(
      this.handleWillActionProcessorProcessing
    );
    this.actionProcessor.onWillExecuteAction(
      this.handleWillActionProcessorExecuteAction
    );
  }

  getData(): QuickPickItem[] | undefined {
    return this.common.getData();
  }

  private initComponents(): void {
    this.dataService = new DataService(this.utils, this.config);
    this.dataConverter = new DataConverter(this.utils, this.config);
    this.actionProcessor = new ActionProcessor(this.utils);
    this.events = new WorkspaceEventsEmitter();

    this.common = new WorkspaceCommon(
      this.cache,
      this.utils,
      this.dataService,
      this.dataConverter,
      this.actionProcessor
    );
    this.remover = new WorkspaceRemover(
      this.common,
      this.dataService,
      this.cache,
      this.utils
    );
    this.updater = new WorkspaceUpdater(
      this.common,
      this.remover,
      this.dataService,
      this.cache,
      this.utils
    );
  }

  private reloadComponents() {
    this.dataConverter.reload();
    this.dataService.reload();
  }

  private handleDidChangeConfiguration = async (
    event: vscode.ConfigurationChangeEvent
  ): Promise<void> => {
    this.cache.clearConfig();
    if (this.utils.shouldReindexOnConfigurationChange(event)) {
      this.reloadComponents();
      this.events.onWillReindexOnConfigurationChangeEventEmitter.fire();
      await this.index(IndexActionType.ConfigurationChange);
    } else if (this.utils.isDebounceConfigurationToggled(event)) {
      this.events.onDidDebounceConfigToggleEventEmitter.fire();
    }
  };

  private handleDidChangeWorkspaceFolders = async (
    event: vscode.WorkspaceFoldersChangeEvent
  ): Promise<void> => {
    if (this.utils.hasWorkspaceChanged(event)) {
      await this.index(IndexActionType.WorkspaceFoldersChange);
    }
  };

  private handleDidChangeTextDocument = async (
    event: vscode.TextDocumentChangeEvent
  ) => {
    const uri = event.document.uri;
    const isUriExistingInWorkspace =
      await this.dataService.isUriExistingInWorkspace(uri);
    const hasContentChanged = event.contentChanges.length;

    if (isUriExistingInWorkspace && hasContentChanged) {
      await this.common.registerAction(
        ActionType.Update,
        this.updater.updateCacheByPath.bind(this.updater, uri),
        "handleDidChangeTextDocument",
        uri
      );
    }
  };

  /* fileWatcher.onDidDelete(this.onDelete) is not invoked if workspace
    contains more than one folder opened. It is a workaround for this
    visual studio code issue.
 */
  // TODO Submit issue on github
  private handleDidRenameFiles = async (event: vscode.FileRenameEvent) => {
    const uri = event.files[0].oldUri;
    const hasWorkspaceMoreThanOneFolder =
      this.utils.hasWorkspaceMoreThanOneFolder();
    this.common.directoryUriBeforePathUpdate = event.files[0].oldUri;
    this.common.directoryUriAfterPathUpdate = event.files[0].newUri;
    if (hasWorkspaceMoreThanOneFolder) {
      await this.common.registerAction(
        ActionType.Remove,
        this.remover.removeFromCacheByPath.bind(this.remover, uri),
        "handleDidRenameFiles",
        uri
      );

      await this.common.registerAction(
        ActionType.Update,
        this.updater.updateCacheByPath.bind(this.updater, uri),
        "handleDidRenameFiles",
        uri
      );
    }
  };

  private handleDidFileSave = async (uri: vscode.Uri) => {
    const isUriExistingInWorkspace =
      await this.dataService.isUriExistingInWorkspace(uri);
    if (isUriExistingInWorkspace) {
      await this.common.registerAction(
        ActionType.Update,
        this.updater.updateCacheByPath.bind(this.updater, uri),
        "handleDidFileSave",
        uri
      );
    }
  };

  private handleDidFileFolderCreate = async (uri: vscode.Uri) => {
    // necessary to invoke updateCacheByPath after removeCacheByPath
    await this.utils.sleep(1);

    await this.common.registerAction(
      ActionType.Update,
      this.updater.updateCacheByPath.bind(this.updater, uri),
      "handleDidFileFolderCreate",
      uri
    );
  };

  private handleDidFileFolderDelete = async (uri: vscode.Uri) => {
    await this.common.registerAction(
      ActionType.Remove,
      this.remover.removeFromCacheByPath.bind(this.remover, uri),
      "handleDidFileFolderDelete",
      uri
    );
  };

  private handleWillActionProcessorProcessing = () => {
    this.events.onWillProcessingEventEmitter.fire();
  };

  private handleDidActionProcessorProcessing = () => {
    this.events.onDidProcessingEventEmitter.fire();
  };

  private handleWillActionProcessorExecuteAction = (action: Action) => {
    this.events.onWillExecuteActionEventEmitter.fire(action);
  };
}

export default Workspace;
