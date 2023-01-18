import * as vscode from "vscode";
import { ItemsFilterPhrases, QuickPickItem } from "../../types";
import { getUntitledItem } from "./itemMockFactory";
import { getConfiguration } from "./mockFactory";

export const getQpItem = (
  path: string = "/./fake/",
  suffix: string | number = 1,
  differentStartAndEnd: boolean = false,
  withIcon: boolean = false,
  withFilterPhrase: boolean = false,
  symbolKind: number = 0
): QuickPickItem => {
  const configuration = getConfiguration().searchEverywhere;
  const icons = configuration.icons;
  const itemsFilterPhrases = configuration.itemsFilterPhrases;
  const qpItem = {
    label: `${withIcon ? `$(${icons[symbolKind]})  ` : ""}fake-${
      suffix ? `${suffix}` : ""
    }.ts`,
    description: `${
      withFilterPhrase
        ? `[${itemsFilterPhrases[symbolKind]}fake-${
            suffix ? `${suffix}` : ""
          }.ts] `
        : ""
    }File`,
    detail: `${path}fake-${suffix ? `${suffix}` : ""}.ts`,
    uri: vscode.Uri.file(`${path}fake-${suffix ? `${suffix}` : ""}.ts`),
    symbolKind,
    range: {
      start: new vscode.Position(0, 0),
      end: differentStartAndEnd
        ? new vscode.Position(0, 5)
        : new vscode.Position(0, 0),
    },
    buttons: [
      {
        iconPath: new vscode.ThemeIcon("open-preview"),
        tooltip: "Open to the side",
      },
    ],
  };
  const qpItemAny = qpItem as any;
  qpItemAny.uri._fsPath = qpItemAny.uri.path;
  qpItemAny.detail = qpItemAny.uri.path;

  return qpItem;
};

export const getUntitledQpItem = (): QuickPickItem => {
  return {
    label: "fake-1.ts",
    uri: getUntitledItem(),
    symbolKind: 0,
    range: {
      start: new vscode.Position(0, 0),
      end: new vscode.Position(0, 5),
    },
  };
};

export const getQpItems = (
  count: number = 2,
  path: string = "/./fake/",
  suffixStartOffset: number = 0,
  withIcon: boolean = false
): QuickPickItem[] => {
  const array: QuickPickItem[] = [];
  for (let i = 1; i <= count; i++) {
    array.push(getQpItem(path, i + suffixStartOffset, withIcon));
  }
  return array;
};

export const getQpItemsSymbolAndUri = (
  path: string = "/./fake/"
): QuickPickItem[] => {
  const qpItemsSymbolAndUri: QuickPickItem[] = [
    {
      label: "fake-2.ts",
      description: "File",
      detail: `${path}fake-2.ts`,
      uri: vscode.Uri.file(`${path}fake-2.ts`),
      symbolKind: 0,
      range: {
        start: new vscode.Position(0, 0),
        end: new vscode.Position(0, 0),
      },
    },
    {
      label: "test symbol name",
      description: "Module at lines: 1 - 3 in test parent",
      detail: `${path}fake-2.ts`,
      uri: vscode.Uri.file(`${path}fake-2.ts`),
      symbolKind: 1,
      range: {
        start: new vscode.Position(0, 0),
        end: new vscode.Position(3, 0),
      },
    },
  ];

  qpItemsSymbolAndUri.forEach((qpItem: any) => {
    qpItem.uri._fsPath = qpItem.uri.path;
    qpItem.detail = qpItem.uri.path;
  });

  return qpItemsSymbolAndUri;
};

export const getQpItemsSymbolAndUriExt = (
  path: string = "/./fake/"
): QuickPickItem[] => {
  const qpItemsSymbolAndUriExt: QuickPickItem[] = [
    {
      label: "fake-2.ts",
      description: "File",
      detail: `${path}fake-2.ts`,
      uri: vscode.Uri.file(`${path}fake-2.ts`),
      symbolKind: 0,
      range: {
        start: new vscode.Position(0, 0),
        end: new vscode.Position(0, 0),
      },
    },
    {
      label: "test symbol name",
      description: "Module at lines: 1 - 3 in test parent",
      detail: `${path}fake-2.ts`,
      uri: vscode.Uri.file(`${path}fake-2.ts`),
      symbolKind: 1,
      range: {
        start: new vscode.Position(0, 0),
        end: new vscode.Position(3, 0),
      },
    },
  ];

  qpItemsSymbolAndUriExt.forEach((qpItem: any) => {
    qpItem.uri._fsPath = qpItem.uri.path;
    qpItem.detail = qpItem.uri.path;
  });

  return qpItemsSymbolAndUriExt;
};

export const getQpItemDocumentSymbolSingleLine = (
  withIcon: boolean = false,
  withFilterPhrase: boolean = false
): QuickPickItem => {
  const configuration = getConfiguration().searchEverywhere;
  const icons = configuration.icons;
  const itemsFilterPhrases = configuration.itemsFilterPhrases;
  const symbolKind = 1;
  const qpItem = {
    label: `${withIcon ? `$(${icons[symbolKind]})  ` : ""}test name`,
    description: `${
      withFilterPhrase ? `[${itemsFilterPhrases[symbolKind]}test name] ` : ""
    }Module at line: 1`,
    detail: "/./fake/fake-1.ts",
    uri: vscode.Uri.file("./fake/fake-1.ts"),
    symbolKind,
    range: {
      start: new vscode.Position(0, 0),
      end: new vscode.Position(0, 0),
    },
  } as QuickPickItem;

  const qpItemAny = qpItem as any;
  qpItemAny.uri._fsPath = qpItemAny.uri.path;
  qpItemAny.detail = qpItemAny.uri.path;
  return qpItem;
};

export const getDocumentSymbolQpItemMultiLine = (
  withParent: boolean = false
): QuickPickItem => {
  const qpItem = {
    label: "test name",
    description: `Module at lines: 1 - 3${withParent ? " in test parent" : ""}`,
    detail: "/./fake/fake-1.ts",
    uri: vscode.Uri.file("./fake/fake-1.ts"),
    symbolKind: 1,
    range: {
      start: new vscode.Position(0, 0),
      end: new vscode.Position(3, 0),
    },
  };
  const qpItemAny = qpItem as any;
  qpItemAny.uri._fsPath = qpItemAny.uri.path;
  qpItemAny.detail = qpItemAny.uri.path;

  return qpItem;
};

export const getQpHelpItem = (
  helpPhrase: string = "?",
  kind: string,
  itemFilterPhrase: string
): QuickPickItem => {
  const qpItem = {
    label: `${helpPhrase} Type ${itemFilterPhrase} for limit results to ${
      vscode.SymbolKind[Number(kind)]
    } only`,
    symbolKind: Number(kind),
    isHelp: true,
    uri: vscode.Uri.parse("#"),
  };

  return qpItem;
};

export const getQpHelpItems = (
  helpPhrase: string = "?",
  itemFilterPhrases: ItemsFilterPhrases = { 0: "$$", 4: "@@" }
): QuickPickItem[] => {
  const array: QuickPickItem[] = [];
  Object.keys(itemFilterPhrases).forEach((kind: string) =>
    array.push(getQpHelpItem(helpPhrase, kind, itemFilterPhrases[Number(kind)]))
  );
  return array;
};
