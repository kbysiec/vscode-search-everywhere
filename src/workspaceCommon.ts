import { performance } from "perf_hooks";
import * as vscode from "vscode";
import ActionProcessor from "./actionProcessor";
import Cache from "./cache";
import DataConverter from "./dataConverter";
import DataService from "./dataService";
import ActionType from "./enum/actionType";
import Action from "./interface/action";
import QuickPickItem from "./interface/quickPickItem";
import WorkspaceData from "./interface/workspaceData";
import Utils from "./utils";

class WorkspaceCommon {
  fileKind: number = 0;
  progressStep: number = 0;
  currentProgressValue: number = 0;

  constructor(
    private cache: Cache,
    private utils: Utils,
    private dataService: DataService,
    private dataConverter: DataConverter,
    private actionProcessor: ActionProcessor
  ) {}

  getData(): QuickPickItem[] {
    return this.cache.getData() || [];
  }

  async index(comment: string): Promise<void> {
    this.dataService.clearCachedUris();

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

    const startMeasure = this.startTimeMeasurement();
    const data = await this.indexWorkspace();

    this.resetProgress();
    handleCancellationRequestedSubscription.dispose();
    handleDidItemIndexedSubscription.dispose();

    // necessary for proper way to complete progress
    this.utils.sleep(250);

    const elapsedTimeInMs = this.getTimeElapsed(startMeasure);
    const elapsedTimeInSec = this.utils.convertMsToSec(elapsedTimeInMs);

    this.printStats(data, elapsedTimeInSec);
  }

  private startTimeMeasurement() {
    return performance.now();
  }

  private getTimeElapsed(start: number) {
    const end = performance.now();
    return end - start;
  }

  private printStats(data: WorkspaceData, elapsedTime: number) {
    this.utils.printStatsMessage({
      ElapsedTimeInSeconds: elapsedTime,
      ScannedUrisCount: data.items.size,
      IndexedItemsCount: data.count,
    });
  }

  private async indexWorkspace(): Promise<WorkspaceData> {
    this.cache.clear();
    const data = await this.dataService.fetchData();
    const qpData = this.dataConverter.convertToQpData(data);
    this.cache.updateData(qpData);
    return data;
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
