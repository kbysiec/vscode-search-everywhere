import * as vscode from "vscode";
import QuickPickItem from "../../interface/quickPickItem";

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
