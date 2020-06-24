import * as vscode from "vscode";
import * as sinon from "sinon";
import Cache from "../../cache";
import Utils from "../../utils";
import WorkspaceData from "../../interface/workspaceData";
import QuickPickItem from "../../interface/quickPickItem";
import Item from "../../interface/item";
import ActionType from "../../enum/actionType";
import Action from "../../interface/action";
import { createStubInstance } from "./stubbedClass";
import Config from "../../config";

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
  const utilsStubTemp: any = createStubInstance(Utils);
  utilsStubTemp.config = getConfigStub();

  return utilsStubTemp as Utils;
}

export function getConfiguration(): { [key: string]: any } {
  return {
    searchEverywhere: {
      shouldDisplayNotificationInStatusBar: true,
      shouldInitOnStartup: true,
      shouldHighlightSymbol: true,
      icons: { 0: "fake-icon", 1: "another-fake-icon" },
      include: ["**/*.{js,ts}"],
      exclude: ["**/node_modules/**"],
      shouldUseFilesAndSearchExclude: true,
    },
    customSection: {
      exclude: ["**/customFolder/**"],
    },
    search: {
      exclude: {
        "**/search_exclude/**": true,
      },
    },
    files: {
      exclude: {
        "**/.git": true,
      },
    },
  };
}

