import * as vscode from "vscode";
import QuickPickItem from "../../interface/quickPickItem";

export const qpItem: QuickPickItem = {
  label: "fake-1.ts",
  uri: vscode.Uri.file("./fake/fake-1.ts"),
  symbolKind: 0,
};

const qpItems: QuickPickItem[] = [
  {
    label: "fake-1.ts",
    description: "File",
    detail: "/./fake/fake-1.ts",
    uri: vscode.Uri.file("./fake/fake-1.ts"),
    symbolKind: 0,
    range: {
      start: new vscode.Position(0, 0),
      end: new vscode.Position(0, 0),
    },
  },
  {
    label: "fake-2.ts",
    description: "File",
    detail: "\\.\\fake\\fake-2.ts",
    uri: vscode.Uri.file("./fake/fake-2.ts"),
    symbolKind: 0,
    range: {
      start: new vscode.Position(0, 0),
      end: new vscode.Position(0, 0),
    },
  },
];

qpItems.forEach((qpItem: any) => {
  qpItem.uri._fsPath = qpItem.uri.fsPath;
  qpItem.detail = qpItem.uri.fsPath;
});
export { qpItems };

export const item: vscode.Uri = vscode.Uri.file(
  "./test/path/to/workspace/fake/fake-1.ts"
);

export const items: vscode.Uri[] = [
  "./fake/fake-1.ts",
  "./fake/fake-2.ts",
].map((path: string) => vscode.Uri.file(path));

export const workspaceFolders: vscode.WorkspaceFolder[] = [
  {
    index: 0,
    name: "/test/path/to/workspace",
    uri: vscode.Uri.file("/test/path/to/workspace"),
  },
  {
    index: 1,
    name: "/test2/path2/to2/workspace2",
    uri: vscode.Uri.file("/test2/path2/to2/workspace2"),
  },
];
