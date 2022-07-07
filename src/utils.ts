import * as vscode from "vscode";
import IndexStats from "./interface/indexStats";
import Item from "./interface/item";
import QuickPickItem from "./interface/quickPickItem";
import WorkspaceData from "./interface/workspaceData";

function getWorkspaceFoldersPaths(): string[] {
  return (
    (vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.map(
        (wf: vscode.WorkspaceFolder) => wf.uri.fsPath
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
        qpItem.uri.fsPath.includes(uri.fsPath) && qpItem.symbolKind === fileKind
    )
    .map((qpItem: QuickPickItem) => qpItem.uri);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    oldDirectoryUri.fsPath
  );
  let normalizedNewDirectoryUriPath = utils.normalizeUriPath(
    newDirectoryUri.fsPath
  );

  return data.map((qpItem: QuickPickItem) => {
    if (qpItem.uri.fsPath.includes(oldDirectoryUri.fsPath)) {
      qpItem.detail = qpItem.detail!.replace(
        normalizedOldDirectoryUriPath,
        normalizedNewDirectoryUriPath
      );
      const newUriPath = qpItem.uri.fsPath.replace(
        normalizedOldDirectoryUriPath,
        normalizedNewDirectoryUriPath
      );
      qpItem.uri = vscode.Uri.file(newUriPath);
      (qpItem.uri as any)._fsPath = qpItem.uri.fsPath;
    }
    return qpItem;
  });
}

function normalizeUriPath(path: string): string {
  const workspaceFoldersPaths = getWorkspaceFoldersPaths();
  let normalizedPath = path;

  if (utils.hasWorkspaceMoreThanOneFolder()) {
    normalizedPath = normalizedPath.replace(
      // utils.workspaceFoldersCommonPath,
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
  printNoFolderOpenedMessage,
  printErrorMessage,
  printStatsMessage,
  createWorkspaceData,
  clearWorkspaceData,
  getSplitter,
  getUrisForDirectoryPathUpdate,
  sleep,
  countWordInstances,
  getNthIndex,
  getLastFromArray,
  groupBy,
  getNameFromUri,
  updateQpItemsWithNewDirectoryPath,
  normalizeUriPath,
  isDirectory,
  convertMsToSec,
  setWorkspaceFoldersCommonPath,
};
