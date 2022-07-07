import * as vscode from "vscode";
import ActionProcessor from "./actionProcessor";
import Cache from "./cache";
import Config from "./config";
import DataConverter from "./dataConverter";
import DataService from "./dataService";
import ActionTrigger from "./enum/actionTrigger";
import ActionType from "./enum/actionType";
import DetailedActionType from "./enum/detailedActionType";
import ExcludeMode from "./enum/excludeMode";
import Action from "./interface/action";
import QuickPickItem from "./interface/quickPickItem";
import { utils } from "./utils";
// import Utils from "./utils";
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

  constructor(private cache: Cache, private config: Config) {
    this.initComponents();
  }

  async index(indexActionType: ActionTrigger): Promise<void> {
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
    utils.setWorkspaceFoldersCommonPath();
    this.dataService = new DataService(this.config);
    this.dataConverter = new DataConverter(this.config);
    this.actionProcessor = new ActionProcessor();
    this.events = new WorkspaceEventsEmitter();

    this.common = new WorkspaceCommon(
      this.cache,
      this.dataService,
      this.dataConverter,
      this.actionProcessor,
      this.config
    );
    this.remover = new WorkspaceRemover(this.common, this.cache);
    this.updater = new WorkspaceUpdater(this.common, this.cache);
  }

  private reloadComponents() {
    this.dataConverter.reload();
    this.dataService.reload();
  }

  private handleDidChangeConfiguration = async (
    event: vscode.ConfigurationChangeEvent
  ): Promise<void> => {
    this.cache.clearConfig();
    if (this.shouldReindexOnConfigurationChange(event)) {
      this.reloadComponents();
      this.events.onWillReindexOnConfigurationChangeEventEmitter.fire();
      await this.index(ActionTrigger.ConfigurationChange);
    } else if (utils.isDebounceConfigurationToggled(event)) {
      this.events.onDidDebounceConfigToggleEventEmitter.fire();
    }
  };

  private handleDidChangeWorkspaceFolders = async (
    event: vscode.WorkspaceFoldersChangeEvent
  ): Promise<void> => {
    utils.hasWorkspaceChanged(event) &&
      (await this.index(ActionTrigger.WorkspaceFoldersChange));
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
        ActionTrigger.DidChangeTextDocument,
        uri
      );

      await this.common.registerAction(
        ActionType.Update,
        this.updater.updateCacheByPath.bind(this.updater, uri, actionType),
        ActionTrigger.DidChangeTextDocument,
        uri
      );
    }
  };

  private handleDidRenameFiles = async (event: vscode.FileRenameEvent) => {
    this.dataService.clearCachedUris();

    const firstFile = event.files[0];
    const actionType = utils.isDirectory(firstFile.oldUri)
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
        ActionTrigger.DidRenameFiles,
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
          ActionTrigger.DidRenameFiles,
          file.oldUri
        ));
    }
  };

  private handleDidCreateFiles = async (event: vscode.FileCreateEvent) => {
    this.dataService.clearCachedUris();

    const uri = event.files[0];
    const actionType = utils.isDirectory(uri)
      ? DetailedActionType.CreateNewDirectory
      : DetailedActionType.CreateNewFile;

    await this.common.registerAction(
      ActionType.Update,
      this.updater.updateCacheByPath.bind(this.updater, uri, actionType),
      ActionTrigger.DidCreateFiles,
      uri
    );
  };

  private handleDidDeleteFiles = async (event: vscode.FileDeleteEvent) => {
    this.dataService.clearCachedUris();

    const uri = event.files[0];
    const actionType = utils.isDirectory(uri)
      ? DetailedActionType.RemoveDirectory
      : DetailedActionType.RemoveFile;

    await this.common.registerAction(
      ActionType.Remove,
      this.remover.removeFromCacheByPath.bind(this.remover, uri, actionType),
      ActionTrigger.DidDeleteFiles,
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

  private readonly defaultSection = "searchEverywhere";
  private shouldReindexOnConfigurationChange(
    event: vscode.ConfigurationChangeEvent
  ): boolean {
    const excludeMode = this.config.getExcludeMode();
    const excluded: string[] = [
      "shouldDisplayNotificationInStatusBar",
      "shouldInitOnStartup",
      "shouldHighlightSymbol",
      "shouldUseDebounce",
    ].map((config: string) => `${this.defaultSection}.${config}`);

    return (
      (event.affectsConfiguration("searchEverywhere") &&
        !excluded.some((config: string) =>
          event.affectsConfiguration(config)
        )) ||
      (excludeMode === ExcludeMode.FilesAndSearch &&
        (event.affectsConfiguration("files.exclude") ||
          event.affectsConfiguration("search.exclude")))
    );
  }
}

export default Workspace;
