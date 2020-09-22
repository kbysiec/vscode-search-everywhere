import * as vscode from "vscode";
import ExtensionController from "../../extensionController";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (extensionController: ExtensionController) => {
  const extensionControllerAny = extensionController as any;
  return {
    search1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "show",
        },
        {
          object: extensionControllerAny.utils,
          method: "printNoFolderOpenedMessage",
        },
        {
          object: extensionControllerAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: false,
        },
      ]);
    },
    search2: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.workspace,
          method: "index",
        },
        {
          object: extensionControllerAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: true,
        },
        {
          object: extensionControllerAny,
          method: "shouldIndexOnQuickPickOpen",
          returns: true,
        },
      ]);
    },
    search3: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.workspace,
          method: "index",
        },
        {
          object: extensionControllerAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: true,
        },
        {
          object: extensionControllerAny,
          method: "shouldIndexOnQuickPickOpen",
          returns: false,
        },
      ]);
    },
    search4: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "loadItems",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "show",
        },
        {
          object: extensionControllerAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: true,
        },
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: true,
        },
      ]);
    },
    search5: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "loadItems",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "show",
        },
        {
          object: extensionControllerAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: true,
        },
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: false,
        },
      ]);
    },
    reload1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.utils,
          method: "printNoFolderOpenedMessage",
        },
        {
          object: extensionControllerAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: false,
        },
      ]);
    },
    reload2: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.workspace,
          method: "index",
        },
        {
          object: extensionControllerAny.utils,
          method: "hasWorkspaceAnyFolder",
          returns: true,
        },
      ]);
    },
    startup1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.workspace,
          method: "index",
        },
        {
          object: extensionControllerAny.config,
          method: "shouldInitOnStartup",
          returns: true,
        },
      ]);
    },
    startup2: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.workspace,
          method: "index",
        },
        {
          object: extensionControllerAny.config,
          method: "shouldInitOnStartup",
          returns: false,
        },
      ]);
    },
    setQuickPickData1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "setItems",
        },
        {
          object: extensionControllerAny.workspace,
          method: "getData",
          returns: Promise.resolve(getQpItems()),
        },
      ]);
    },
    setQuickPickData2: () => {
      stubMultiple([
        {
          object: extensionControllerAny.workspace,
          method: "getData",
          returns: Promise.resolve(),
        },
      ]);
    },
    setBusy1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny,
          method: "setQuickPickLoading",
        },
        {
          object: extensionControllerAny,
          method: "setQuickPickPlaceholder",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: true,
        },
      ]);
    },
    setQuickPickLoading1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "showLoading",
        },
      ]);
    },
    setQuickPickPlaceholder1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "setPlaceholder",
        },
      ]);
    },
    shouldIndexOnQuickPickOpen1: () => {
      stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: false,
        },
        {
          object: extensionControllerAny.config,
          method: "shouldInitOnStartup",
          returns: false,
        },
      ]);
    },
    shouldIndexOnQuickPickOpen2: () => {
      stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: false,
        },
        {
          object: extensionControllerAny.config,
          method: "shouldInitOnStartup",
          returns: true,
        },
      ]);
    },
    shouldIndexOnQuickPickOpen3: () => {
      stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: true,
        },
        {
          object: extensionControllerAny.config,
          method: "shouldInitOnStartup",
          returns: false,
        },
      ]);
    },
    registerEventListeners1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.workspace.events,
          method: "onWillProcessing",
        },
        {
          object: extensionControllerAny.workspace.events,
          method: "onDidProcessing",
        },
        {
          object: extensionControllerAny.workspace.events,
          method: "onWillExecuteAction",
        },
        {
          object: extensionControllerAny.workspace.events,
          method: "onDidDebounceConfigToggle",
        },
      ]);
    },
    onWillProcessing1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny,
          method: "setBusy",
        },
      ]);
    },
    onDidProcessing1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny,
          method: "setQuickPickData",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "init",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "loadItems",
        },
        {
          object: extensionControllerAny,
          method: "setBusy",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: true,
        },
      ]);
    },
    onDidProcessing2: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "init",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: false,
        },
        {
          object: extensionControllerAny.quickPick,
          method: "loadItems",
        },
      ]);
    },
    onWillExecuteAction1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "setItems",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "loadItems",
        },
      ]);
    },
    onWillExecuteAction2: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "setItems",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "loadItems",
        },
      ]);
    },
    onDidDebounceConfigToggle1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny,
          method: "setBusy",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "reloadOnDidChangeValueEventListener",
        },
      ]);
    },
    onWillReindexOnConfigurationChange1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "reload",
        },
      ]);
    },
  };
};
