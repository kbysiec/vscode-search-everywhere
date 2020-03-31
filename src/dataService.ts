import * as vscode from "vscode";

class DataService {
  async getData(): Promise<vscode.Uri[]> {
    const files = await vscode.workspace.findFiles(
      "**/*",
      "**/node_modules/**"
    );
    return files;
  }
}

export default DataService;
