import * as sinon from "sinon";
import * as cache from "../../cache";
import * as config from "../../config";
import { controller } from "../../controller";
import { patternProvider } from "../../patternProvider";
import { quickPick } from "../../quickPick";
import { utils } from "../../utils";
import { workspace } from "../../workspace";
import * as workspaceEventsEmitter from "../../workspaceEventsEmitter";
import { getExtensionContext } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export function stubComponents(sandbox: sinon.SinonSandbox) {
  return stubMultiple(
    [
      {
        object: cache,
        method: "initCache",
      },
      {
        object: workspace,
        method: "init",
      },
      {
        object: workspace,
        method: "registerEventListeners",
      },
      {
        object: workspaceEventsEmitter,
        method: "onWillProcessing",
      },
      {
        object: workspaceEventsEmitter,
        method: "onDidProcessing",
      },
      {
        object: workspaceEventsEmitter,
        method: "onWillExecuteAction",
      },
      {
        object: workspaceEventsEmitter,
        method: "onDidDebounceConfigToggle",
      },
      {
        object: workspaceEventsEmitter,
        method: "onWillReindexOnConfigurationChange",
      },
    ],
    sandbox
  );
}

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },
    init1: () => {
      stubMultiple(
        [
          {
            object: cache,
            method: "initCache",
          },
          {
            object: workspace,
            method: "init",
          },
          {
            object: workspace,
            method: "registerEventListeners",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillExecuteAction",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidDebounceConfigToggle",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillReindexOnConfigurationChange",
          },
        ],
        sandbox
      );
      return getExtensionContext();
    },
    init2: () => {
      return stubMultiple(
        [
          {
            object: cache,
            method: "initCache",
          },
          {
            object: workspace,
            method: "init",
          },
          {
            object: workspace,
            method: "registerEventListeners",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillExecuteAction",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidDebounceConfigToggle",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillReindexOnConfigurationChange",
          },
        ],
        sandbox
      );
    },
    init3: () => {
      return stubMultiple(
        [
          {
            object: workspace,
            method: "init",
          },
          {
            object: cache,
            method: "initCache",
          },
          {
            object: workspace,
            method: "registerEventListeners",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillExecuteAction",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidDebounceConfigToggle",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillReindexOnConfigurationChange",
          },
        ],
        sandbox
      );
    },
    init4: () => {
      return stubMultiple(
        [
          {
            object: workspaceEventsEmitter,
            method: "onWillProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidProcessing",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillExecuteAction",
          },
          {
            object: workspaceEventsEmitter,
            method: "onDidDebounceConfigToggle",
          },
          {
            object: workspaceEventsEmitter,
            method: "onWillReindexOnConfigurationChange",
          },
          {
            object: workspace,
            method: "init",
          },
          {
            object: cache,
            method: "initCache",
          },
          {
            object: workspace,
            method: "registerEventListeners",
          },
        ],
        sandbox
      );
    },
    search1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "show",
          },
          {
            object: utils,
            method: "printNoFolderOpenedMessage",
          },
          {
            object: utils,
            method: "hasWorkspaceAnyFolder",
            returns: false,
          },
        ],
        sandbox
      );
    },
    search2: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: workspace,
            method: "index",
          },
          {
            object: utils,
            method: "hasWorkspaceAnyFolder",
            returns: true,
          },
          {
            object: controller,
            method: "shouldIndexOnQuickPickOpen",
            returns: true,
          },
          {
            object: quickPick,
            method: "isInitialized",
          },
        ],
        sandbox
      );
    },
    search3: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: workspace,
            method: "index",
          },
          {
            object: utils,
            method: "hasWorkspaceAnyFolder",
            returns: true,
          },
          {
            object: controller,
            method: "shouldIndexOnQuickPickOpen",
            returns: false,
          },
          {
            object: quickPick,
            method: "isInitialized",
          },
        ],
        sandbox
      );
    },
    search4: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "loadItems",
          },
          {
            object: quickPick,
            method: "show",
          },
          {
            object: utils,
            method: "hasWorkspaceAnyFolder",
            returns: true,
          },
          {
            object: quickPick,
            method: "isInitialized",
            returns: true,
          },
          {
            object: config,
            method: "fetchShouldInitOnStartup",
          },
        ],
        sandbox
      );
    },
    search5: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "loadItems",
          },
          {
            object: quickPick,
            method: "show",
          },
          {
            object: utils,
            method: "hasWorkspaceAnyFolder",
            returns: true,
          },
          {
            object: quickPick,
            method: "isInitialized",
            returns: false,
          },
          {
            object: patternProvider,
            method: "getExcludePatterns",
            returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
          },
          {
            object: config,
            method: "fetchShouldInitOnStartup",
          },
          {
            object: workspace,
            method: "index",
          },
        ],
        sandbox
      );
    },
    reload1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: utils,
            method: "printNoFolderOpenedMessage",
          },
          {
            object: utils,
            method: "hasWorkspaceAnyFolder",
            returns: false,
          },
        ],
        sandbox
      );
    },
    reload2: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: workspace,
            method: "index",
          },
          {
            object: utils,
            method: "hasWorkspaceAnyFolder",
            returns: true,
          },
        ],
        sandbox
      );
    },
    startup1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: workspace,
            method: "index",
          },
          {
            object: config,
            method: "fetchShouldInitOnStartup",
            returns: true,
          },
        ],
        sandbox
      );
    },
    startup2: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: workspace,
            method: "index",
          },
          {
            object: config,
            method: "fetchShouldInitOnStartup",
            returns: false,
          },
        ],
        sandbox
      );
    },
    handleWillProcessing1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "showLoading",
          },
          {
            object: quickPick,
            method: "setPlaceholder",
          },
          {
            object: quickPick,
            method: "isInitialized",
            returns: true,
          },
        ],
        sandbox
      );
    },
    handleWillProcessing2: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "showLoading",
          },
          {
            object: quickPick,
            method: "setPlaceholder",
          },
          {
            object: quickPick,
            method: "fetchConfig",
          },
          {
            object: quickPick,
            method: "isInitialized",
            returns: false,
          },
          {
            object: quickPick,
            method: "init",
          },
        ],
        sandbox
      );
    },
    handleWillProcessing3: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "init",
          },
          {
            object: quickPick,
            method: "isInitialized",
            returns: false,
          },
        ],
        sandbox
      );
    },
    handleDidProcessing1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: controller,
            method: "setQuickPickData",
          },
          {
            object: quickPick,
            method: "init",
          },
          {
            object: quickPick,
            method: "loadItems",
          },
          {
            object: controller,
            method: "setBusy",
          },
          {
            object: quickPick,
            method: "isInitialized",
            returns: true,
          },
        ],
        sandbox
      );
    },
    handleDidProcessing2: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "setItems",
          },
          {
            object: workspace,
            method: "getData",
            returns: Promise.resolve(getQpItems()),
          },
          {
            object: quickPick,
            method: "loadItems",
          },
          {
            object: quickPick,
            method: "isInitialized",
          },
        ],
        sandbox
      );
    },
    handleWillExecuteAction1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "setItems",
          },
          {
            object: quickPick,
            method: "loadItems",
          },
        ],
        sandbox
      );
    },
    handleWillExecuteAction2: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "setItems",
          },
          {
            object: quickPick,
            method: "loadItems",
          },
        ],
        sandbox
      );
    },
    handleDidDebounceConfigToggle1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: controller,
            method: "setBusy",
          },
          {
            object: quickPick,
            method: "reloadOnDidChangeValueEventListener",
          },
        ],
        sandbox
      );
    },
    handleWillReindexOnConfigurationChange1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "reload",
          },
        ],
        sandbox
      );
    },
  };
};
