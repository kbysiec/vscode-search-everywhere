import { performance } from "perf_hooks";
import * as vscode from "vscode";
import { actionProcessor } from "./actionProcessor";
import { clear, getData as getDataFromCache, updateData } from "./cache";
import { fetchShouldDisplayNotificationInStatusBar } from "./config";
import { dataConverter } from "./dataConverter";
import { dataService } from "./dataService";
import { onDidItemIndexed } from "./dataServiceEventsEmitter";
import ActionType from "./enum/actionType";
import Action from "./interface/action";
import QuickPickItem from "./interface/quickPickItem";
import WorkspaceData from "./interface/workspaceData";
import { utils } from "./utils";

function getData(): QuickPickItem[] {
  return getDataFromCache() || [];
}

async function index(comment: string): Promise<void> {
  dataService.clearCachedUris();

  await registerAction(ActionType.Rebuild, indexWithProgress, comment);
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
  utils.printStatsMessage({
    ElapsedTimeInSeconds: elapsedTime,
    ScannedUrisCount: data.items.size,
    IndexedItemsCount: data.count,
  });
}

async function indexWorkspace(): Promise<WorkspaceData> {
  clear();
  const data = await dataService.fetchData();
  const qpData = dataConverter.convertToQpData(data);
  updateData(qpData);
  return data;
}

function resetProgress() {
  setCurrentProgressValue(0);
  setProgressStep(0);
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
  reportCurrentProgress(progress);
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
  }>
): void {
  progress.report({
    increment: workspaceCommon.getProgressStep(),
    message: ` ${
      (progress as any).value
        ? `${Math.round(workspaceCommon.getCurrentProgressValue())}%`
        : ""
    }`,
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
    : "Indexing workspace files and symbols...";
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
