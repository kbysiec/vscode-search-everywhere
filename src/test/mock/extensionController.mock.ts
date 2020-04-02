import * as vscode from "vscode";
import QuickPickItem from "../../interface/quickPickItem";

export const qpItem: QuickPickItem = {
  label: "fake-1.ts",
  uri: vscode.Uri.file("./fake/fake-1.ts"),
  symbolKind: 0,
  range: {
    start: new vscode.Position(0, 0),
    end: new vscode.Position(0, 0)
  }
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

export const items: vscode.Uri[] = [
  "./fake/fake-1.ts",
  "./fake/fake-2.ts"
].map((path: string) => vscode.Uri.file(path));

export const itemUntitledUri = vscode.Uri.file("./fake/fake-1.ts");
(itemUntitledUri as any).scheme = "untitled";

export const qpItemUntitled: QuickPickItem = {
  label: "fake-1.ts",
  uri: itemUntitledUri,
  symbolKind: 0
};
