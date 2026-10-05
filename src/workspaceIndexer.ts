import { performance } from "perf_hooks";
import * as vscode from "vscode";
import { actionProcessor } from "./actionProcessor";
import { fetchShouldDisplayNotificationInStatusBar } from "./config";
import { dataConverter } from "./dataConverter";
import { dataService } from "./dataService";
import { database } from "./database";
import { onDidItemIndexed } from "./dataServiceEventsEmitter";
import { logger } from "./logger";
import { Action, ActionType, QuickPickItem, WorkspaceData } from "./types";
import { utils } from "./utils";

function getData(query?: string, limit?: number): QuickPickItem[] {
  if (!database.isReady()) {
    return [];
  }
  return database.search(query || "", limit);
}

async function index(trigger: string): Promise<void> {
  await registerAction(ActionType.Rebuild, indexWithProgress, trigger);
}

async function indexWithProgress(): Promise<void> {
  utils.hasWorkspaceAnyFolder()
    ? await vscode.window.withProgress(
        {
          location: workspaceIndexer.getNotificationLocation(),
          title: workspaceIndexer.getNotificationTitle(),
          cancellable: true,
        },
        indexWithProgressTask
      )
    : utils.printNoFolderOpenedMessage();
}

async function registerAction(
  type: ActionType,
  fn: Function,
  trigger: string,
  uri?: vscode.Uri
): Promise<void> {
  const action: Action = {
    type,
    fn,
    trigger,
    uri,
  };
  await actionProcessor.register(action);
}

async function downloadData(uris?: vscode.Uri[]): Promise<QuickPickItem[]> {
  const items: QuickPickItem[] = [];
  await dataService.fetchData(uris, undefined, (batch) => {
    items.push(...batch);
  });
  return items;
}

function cancelIndexing(): void {
  dataService.cancel();
  dataConverter.cancel();
}

async function indexWithProgressTask(
  progress: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>,
  token: vscode.CancellationToken
): Promise<void> {
  const handleCancellationRequestedSubscription = token.onCancellationRequested(
    handleCancellationRequested
  );

  const handleDidItemIndexedSubscription = onDidItemIndexed(
    handleDidItemIndexed.bind(null, progress)
  );

  const startMeasure = startTimeMeasurement();
  const data = await indexWorkspace(progress);

  resetProgress();
  handleCancellationRequestedSubscription.dispose();
  handleDidItemIndexedSubscription.dispose();

  // necessary for proper way to complete progress
  utils.sleep(250);

  const elapsedTimeInMs = getTimeElapsed(startMeasure);
  const elapsedTimeInSec = utils.convertMsToSec(elapsedTimeInMs);

  printStats(data, elapsedTimeInSec);
}

function startTimeMeasurement() {
  return performance.now();
}

function getTimeElapsed(start: number) {
  const end = performance.now();
  return end - start;
}

function printStats(data: WorkspaceData, elapsedTime: number) {
  const indexStats = {
    ElapsedTimeInSeconds: elapsedTime,
    ScannedUrisCount: data.items.size,
    IndexedItemsCount: data.count,
  };

  utils.printStatsMessage(indexStats);
  logger.logScanTime(indexStats);
  logger.logStructure(data);
}

async function indexWorkspace(
  progress?: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>
): Promise<WorkspaceData> {
  database.clearAll();

  let batch: QuickPickItem[] = [];
  const BATCH_SIZE = 2500;

  const onBatch = (items: QuickPickItem[]) => {
    batch.push(...items);
    if (batch.length >= BATCH_SIZE) {
      database.insertSymbolsBatch(batch);
      batch = [];
    }
  };

  const data = await dataService.fetchData(undefined, progress, onBatch);

  if (batch.length > 0) {
    database.insertSymbolsBatch(batch);
    batch = [];
  }

  progress?.report({ message: "Saving index database..." });
  database.schedulePersist();

  return data;
}

function resetProgress() {
  setCurrentProgressValue(0);
  setProgressStep(0);
  countScannedUri = 0;
}

function handleCancellationRequested() {
  workspaceIndexer.cancelIndexing();
}

function handleDidItemIndexed(
  progress: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>,
  urisCount: number
) {
  !isProgressStepCalculated() && calculateProgressStep(urisCount);
  increaseCurrentProgressValue();
  reportCurrentProgress(progress, urisCount);
}

function isProgressStepCalculated(): boolean {
  return !!workspaceIndexer.getProgressStep();
}

function calculateProgressStep(urisCount: number): void {
  setProgressStep(100 / urisCount);
}

function increaseCurrentProgressValue(): void {
  const progressStep = workspaceIndexer.getProgressStep();
  const currentProgressValue = workspaceIndexer.getCurrentProgressValue();
  setCurrentProgressValue(currentProgressValue + progressStep);
}

function reportCurrentProgress(
  progress: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>,
  urisCount: number
): void {
  countScannedUri++;
  progress.report({
    increment: workspaceIndexer.getProgressStep(),
    message: ` ${countScannedUri} / ${urisCount} ... ${`${Math.round(
      workspaceIndexer.getCurrentProgressValue()
    )}%`}`,
  });
}

function getNotificationLocation(): vscode.ProgressLocation {
  return fetchShouldDisplayNotificationInStatusBar()
    ? vscode.ProgressLocation.Window
    : vscode.ProgressLocation.Notification;
}

function getNotificationTitle(): string {
  return fetchShouldDisplayNotificationInStatusBar()
    ? "Indexing..."
    : "Indexing workspace... file";
}

function setProgressStep(newProgressStep: number) {
  progressStep = newProgressStep;
}

function getProgressStep() {
  return progressStep;
}

function setCurrentProgressValue(newCurrentProgressValue: number) {
  currentProgressValue = newCurrentProgressValue;
}

function getCurrentProgressValue() {
  return currentProgressValue;
}

let progressStep = 0;
let currentProgressValue = 0;
let countScannedUri = 0;

export const workspaceIndexer = {
  getProgressStep,
  getCurrentProgressValue,
  getData,
  index,
  indexWithProgress,
  indexWithProgressTask,
  registerAction,
  downloadData,
  cancelIndexing,
  handleCancellationRequested,
  handleDidItemIndexed,
  getNotificationLocation,
  getNotificationTitle,
};
