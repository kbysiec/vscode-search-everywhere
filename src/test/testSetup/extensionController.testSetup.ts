import ExtensionController from "../../extensionController";
import { getQpItems } from "../util/qpItemMockFactory";
import { getQuickPickStub } from "../util/stubFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

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
        {
          object: extensionControllerAny.workspace.dataService.patternProvider,
          method: "getExcludePatterns",
          returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
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
    handleWillProcessing1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "showLoading",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "setPlaceholder",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: true,
        },
      ]);
    },
    handleWillProcessing2: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "showLoading",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "setPlaceholder",
        },
        {
          object: extensionControllerAny.quickPick,
          method: "isInitialized",
          returns: false,
        },
      ]);
    },
    handleWillProcessing3: () => {
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
      ]);
    },
    handleDidProcessing1: () => {
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

    handleDidProcessing2: () => {
      stubMultiple([
        {
          object: extensionControllerAny,
          method: "quickPick",
          returns: getQuickPickStub(),
          isNotMethod: true,
        },
      ]);

      restoreStubbedMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "setItems",
        },
      ]);

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
    handleWillExecuteAction1: () => {
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
    handleWillExecuteAction2: () => {
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
    handleDidDebounceConfigToggle1: () => {
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
    handleWillReindexOnConfigurationChange1: () => {
      return stubMultiple([
        {
          object: extensionControllerAny.quickPick,
          method: "reload",
        },
      ]);
    },
  };
};
