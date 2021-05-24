import * as vscode from "vscode";
import ActionProcessor from "./actionProcessor";
import Cache from "./cache";
import DataConverter from "./dataConverter";
import DataService from "./dataService";
import ActionType from "./enum/actionType";
import Action from "./interface/action";
import QuickPickItem from "./interface/quickPickItem";
import Utils from "./utils";

class WorkspaceCommon {
  fileKind: number = 0;
  progressStep: number = 0;
  currentProgressValue: number = 0;

  urisForDirectoryPathUpdate: vscode.Uri[] | null = null;
  directoryUriBeforePathUpdate?: vscode.Uri | null = null;
  directoryUriAfterPathUpdate?: vscode.Uri | null = null;

  constructor(
    private cache: Cache,
    private utils: Utils,
    private dataService: DataService,
    private dataConverter: DataConverter,
    private actionProcessor: ActionProcessor
  ) {}

  getData(): QuickPickItem[] | undefined {
    return this.cache.getData();
  }

  wasDirectoryRenamed(): boolean {
    return (
      this.isDirectory(this.directoryUriBeforePathUpdate!) &&
      !!this.directoryUriAfterPathUpdate
    );
  }

  async index(comment: string): Promise<void> {
    await this.registerAction(
      ActionType.Rebuild,
      this.indexWithProgress.bind(this),
      comment
    );
  }

  async indexWithProgress(): Promise<void> {
    this.utils.hasWorkspaceAnyFolder()
      ? await vscode.window.withProgress(
          {
            location: this.utils.getNotificationLocation(),
            title: this.utils.getNotificationTitle(),
            cancellable: true,
          },
          this.indexWithProgressTask.bind(this)
        )
      : this.utils.printNoFolderOpenedMessage();
  }

  async registerAction(
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

  async downloadData(uris?: vscode.Uri[]): Promise<QuickPickItem[]> {
    const data = await this.dataService.fetchData(uris);
    return this.dataConverter.convertToQpData(data);
  }

  cancelIndexing(): void {
    this.dataService.cancel();
    this.dataConverter.cancel();
  }

  private isDirectory(uri: vscode.Uri): boolean {
    const name = this.utils.getNameFromUri(uri);
    return !name.includes(".");
  }

  private async indexWithProgressTask(
    progress: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
    token: vscode.CancellationToken
  ): Promise<void> {
    const handleCancellationRequestedSubscription =
      token.onCancellationRequested(
        this.handleCancellationRequested.bind(this)
      );

    const handleDidItemIndexedSubscription = this.dataService.onDidItemIndexed(
      this.handleDidItemIndexed.bind(this, progress)
    );

    await this.indexWorkspace();

    this.resetProgress();
    handleCancellationRequestedSubscription.dispose();
    handleDidItemIndexedSubscription.dispose();

    // necessary for proper way to complete progress
    this.utils.sleep(250);
  }

  private async indexWorkspace(): Promise<void> {
    this.cache.clear();
    const qpData = await this.downloadData();
    this.cache.updateData(qpData);
  }

  private resetProgress() {
    this.currentProgressValue = 0;
    this.progressStep = 0;
  }

  private handleCancellationRequested = () => {
    this.cancelIndexing();
  };

  private handleDidItemIndexed(
    progress: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
    urisCount: number
  ) {
    !this.isProgressStepCalculated() && this.calculateProgressStep(urisCount);
    this.increaseCurrentProgressValue();
    this.reportCurrentProgress(progress);
  }

  private isProgressStepCalculated(): boolean {
    return !!this.progressStep;
  }

  private calculateProgressStep(urisCount: number): void {
    this.progressStep = 100 / urisCount;
  }

  private increaseCurrentProgressValue(): void {
    this.currentProgressValue += this.progressStep;
  }

  private reportCurrentProgress(
    progress: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ): void {
    progress.report({
      increment: this.progressStep,
      message: ` ${
        (progress as any).value
          ? `${Math.round(this.currentProgressValue)}%`
          : ""
      }`,
    });
  }
}

export default WorkspaceCommon;
