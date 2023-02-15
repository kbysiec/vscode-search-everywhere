import { performance } from "perf_hooks";
import * as vscode from "vscode";
import { actionProcessor } from "./actionProcessor";
import { getData as getDataFromCache, updateData } from "./cache";
import { fetchShouldDisplayNotificationInStatusBar } from "./config";
import { dataConverter } from "./dataConverter";
import { dataService } from "./dataService";
import { onDidItemIndexed } from "./dataServiceEventsEmitter";
import { logger } from "./logger";
import { Action, ActionType, QuickPickItem, WorkspaceData } from "./types";
import { utils } from "./utils";

function getData(): QuickPickItem[] {
  return getDataFromCache() || [];
}

async function index(trigger: string): Promise<void> {
  await registerAction(ActionType.Rebuild, indexWithProgress, trigger);
}

async function indexWithProgress(): Promise<void> {
  utils.hasWorkspaceAnyFolder()
    ? await vscode.window.withProgress(
        {
          location: workspaceCommon.getNotificationLocation(),
          title: workspaceCommon.getNotificationTitle(),
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
  const data = await dataService.fetchData(uris);
  return dataConverter.convertToQpData(data);
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
  const data = await indexWorkspace();

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

async function indexWorkspace(): Promise<WorkspaceData> {
  const data = await dataService.fetchData();
  const qpData = dataConverter.convertToQpData(data);
  updateData(qpData);
  return data;
}

function resetProgress() {
  setCurrentProgressValue(0);
  setProgressStep(0);
  countScannedUri = 0;
}

function handleCancellationRequested() {
  workspaceCommon.cancelIndexing();
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
  return !!workspaceCommon.getProgressStep();
}

function calculateProgressStep(urisCount: number): void {
  setProgressStep(100 / urisCount);
}

function increaseCurrentProgressValue(): void {
  const progressStep = workspaceCommon.getProgressStep();
  const currentProgressValue = workspaceCommon.getCurrentProgressValue();
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
    increment: workspaceCommon.getProgressStep(),
    message: ` ${countScannedUri} / ${urisCount} ... ${`${Math.round(
      workspaceCommon.getCurrentProgressValue()
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

export const workspaceCommon = {
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
