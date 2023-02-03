import * as vscode from "vscode";
import { IndexStats, Item, QuickPickItem, WorkspaceData } from "./types";

function getWorkspaceFoldersPaths(): string[] {
  return (
    (vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.map(
        (wf: vscode.WorkspaceFolder) => wf.uri.path
      )) ||
    []
  );
}

function getCommonSubstringFromStart(strings: string[]) {
  const A = strings.concat().sort(),
    a1 = A[0],
    a2 = A[A.length - 1],
    L = a1.length;
  let i = 0;

  while (i < L && a1.charAt(i) === a2.charAt(i)) {
    i++;
  }
  return a1.substring(0, i);
}

function hasWorkspaceAnyFolder(): boolean {
  return !!(
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length
  );
}

function hasWorkspaceMoreThanOneFolder(): boolean {
  return !!(
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 1
  );
}

function hasWorkspaceChanged(
  event: vscode.WorkspaceFoldersChangeEvent
): boolean {
  return !!event.added.length || !!event.removed.length;
}

function isDebounceConfigurationToggled(
  event: vscode.ConfigurationChangeEvent
): boolean {
  return event.affectsConfiguration("searchEverywhere.shouldUseDebounce");
}

function isSortingConfigurationToggled(
  event: vscode.ConfigurationChangeEvent
): boolean {
  return event.affectsConfiguration("searchEverywhere.shouldItemsBeSorted");
}

function printNoFolderOpenedMessage(): void {
  vscode.window.showInformationMessage(
    "Workspace doesn't contain any folder opened"
  );
}

function printErrorMessage(error: Error): void {
  vscode.window.showInformationMessage(
    `Something went wrong...
    Extension encountered the following error: ${error.stack}`
  );
}

function printStatsMessage(indexStats: IndexStats): void {
  vscode.window.showInformationMessage(
    `Elapsed time: ${indexStats.ElapsedTimeInSeconds}s
     Scanned files: ${indexStats.ScannedUrisCount}
     Indexed items: ${indexStats.IndexedItemsCount}`
  );
}

function createWorkspaceData(): WorkspaceData {
  return {
    items: new Map<string, Item>(),
    count: 0,
  };
}

function clearWorkspaceData(workspaceData: WorkspaceData) {
  workspaceData.items.clear();
  workspaceData.count = 0;
}

function getSplitter(): string {
  return "§&§";
}

function getUrisForDirectoryPathUpdate(
  data: QuickPickItem[],
  uri: vscode.Uri,
  fileKind: number
): vscode.Uri[] {
  return data
    .filter(
      (qpItem: QuickPickItem) =>
        qpItem.uri.path.includes(uri.path) && qpItem.symbolKind === fileKind
    )
    .map((qpItem: QuickPickItem) => qpItem.uri);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleepAndExecute(ms: number, fn: Function): Promise<void> {
  setTimeout(async () => {
    await fn();
  }, ms);
}

function countWordInstances(text: string, word: string): number {
  return text.split(word).length - 1;
}

function getNthIndex(
  text: string,
  word: string,
  occurrenceNumber: number
): number {
  let index = -1;
  while (occurrenceNumber-- && index++ < text.length) {
    index = text.indexOf(word, index);
    if (index < 0) {
      break;
    }
  }
  return index;
}

function getLastFromArray<T>(array: T[], predicate: (item: T) => boolean): T {
  return [...array].reverse().find(predicate) as T;
}

function groupBy<T>(
  array: T[],
  keyGetter: (...args: any[]) => string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  array.forEach((item: T) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    !collection ? map.set(key, [item]) : collection.push(item);
  });
  return map;
}

function getNameFromUri(uri: vscode.Uri): string {
  return uri.path.split("/").pop() as string;
}

function updateQpItemsWithNewDirectoryPath(
  data: QuickPickItem[],
  oldDirectoryUri: vscode.Uri,
  newDirectoryUri: vscode.Uri
): QuickPickItem[] {
  const normalizedOldDirectoryUriPath = utils.normalizeUriPath(
    oldDirectoryUri.path
  );
  let normalizedNewDirectoryUriPath = utils.normalizeUriPath(
    newDirectoryUri.path
  );

  return data.map((qpItem: QuickPickItem) => {
    if (qpItem.uri.path.includes(oldDirectoryUri.path)) {
      qpItem.detail = qpItem.detail!.replace(
        normalizedOldDirectoryUriPath,
        normalizedNewDirectoryUriPath
      );
      const newUriPath = qpItem.uri.path.replace(
        normalizedOldDirectoryUriPath,
        normalizedNewDirectoryUriPath
      );
      qpItem.uri = vscode.Uri.file(newUriPath);
      (qpItem.uri as any)._fsPath = qpItem.uri.path;
    }
    return qpItem;
  });
}

