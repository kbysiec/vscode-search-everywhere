import * as vscode from "vscode";

export const getDirectory = (path: string): vscode.Uri => {
  return vscode.Uri.file(path);
};

export const getUntitledItem = (): vscode.Uri => {
  const itemUntitledUri = vscode.Uri.file("./fake/fake-1.ts");
  (itemUntitledUri as any).scheme = "untitled";
  return itemUntitledUri;
};

export const getItem = (
  path: string = "/./fake/",
  suffix: string | number = 1,
  fixPrivateFsPathProperty: boolean = false
): vscode.Uri => {
  const item = vscode.Uri.file(`${path}fake-${suffix ? `${suffix}` : ""}.ts`);
  fixPrivateFsPathProperty && ((item as any)._fsPath = item.path);
  return item;
};

export const getItems = (
  count: number = 2,
  path: string = "/./fake/",
  suffixStartOffset: number = 0,
  fixPrivateFsPathProperty: boolean = false
): vscode.Uri[] => {
  const array: vscode.Uri[] = [];
  for (let i = 1; i <= count; i++) {
    array.push(getItem(path, i + suffixStartOffset, fixPrivateFsPathProperty));
  }
  return array;
};

export const getDocumentSymbolItemSingleLine = (
  suffix?: string | number,
  withChild: boolean = false,
  kind: number = 1
): vscode.DocumentSymbol => {
  return {
    name: `test name${suffix ? ` ${suffix}` : ""}`,
    detail: `test details${suffix ? ` ${suffix}` : ""}`,
    kind,
    range: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    selectionRange: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0)
    ),
    children: withChild
      ? [
          {
            name: `test child name${suffix ? ` ${suffix}` : ""}`,
            detail: `test child details${suffix ? ` ${suffix}` : ""}`,
            kind,
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
        ]
      : [],
  };
};

export const getDocumentSymbolItemSingleLineArray = (
  count: number = 0,
  withChild: boolean = false,
  kind: number = 1,
  kindsFromFirstItem: number[] = []
): vscode.DocumentSymbol[] => {
  const array: vscode.DocumentSymbol[] = [];
  for (let i = 0; i < count; i++) {
    array.push(
      getDocumentSymbolItemSingleLine(
        i + 1,
        withChild,
        kindsFromFirstItem[i] ? kindsFromFirstItem[i] : kind
      )
    );
  }
  return array;
};

export const getDocumentSymbolItemMultiLine = (
  withParent: boolean = false
): vscode.DocumentSymbol => {
  return {
    name: `${withParent ? "test parent§&§" : ""}test name`,
    detail: "test details",
    kind: 1,
    range: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(3, 0)
    ),
    selectionRange: new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(3, 0)
    ),
    children: [],
  };
};
