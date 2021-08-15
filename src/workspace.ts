import * as vscode from "vscode";
import ActionProcessor from "./actionProcessor";
import Cache from "./cache";
import Config from "./config";
import DataConverter from "./dataConverter";
import DataService from "./dataService";
import ActionType from "./enum/actionType";
import DetailedActionType from "./enum/detailedActionType";
import IndexActionType from "./enum/indexActionType";
import Action from "./interface/action";
import QuickPickItem from "./interface/quickPickItem";
import Utils from "./utils";
import WorkspaceCommon from "./workspaceCommon";
import WorkspaceEventsEmitter from "./workspaceEventsEmitter";
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
    vscode.workspace.onDidChangeTextDocument(
      debounce(this.handleDidChangeTextDocument, 700)
    );
    vscode.workspace.onDidRenameFiles(this.handleDidRenameFiles);
    vscode.workspace.onDidCreateFiles(this.handleDidCreateFiles);
    vscode.workspace.onDidDeleteFiles(this.handleDidDeleteFiles);

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

  getData(): QuickPickItem[] {
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
    this.remover = new WorkspaceRemover(this.common, this.cache);
    this.updater = new WorkspaceUpdater(this.common, this.cache, this.utils);
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
    this.utils.hasWorkspaceChanged(event) &&
      (await this.index(IndexActionType.WorkspaceFoldersChange));
  };

  private handleDidChangeTextDocument = async (
    event: vscode.TextDocumentChangeEvent
  ) => {
    const uri = event.document.uri;
    const isUriExistingInWorkspace =
      await this.dataService.isUriExistingInWorkspace(uri, true);
    const hasContentChanged = event.contentChanges.length;

    const actionType = DetailedActionType.TextChange;

    if (isUriExistingInWorkspace && hasContentChanged) {
      await this.common.registerAction(
        ActionType.Remove,
        this.remover.removeFromCacheByPath.bind(this.remover, uri, actionType),
        "handleDidChangeTextDocumentNew",
        uri
      );

      await this.common.registerAction(
        ActionType.Update,
        this.updater.updateCacheByPath.bind(this.updater, uri, actionType),
        "handleDidChangeTextDocumentNew",
        uri
      );
    }
  };

  private handleDidRenameFiles = async (event: vscode.FileRenameEvent) => {
    this.dataService.clearCachedUris();

    const firstFile = event.files[0];
    const actionType = this.utils.isDirectory(firstFile.oldUri)
      ? DetailedActionType.RenameOrMoveDirectory
      : DetailedActionType.RenameOrMoveFile;

    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i];

      await this.common.registerAction(
        ActionType.Update,
        this.updater.updateCacheByPath.bind(
          this.updater,
          file.newUri,
          actionType,
          file.oldUri
        ),
        "handleDidRenameFilesNew",
        file.newUri
      );

      actionType === DetailedActionType.RenameOrMoveFile &&
        (await this.common.registerAction(
          ActionType.Remove,
          this.remover.removeFromCacheByPath.bind(
            this.remover,
            file.oldUri,
            actionType
          ),
          "handleDidRenameFilesNew",
          file.oldUri
        ));
    }
  };

  private handleDidCreateFiles = async (event: vscode.FileCreateEvent) => {
    this.dataService.clearCachedUris();

    const uri = event.files[0];
    const actionType = this.utils.isDirectory(uri)
      ? DetailedActionType.CreateNewDirectory
      : DetailedActionType.CreateNewFile;

    await this.common.registerAction(
      ActionType.Update,
      this.updater.updateCacheByPath.bind(this.updater, uri, actionType),
      "handleDidCreateFilesNew",
      uri
    );
  };

  private handleDidDeleteFiles = async (event: vscode.FileDeleteEvent) => {
    this.dataService.clearCachedUris();

    const uri = event.files[0];
    const actionType = this.utils.isDirectory(uri)
      ? DetailedActionType.RemoveDirectory
      : DetailedActionType.RemoveFile;

    await this.common.registerAction(
      ActionType.Remove,
      this.remover.removeFromCacheByPath.bind(this.remover, uri, actionType),
      "handleDidDeleteFilesNew",
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
