import * as vscode from "vscode";

export const items: vscode.Uri[] = [
  "./fake/fake-1.ts",
  "./fake/fake-2.ts"
].map((path: string) => vscode.Uri.file(path));
