import * as vscode from "vscode";
import * as sinon from "sinon";
import Cache from "../../cache";
import Utils from "../../utils";
import WorkspaceData from "../../interface/workspaceData";
import QuickPickItem from "../../interface/quickPickItem";
import Item from "../../interface/item";

export function getExtensionContext(): vscode.ExtensionContext {
  return {
    subscriptions: [],
    workspaceState: {
      get: () => {},
      update: () => Promise.resolve(),
    },
    globalState: {
      get: () => {},
      update: () => Promise.resolve(),
    },
    extensionPath: "",
    storagePath: "",
    globalStoragePath: "",
    logPath: "",
    asAbsolutePath: (relativePath: string) => relativePath,
  } as vscode.ExtensionContext;
}

export function getCacheStub(): Cache {
  const cacheStubTemp: any = sinon.createStubInstance(Cache);
  cacheStubTemp.extensionContext = getExtensionContext();
  return cacheStubTemp as Cache;
}

export function getUtilsStub(): Utils {
  return sinon.createStubInstance(Utils);
}

export const getWorkspaceFoldersChangeEvent = (flag: boolean) => {
  return flag
    ? {
        added: [
          {
            uri: vscode.Uri.file("#"),
            name: "test workspace folder",
            index: 1,
          },
        ],
        removed: [],
      }
    : {
        added: [],
        removed: [],
      };
};

export const getConfigurationChangeEvent = (flag: boolean) => ({
  affectsConfiguration: () => flag,
});

export const getWorkspaceData = (items: vscode.Uri[] = []): WorkspaceData => {
  const itemsMap = new Map<string, Item>();
  items.forEach((item: vscode.Uri) =>
    itemsMap.set(item.fsPath, {
      uri: item,
      elements: [item],
    })
  );
  return {
    items: itemsMap,
    count: items.length,
  };
};

export const getDocumentSymbolItemSingleLine = (
  suffix?: string | number
): vscode.DocumentSymbol => {
  return {
    name: `test name${suffix ? ` ${suffix}` : ""}`,
    detail: `test details${suffix ? ` ${suffix}` : ""}`,
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
  };
};

export const getDocumentSymbolItemSingleLineArray = (
  count: number = 0
): vscode.DocumentSymbol[] => {
  const array: vscode.DocumentSymbol[] = [];
  for (let i = 0; i < count; i++) {
    array.push(getDocumentSymbolItemSingleLine(i));
  }
  return array;
};

export const getDocumentSymbolItemMultiLine = (
  withEmptyParent: boolean = false
): vscode.DocumentSymbol => {
  return {
    name: `${withEmptyParent ? "" : "test parent"}§&§test name`,
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

export const getDocumentSymbolQpItemMultiLine = (
  withEmptyParent: boolean = false
): QuickPickItem => {
  const qpItem = {
    label: "test name",
    description: `Module at lines: 1 - 3${
      withEmptyParent ? "" : " in test parent"
    }`,
    detail: "/./fake/fake-1.ts",
    uri: vscode.Uri.file("./fake/fake-1.ts"),
    symbolKind: 1,
    range: {
      start: new vscode.Position(0, 0),
      end: new vscode.Position(3, 0),
    },
  };
  const qpItemAny = qpItem as any;
  qpItemAny.uri._fsPath = qpItemAny.uri.fsPath;
  qpItemAny.detail = qpItemAny.uri.fsPath;

  return qpItem;
};
