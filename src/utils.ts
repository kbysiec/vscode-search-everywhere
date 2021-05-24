import * as vscode from "vscode";
import WorkspaceData from "./interface/workspaceData";
import Item from "./interface/item";
import Config from "./config";
import QuickPickItem from "./interface/quickPickItem";

class Utils {
  private readonly defaultSection = "searchEverywhere";
  workspaceFoldersCommonPath = "";

  constructor(private config: Config) {
    this.setWorkspaceFoldersCommonPath();
  }

  hasWorkspaceAnyFolder(): boolean {
    return !!(
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length
    );
  }

  hasWorkspaceMoreThanOneFolder(): boolean {
    return !!(
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 1
    );
  }

  hasWorkspaceChanged(event: vscode.WorkspaceFoldersChangeEvent): boolean {
    return !!event.added.length || !!event.removed.length;
  }

  shouldReindexOnConfigurationChange(
    event: vscode.ConfigurationChangeEvent
  ): boolean {
    const shouldUseFilesAndSearchExclude =
      this.config.shouldUseFilesAndSearchExclude();
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
      (shouldUseFilesAndSearchExclude &&
        (event.affectsConfiguration("files.exclude") ||
          event.affectsConfiguration("search.exclude")))
    );
  }

  isDebounceConfigurationToggled(
    event: vscode.ConfigurationChangeEvent
  ): boolean {
    return event.affectsConfiguration("searchEverywhere.shouldUseDebounce");
  }

  printNoFolderOpenedMessage(): void {
    vscode.window.showInformationMessage(
      "Workspace doesn't contain any folder opened"
    );
  }

  printErrorMessage(error: Error): void {
    vscode.window.showInformationMessage(
      `Something went wrong...
      Extension encountered the following error: ${error.stack}`
    );
  }

  createWorkspaceData(): WorkspaceData {
    return {
      items: new Map<string, Item>(),
      count: 0,
    };
  }

  clearWorkspaceData(workspaceData: WorkspaceData) {
    workspaceData.items.clear();
    workspaceData.count = 0;
  }

  getSplitter(): string {
    return "§&§";
  }

  getUrisForDirectoryPathUpdate(
    data: QuickPickItem[],
    uri: vscode.Uri,
    fileKind: number
  ): vscode.Uri[] {
    return data
      .filter(
        (qpItem: QuickPickItem) =>
          qpItem.uri.fsPath.includes(uri.fsPath) && qpItem.kind === fileKind
      )
      .map((qpItem: QuickPickItem) => qpItem.uri);
  }

  getNotificationLocation(): vscode.ProgressLocation {
    return this.config.shouldDisplayNotificationInStatusBar()
      ? vscode.ProgressLocation.Window
      : vscode.ProgressLocation.Notification;
  }

  getNotificationTitle(): string {
    return this.config.shouldDisplayNotificationInStatusBar()
      ? "Indexing..."
      : "Indexing workspace files and symbols...";
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  countWordInstances(text: string, word: string): number {
    return text.split(word).length - 1;
  }

  getNthIndex(text: string, word: string, occurrenceNumber: number): number {
    let index = -1;
    while (occurrenceNumber-- && index++ < text.length) {
      index = text.indexOf(word, index);
      if (index < 0) {
        break;
      }
    }
    return index;
  }

  getLastFromArray<T>(array: T[], predicate: (item: T) => boolean): T {
    return [...array].reverse().find(predicate) as T;
  }

  groupBy<T>(
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

  getNameFromUri(uri: vscode.Uri): string {
    return uri.path.split("/").pop() as string;
  }

  updateQpItemsWithNewDirectoryPath(
    data: QuickPickItem[],
    oldDirectoryUri: vscode.Uri,
    newDirectoryUri: vscode.Uri
  ): QuickPickItem[] {
    const normalizedOldDirectoryUriPath = this.normalizeUriPath(
      oldDirectoryUri.fsPath
    );
    let normalizedNewDirectoryUriPath = this.normalizeUriPath(
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

  normalizeUriPath(path: string): string {
    const workspaceFoldersPaths = this.getWorkspaceFoldersPaths();
    let normalizedPath = path;

    if (this.hasWorkspaceMoreThanOneFolder()) {
      normalizedPath = normalizedPath.replace(
        this.workspaceFoldersCommonPath,
        ""
      );
    } else {
      workspaceFoldersPaths.forEach((wfPath: string) => {
        normalizedPath = normalizedPath.replace(wfPath, "");
      });
    }

    return normalizedPath;
  }

  private getWorkspaceFoldersPaths(): string[] {
    return (
      (vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.map(
          (wf: vscode.WorkspaceFolder) => wf.uri.fsPath
        )) ||
      []
    );
  }

  private setWorkspaceFoldersCommonPath() {
    if (this.hasWorkspaceMoreThanOneFolder()) {
      const workspaceFoldersPaths = this.getWorkspaceFoldersPaths();
      const workspaceFoldersCommonPathTemp = this.getCommonSubstringFromStart(
        workspaceFoldersPaths
      );
      const workspaceFoldersCommonPathArray =
        workspaceFoldersCommonPathTemp.split("/");
      workspaceFoldersCommonPathArray.pop();
      this.workspaceFoldersCommonPath =
        workspaceFoldersCommonPathArray.join("/");
    }
  }

  private getCommonSubstringFromStart(strings: string[]) {
    const A = strings.concat().sort(),
      a1 = A[0],
      a2 = A[A.length - 1],
      L = a1.length;
    let i = 0;

    while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
    return a1.substring(0, i);
  }
}

export default Utils;
