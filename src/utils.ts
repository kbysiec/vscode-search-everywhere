import * as vscode from "vscode";
import WorkspaceData from "./interface/workspaceData";
import Item from "./interface/item";

class Utils {
  hasWorkspaceAnyFolder(): boolean {
    return !!(
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length
    );
  }

  hasWorkspaceChanged(event: vscode.WorkspaceFoldersChangeEvent): boolean {
    return !!event.added.length || !!event.removed.length;
  }

  hasConfigurationChanged(event: vscode.ConfigurationChangeEvent): boolean {
    return event.affectsConfiguration("searchEverywhere");
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

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getSplitter(): string {
    return "§&§";
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
}

export default Utils;
