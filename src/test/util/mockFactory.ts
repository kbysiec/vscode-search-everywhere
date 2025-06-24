import * as sinon from "sinon";
import * as vscode from "vscode";
import {
  Action,
  ActionType,
  ExcludeMode,
  IndexStats,
  Item,
  WorkspaceData,
} from "../../types";

export const getExtensionContext = (): vscode.ExtensionContext => {
  return {
    subscriptions: [],
    workspaceState: {
      get: () => {},
      update: () => Promise.resolve(),
      keys: () => [] as readonly string[],
    },
    globalState: {
      get: () => {},
      update: () => Promise.resolve(),
      keys: () => [] as readonly string[],
      setKeysForSync: (keys: string[]) => {},
    },
    extensionPath: "",
    storagePath: "",
    globalStoragePath: "",
    logPath: "",
    secrets: {
      get: () => Promise.resolve(),
      store: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    },
    extensionUri: undefined,
    storageUri: undefined,
    globalStorageUri: undefined,
    logUri: undefined,
    environmentVariableCollection: undefined,
    extensionMode: undefined,
    extension: undefined,
    asAbsolutePath: (relativePath: string) => relativePath,
  } as unknown as vscode.ExtensionContext;
};

export const getConfiguration = (): { [key: string]: any } => {
  return {
    searchEverywhere: {
      shouldInitOnStartup: true,
      shouldDisplayNotificationInStatusBar: true,
      shouldHighlightSymbol: true,
      shouldUseDebounce: true,
      icons: { 0: "fake-icon", 1: "another-fake-icon" },
      itemsFilter: {
        allowedKinds: [1, 2, 3],
        ignoredKinds: [],
        ignoredNames: ["demo"],
      },
      shouldUseItemsFilterPhrases: true,
      itemsFilterPhrases: {
        "0": "$$",
        "1": "^^",
        "4": "@@",
      },
      helpPhrase: "?",
      shouldItemsBeSorted: true,
      shouldSearchSelection: true,
      include: "**/*.{js,ts}",
      exclude: ["**/node_modules/**"],
      excludeMode: ExcludeMode.SearchEverywhere,
      shouldWorkspaceDataBeCached: true,
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
    itemsMap.set(item.uri.path, {
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
  trigger: string = "test trigger",
  id: number = 0,
  withUri: boolean = false,
  uri: vscode.Uri = vscode.Uri.file(`./fake/fake-${id}.ts`)
): Action => {
  return {
    type: type || getRandomActionType(),
    fn: sinon.stub(),
    trigger: trigger,
    id,
    uri: withUri ? uri : undefined,
  };
};

export const getActions = (
  count: number = 2,
  action?: Action,
  type?: ActionType,
  trigger?: string,
  withUri?: boolean,
  uri?: vscode.Uri
): Action[] => {
  const array: Action[] = [];

  for (let i = 1; i <= count; i++) {
    if (action) {
      array.push(action);
    } else {
      array.push(getAction(type, `${trigger} ${i}`, i - 1, withUri, uri));
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

export const getIndexStats = () => {
  const indexStats: IndexStats = {
    ElapsedTimeInSeconds: 3,
    ScannedUrisCount: 20,
    IndexedItemsCount: 120,
  };

  return indexStats;
};
