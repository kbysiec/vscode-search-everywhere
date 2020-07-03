import * as vscode from "vscode";
import WorkspaceData from "./interface/workspaceData";
import Item from "./interface/item";
import Config from "./config";
import QuickPickItem from "./interface/quickPickItem";

class Utils {
  private readonly defaultSection = "searchEverywhere";

  constructor(private config: Config) {}

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
    const shouldUseFilesAndSearchExclude = this.config.shouldUseFilesAndSearchExclude();
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
      `Something went wrong... Extension encountered the following error: ${error.message}`
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

  updateUrisWithNewDirectoryName(
    uris: vscode.Uri[],
    oldDirectoryUri: vscode.Uri,
    newDirectoryUri: vscode.Uri
  ): vscode.Uri[] {
    return uris.map((oldUri: vscode.Uri) => {
      const path = oldUri.fsPath.replace(
        oldDirectoryUri.fsPath,
        newDirectoryUri.fsPath
      );
      return vscode.Uri.file(path);
    });
  }

  getNotificationLocation(): vscode.ProgressLocation {
    const shouldDisplayNotificationInStatusBar = this.config.shouldDisplayNotificationInStatusBar();
    return shouldDisplayNotificationInStatusBar
      ? vscode.ProgressLocation.Window
      : vscode.ProgressLocation.Notification;
  }

  getNotificationTitle(): string {
    const shouldDisplayNotificationInStatusBar = this.config.shouldDisplayNotificationInStatusBar();
    return shouldDisplayNotificationInStatusBar
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
    const length = text.length;
    let index = -1;
    while (occurrenceNumber-- && index++ < length) {
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
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }
}

export default Utils;
