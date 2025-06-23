import * as vscode from "vscode";

export const flatDocumentSymbolItems: vscode.DocumentSymbol[] = [
  {
    name: "test name 1",
    detail: "test details 1",
    kind: 1,
    range: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    selectionRange: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    children: [],
  },
  {
    name: "test name 1§&§test child name 1",
    detail: "test child details 1",
    kind: 1,
    range: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    selectionRange: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    children: [],
  },
  {
    name: "test name 2",
    detail: "test details 2",
    kind: 1,
    range: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    selectionRange: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    children: [],
  },
  {
    name: "test name 2§&§test child name 2",
    detail: "test child details 2",
    kind: 1,
    range: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    selectionRange: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    children: [],
  },
];
