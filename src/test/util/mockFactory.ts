import * as vscode from "vscode";
import * as sinon from "sinon";
import WorkspaceData from "../../interface/workspaceData";
import Item from "../../interface/item";
import ActionType from "../../enum/actionType";
import Action from "../../interface/action";

export const getExtensionContext = (): vscode.ExtensionContext => {
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
};

export const getConfiguration = (): { [key: string]: any } => {
  return {
    searchEverywhere: {
      shouldDisplayNotificationInStatusBar: true,
      shouldInitOnStartup: true,
      shouldHighlightSymbol: true,
      icons: { 0: "fake-icon", 1: "another-fake-icon" },
      itemsFilter: {
        allowedKinds: [],
        ignoredKinds: [],
        ignoredNames: [],
      },
      itemsFilterPhrases: {
        "0": "$$",
        "1": "^^",
        "4": "@@",
      },
      include: "**/*.{js,ts}",
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
};

export const getVscodeConfiguration = (configuration: {
  [key: string]: any;
}) => {
  return {
    get: (section: string) =>
      section.split(".").reduce((cfg, key) => cfg[key], configuration),
    has: () => true,
    inspect: () => undefined,
    update: () => Promise.resolve(),
  };
};

export const getWorkspaceData = (items: Item[] = []): WorkspaceData => {
  let count = 0;
  const itemsMap = new Map<string, Item>();
  items.forEach((item: Item) => {
    itemsMap.set(item.uri.fsPath, {
      uri: item.uri,
      elements: item.elements,
    });
    count += item.elements.length;
  });
  return {
    items: itemsMap,
    count,
  };
};

const getRandomActionType = (): ActionType => {
  const count = Object.keys(ActionType).length;
  const randomIndex = Math.round(Math.random() * count);
  return Object.values(ActionType)[randomIndex];
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

export const getItemsFilter = (
  allowedKinds: number[] = [],
  ignoredKinds: number[] = [],
  ignoredNames: string[] = []
) => {
  return {
    allowedKinds,
    ignoredKinds,
    ignoredNames,
  };
};
