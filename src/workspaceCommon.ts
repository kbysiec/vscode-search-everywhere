import { performance } from "perf_hooks";
import * as vscode from "vscode";
import { actionProcessor } from "./actionProcessor";
import { clear, getData, updateData } from "./cache";
import { fetchShouldDisplayNotificationInStatusBar } from "./config";
import { dataConverter } from "./dataConverter";
import { dataService } from "./dataService";
import { onDidItemIndexed } from "./dataServiceEventsEmitter";
import ActionType from "./enum/actionType";
import Action from "./interface/action";
import QuickPickItem from "./interface/quickPickItem";
import WorkspaceData from "./interface/workspaceData";
import { utils } from "./utils";

class WorkspaceCommon {
  fileKind: number = 0;
  progressStep: number = 0;
  currentProgressValue: number = 0;

  constructor() {}

  getData(): QuickPickItem[] {
    return getData() || [];
  }

  async index(comment: string): Promise<void> {
    dataService.clearCachedUris();

    await this.registerAction(
      ActionType.Rebuild,
      this.indexWithProgress.bind(this),
      comment
    );
  }

  async indexWithProgress(): Promise<void> {
    utils.hasWorkspaceAnyFolder()
      ? await vscode.window.withProgress(
          {
            location: this.getNotificationLocation(),
            title: this.getNotificationTitle(),
            cancellable: true,
          },
          this.indexWithProgressTask.bind(this)
        )
      : utils.printNoFolderOpenedMessage();
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
    await actionProcessor.register(action);
  }

  async downloadData(uris?: vscode.Uri[]): Promise<QuickPickItem[]> {
    const data = await dataService.fetchData(uris);
    return dataConverter.convertToQpData(data);
  }

  cancelIndexing(): void {
    dataService.cancel();
    dataConverter.cancel();
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

    const handleDidItemIndexedSubscription = onDidItemIndexed(
      this.handleDidItemIndexed.bind(this, progress)
    );

    const startMeasure = this.startTimeMeasurement();
    const data = await this.indexWorkspace();

    this.resetProgress();
    handleCancellationRequestedSubscription.dispose();
    handleDidItemIndexedSubscription.dispose();

    // necessary for proper way to complete progress
    utils.sleep(250);

    const elapsedTimeInMs = this.getTimeElapsed(startMeasure);
    const elapsedTimeInSec = utils.convertMsToSec(elapsedTimeInMs);

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
    utils.printStatsMessage({
      ElapsedTimeInSeconds: elapsedTime,
      ScannedUrisCount: data.items.size,
      IndexedItemsCount: data.count,
    });
  }

  private async indexWorkspace(): Promise<WorkspaceData> {
    clear();
    const data = await dataService.fetchData();
    const qpData = dataConverter.convertToQpData(data);
    updateData(qpData);
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

  private getNotificationLocation(): vscode.ProgressLocation {
    return fetchShouldDisplayNotificationInStatusBar()
      ? vscode.ProgressLocation.Window
      : vscode.ProgressLocation.Notification;
  }

  private getNotificationTitle(): string {
    return fetchShouldDisplayNotificationInStatusBar()
      ? "Indexing..."
      : "Indexing workspace files and symbols...";
  }
}

export default WorkspaceCommon;
