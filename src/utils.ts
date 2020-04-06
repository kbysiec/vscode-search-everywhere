import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";

class Utils {
  hasWorkspaceAnyFolder(): boolean {
    return !!(
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length
    );
  }

  prepareQpData(data: vscode.Uri[]): QuickPickItem[] {
    return this.mapDataToQpData(data);
  }

  private mapDataToQpData(data: vscode.Uri[]): QuickPickItem[] {
    const qpData: QuickPickItem[] = [];

    data.forEach((uri: vscode.Uri) => {
      qpData.push(this.mapUriToQpItem(uri));
    });
    return qpData;
  }

  private mapUriToQpItem(uri: vscode.Uri): QuickPickItem {
    const symbolKind = 0;
    const name = uri.path.split("/").pop();
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(0, 0);

    const description = "File";

    return {
      uri,
      symbolKind,
      range: {
        start,
        end,
      },
      label: name,
      detail: this.normalizeUriPath(uri.fsPath),
      description,
    } as QuickPickItem;
  }

  private normalizeUriPath(path: string): string {
    const workspaceFoldersPaths = this.getWorkspaceFoldersPaths();
    let normalizedPath = path;
    workspaceFoldersPaths.forEach((wfPath: string) => {
      normalizedPath = normalizedPath.replace(wfPath, "");
    });

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
}

export default Utils;
