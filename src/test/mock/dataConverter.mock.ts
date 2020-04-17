import * as vscode from "vscode";
import QuickPickItem from "../../interface/quickPickItem";

export const itemUntitledUri = vscode.Uri.file("./fake/fake-1.ts");
(itemUntitledUri as any).scheme = "untitled";

const qpItemDocumentSymbolSingleLine: QuickPickItem = {
  label: "test name",
  description: "Module at line: 1",
  detail: "/./fake/fake-1.ts",
  uri: vscode.Uri.file("./fake/fake-1.ts"),
  symbolKind: 1,
  range: {
    start: new vscode.Position(0, 0),
    end: new vscode.Position(0, 0),
  },
};

const qpItemDocumentSymbolSingleLineAny = qpItemDocumentSymbolSingleLine as any;
qpItemDocumentSymbolSingleLineAny.uri._fsPath =
  qpItemDocumentSymbolSingleLineAny.uri.fsPath;
qpItemDocumentSymbolSingleLineAny.detail =
  qpItemDocumentSymbolSingleLineAny.uri.fsPath;
export { qpItemDocumentSymbolSingleLine };

export const qpItemUntitled: QuickPickItem = {
  label: "fake-1.ts",
  uri: itemUntitledUri,
  symbolKind: 0,
};

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