export function getConfigStub(): Config {
  const configStub: any = createStubInstance(Config);
  configStub.cache = getCacheStub();
  configStub.default = getConfiguration().searchEverywhere;

  return configStub as Config;
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

export const getConfigurationChangeEvent = (
  flag: boolean = true,
  shouldUseExcludedArray: boolean = true,
  isExcluded: boolean = true,
  shouldUseFilesAndSearchExclude: boolean = false,
  flagForFilesExclude: boolean = false,
  flagForSearchExclude: boolean = false
) => {
  const defaultSection = "searchEverywhere";

  return {
    affectsConfiguration: (section: string) =>
      defaultSection === section
        ? flag
        : shouldUseExcludedArray
        ? flag && isExcluded
        : shouldUseFilesAndSearchExclude
        ? section === "files.exclude"
          ? flagForFilesExclude
          : section === "search.exclude"
          ? flagForSearchExclude
          : false
        : flag,
  };
};

export const getTextDocumentChangeEvent = async (
  shouldContentBeChanged: boolean = false
): Promise<vscode.TextDocumentChangeEvent> => {
  const itemUntitled = getUntitledItem();
  const textDocumentChangeEvent = {
    document: await vscode.workspace.openTextDocument(itemUntitled),
    contentChanges: [],
  };
  shouldContentBeChanged &&
    (textDocumentChangeEvent as any).contentChanges.push("test change");

  return textDocumentChangeEvent;
};

export const getFileRenameEvent = () => ({
  files: [
    {
      oldUri: vscode.Uri.file("./#"),
      newUri: vscode.Uri.file("./test/#"),
    },
  ],
});

export const getFileWatcherStub = () => {
  return {
    ignoreCreateEvents: false,
    ignoreChangeEvents: false,
    ignoreDeleteEvents: false,
    onDidChange: sinon.stub(),
    onDidCreate: sinon.stub(),
    onDidDelete: sinon.stub(),
    dispose: () => {},
  };
};

export const getQuickPickOnDidChangeValueEventListeners = (
  count: number = 2
): vscode.Disposable[] => {
  const array: vscode.Disposable[] = [];
  for (let i = 0; i < count; i++) {
    array.push(new vscode.Disposable(() => {}));
  }
  return array;
};

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
  fixPrivateFsPathProperty && ((item as any)._fsPath = item.fsPath);
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

export const getQpItem = (
  path: string = "/./fake/",
  suffix: string | number = 1,
  differentStartAndEnd: boolean = false,
  withIcon: boolean = false
): QuickPickItem => {
  const icons = getConfiguration().searchEverywhere.icons;
  const symbolKind = 0;
  const qpItem = {
    label: `${withIcon ? `$(${icons[symbolKind]})  ` : ""}fake-${
      suffix ? `${suffix}` : ""
    }.ts`,
    description: "File",
    detail: `${path}fake-${suffix ? `${suffix}` : ""}.ts`,
    uri: vscode.Uri.file(`${path}fake-${suffix ? `${suffix}` : ""}.ts`),
    symbolKind,
    range: {
      start: new vscode.Position(0, 0),
      end: differentStartAndEnd
        ? new vscode.Position(0, 5)
        : new vscode.Position(0, 0),
    },
  };
  const qpItemAny = qpItem as any;
  qpItemAny.uri._fsPath = qpItemAny.uri.fsPath;
  qpItemAny.detail = qpItemAny.uri.fsPath;

  return qpItem;
};

export const getUntitledQpItem = (): QuickPickItem => {
  return {
    label: "fake-1.ts",
    uri: getUntitledItem(),
    symbolKind: 0,
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

export const getDocumentSymbolItemSingleLine = (
  suffix?: string | number,
  withChild: boolean = false
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
    children: withChild
      ? [
          {
            name: `test child name${suffix ? ` ${suffix}` : ""}`,
            detail: `test child details${suffix ? ` ${suffix}` : ""}`,
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
        ]
      : [],
  };
};

export const getDocumentSymbolItemSingleLineArray = (
  count: number = 0,
  withChild: boolean = false
): vscode.DocumentSymbol[] => {
  const array: vscode.DocumentSymbol[] = [];
  for (let i = 1; i <= count; i++) {
    array.push(getDocumentSymbolItemSingleLine(i, withChild));
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

export const getQpItemsSymbolAndUri = (path: string = "/./fake/") => {
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
    qpItem.uri._fsPath = qpItem.uri.fsPath;
    qpItem.detail = qpItem.uri.fsPath;
  });

  return qpItemsSymbolAndUri;
};

export const getQpItemsSymbolAndUriExt = (path: string = "/./fake/") => {
  const qpItemsSymbolAndUriExt: QuickPickItem[] = [
    {
      label: "fake-1.ts",
      description: "File",
      detail: "/./fake/fake-1.ts",
      uri: vscode.Uri.file("/./fake/fake-1.ts"),
      symbolKind: 0,
      range: {
        start: new vscode.Position(0, 0),
        end: new vscode.Position(0, 0),
      },
    },
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
    qpItem.uri._fsPath = qpItem.uri.fsPath;
    qpItem.detail = qpItem.uri.fsPath;
  });

  return qpItemsSymbolAndUriExt;
};

const getRandomActionType = (): ActionType => {
  const count = Object.keys(ActionType).length; //items count
  const index = Math.round(Math.random() * count); //random index
  return Object.values(ActionType)[index];
};

export const getAction = (
  type?: ActionType,
  comment: string = "test comment",
  id: number = 0,
  withUri: boolean = false,
  uri: vscode.Uri = vscode.Uri.file(`./fake/fake-${id}.ts`)
): Action => {
  return {
    type: type || getRandomActionType(),
    fn: sinon.stub(),
    comment,
    id,
    uri: withUri ? uri : undefined,
  };
};

export const getActions = (
  count: number = 2,
  action?: Action,
  type?: ActionType,
  comment?: string,
  withUri?: boolean,
  uri?: vscode.Uri
): Action[] => {
  const array: Action[] = [];

  for (let i = 1; i <= count; i++) {
    if (action) {
      array.push(action);
    } else {
      array.push(getAction(type, `${comment} ${i}`, i - 1, withUri, uri));
    }
  }
  return array;
};

export const getEventEmitter = () => ({ fire: sinon.stub() });
export const getSubscription = () => ({ dispose: sinon.stub() });
export const getProgress = (value: number = 0) => ({
  report: sinon.stub(),
  value,
});

export const getQpItemDocumentSymbolSingleLine = (
  withIcon: boolean = false
): QuickPickItem => {
  const icons = getConfiguration().searchEverywhere.icons;
  const symbolKind = 1;
  const qpItem = {
    label: `${withIcon ? `$(${icons[symbolKind]})  ` : ""}test name`,
    description: "Module at line: 1",
    detail: "/./fake/fake-1.ts",
    uri: vscode.Uri.file("./fake/fake-1.ts"),
    symbolKind,
    range: {
      start: new vscode.Position(0, 0),
      end: new vscode.Position(0, 0),
    },
  } as QuickPickItem;

  const qpItemAny = qpItem as any;
  qpItemAny.uri._fsPath = qpItemAny.uri.fsPath;
  qpItemAny.detail = qpItemAny.uri.fsPath;
  return qpItem;
};
