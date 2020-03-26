import * as vscode from "vscode";
import QuickPickItem from "../../interface/quickPickItem";

export const qpItem: QuickPickItem = {
  label: "fake-1.ts",
  uri: vscode.Uri.file("./fake/fake-1.ts"),
  symbolKind: 0
};

export const qpItems: QuickPickItem[] = [
  {
    label: "fake-1.ts",
    uri: vscode.Uri.file("./fake/fake-1.ts"),
    symbolKind: 0
  },
  {
    label: "fake-2.ts",
    uri: vscode.Uri.file("./fake/fake-2.ts"),
    symbolKind: 0
  }
];
