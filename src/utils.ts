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
}

export default Utils;