function normalizeUriPath(path: string): string {
  const workspaceFoldersPaths = getWorkspaceFoldersPaths();
  let normalizedPath = path;

  if (utils.hasWorkspaceMoreThanOneFolder()) {
    normalizedPath = normalizedPath.replace(
      utils.getWorkspaceFoldersCommonPathProp(),
      ""
    );
  } else {
    workspaceFoldersPaths.forEach((wfPath: string) => {
      normalizedPath = normalizedPath.replace(wfPath, "");
    });
  }

  return normalizedPath;
}

function isDirectory(uri: vscode.Uri): boolean {
  const name = utils.getNameFromUri(uri);
  return !name.includes(".");
}

function convertMsToSec(timeInMs: number) {
  return Math.floor((timeInMs % (1000 * 60)) / 1000);
}

function getDataForBuildingStructure(data: WorkspaceData) {
  const uriWithNoOfItems = Array.from(data.items).map((keyValue) => {
    const [key, value] = keyValue;
    let normalizedPath = utils.normalizeUriPath(key);
    normalizedPath = normalizedPath.replace("/", "");
    const itemsCount = value.elements.length;
    return [normalizedPath, itemsCount] as const;
  });
  return new Map<string, number>(uriWithNoOfItems);
}

function buildStructure(paths: string[], normalizedData: Map<string, number>) {
  const structure: { [key: string]: {} } = {};
  paths.forEach(function (path) {
    const splittedPath = path.split("/");
    splittedPath.reduce((currentStructure, node, index) => {
      let text: {} | string = {};
      if (index === splittedPath.length - 1) {
        const value = normalizedData.get(path) || 0;
        text = `${value} ${value === 1 ? "item" : "items"}`;
      }
      return currentStructure[node] || (currentStructure[node] = text);
    }, structure);
  });
  return structure;
}

function getStructure(data: WorkspaceData) {
  const normalizedData = getDataForBuildingStructure(data);
  const paths = Array.from(normalizedData.keys());
  const structure = buildStructure(paths, normalizedData);

  return JSON.stringify(structure, null, 2);
}

function setWorkspaceFoldersCommonPath() {
  if (utils.hasWorkspaceMoreThanOneFolder()) {
    const workspaceFoldersPaths = getWorkspaceFoldersPaths();
    const workspaceFoldersCommonPathTemp = getCommonSubstringFromStart(
      workspaceFoldersPaths
    );
    const workspaceFoldersCommonPathArray =
      workspaceFoldersCommonPathTemp.split("/");
    workspaceFoldersCommonPathArray.pop();

    setWorkspaceFoldersCommonPathProp(
      workspaceFoldersCommonPathArray.join("/")
    );
  }
}

let workspaceFoldersCommonPath = "";

function setWorkspaceFoldersCommonPathProp(
  newWorkspaceFoldersCommonPath: string
) {
  workspaceFoldersCommonPath = newWorkspaceFoldersCommonPath;
}

function getWorkspaceFoldersCommonPathProp() {
  return workspaceFoldersCommonPath;
}

export const utils = {
  getWorkspaceFoldersCommonPathProp,
  hasWorkspaceAnyFolder,
  hasWorkspaceMoreThanOneFolder,
  hasWorkspaceChanged,
  isDebounceConfigurationToggled,
  isSortingConfigurationToggled,
  printNoFolderOpenedMessage,
  printErrorMessage,
  printStatsMessage,
  createWorkspaceData,
  clearWorkspaceData,
  getSplitter,
  getUrisForDirectoryPathUpdate,
  sleep,
  sleepAndExecute,
  countWordInstances,
  getNthIndex,
  getLastFromArray,
  groupBy,
  getNameFromUri,
  updateQpItemsWithNewDirectoryPath,
  normalizeUriPath,
  isDirectory,
  convertMsToSec,
  getStructure,
  setWorkspaceFoldersCommonPath,
};
