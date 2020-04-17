import * as vscode from "vscode";

export const uriItem = vscode.Uri.file("./fake/fake-1.ts");

export const items: vscode.Uri[] = [
  "./fake/fake-1.ts",
  "./fake/fake-2.ts",
].map((path: string) => vscode.Uri.file(path));

export const documentSymbolItems: vscode.DocumentSymbol[] = [
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
    children: [
      {
        name: "test name 3",
        detail: "test details 3",
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
    ],
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
];

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
    name: "test name 1§&§test name 3",
    detail: "test details 3",
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
];

export const documentSymbolItemWithChildren: vscode.DocumentSymbol = {
  name: "test name 1",
  detail: "test details 1",
  kind: 1,
  range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
  selectionRange: new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(0, 0)
  ),
  children: [
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
  ],
};
