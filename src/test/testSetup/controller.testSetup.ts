import * as sinon from "sinon";
import * as vscode from "vscode";
import * as cache from "../../cache";
import * as config from "../../config";
import { controller } from "../../controller";
import { patternProvider } from "../../patternProvider";
import { quickPick } from "../../quickPick";
import { utils } from "../../utils";
import { workspace } from "../../workspace";
import * as workspaceEventsEmitter from "../../workspaceEventsEmitter";
import { getExtensionContext } from "../util/mockFactory";
import { getQpItem, getQpItems } from "../util/qpItemMockFactory";
import { getTextEditorStub } from "../util/stubFactory";
import { stubMultiple } from "../util/stubHelpers";

function stubComponents(sandbox: sinon.SinonSandbox) {
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

function stubComponentsForStartup(
  sandbox: sinon.SinonSandbox,
  returnsValues: { [key: string]: any }
) {
  return stubMultiple(
    [
      {
        object: workspace,
        method: "removeDataForUnsavedUris",
        returns: returnsValues.removeDataForUnsavedUris,
      },
      {
        object: quickPick,
        method: "init",
        returns: returnsValues.init,
      },
      {
        object: cache,
        method: "clearConfig",
        returns: returnsValues.clearConfig,
      },
      {
        object: workspace,
        method: "getData",
        returns: returnsValues.getData,
      },
      {
        object: quickPick,
        method: "setItems",
        returns: returnsValues.setItems,
      },
      {
        object: workspace,
        method: "index",
        returns: returnsValues.index,
      },
      {
        object: quickPick,
        method: "isInitialized",
        returns: returnsValues.isInitialized,
      },
      {
        object: controller,
        method: "shouldIndexOnStartup",
        returns: returnsValues.shouldIndexOnStartup,
      },
      {
        object: controller,
        method: "shouldLoadDataFromCacheOnStartup",
        returns: returnsValues.shouldLoadDataFromCacheOnStartup,
      },
    ],
    sandbox
  );
}

function stubComponentsForSearch(
  sandbox: sinon.SinonSandbox,
  returnsValues: { [key: string]: any }
) {
  return stubMultiple(
    [
      {
        object: workspace,
        method: "index",
        returns: returnsValues.index,
      },
      {
        object: cache,
        method: "clear",
        returns: returnsValues.clear,
      },
      {
        object: cache,
        method: "clearConfig",
        returns: returnsValues.clearConfig,
      },
      {
        object: quickPick,
        method: "init",
        returns: returnsValues.init,
      },
      {
        object: workspace,
        method: "removeDataForUnsavedUris",
        returns: returnsValues.removeDataForUnsavedUris,
      },
      {
        object: workspace,
        method: "getData",
        returns: returnsValues.getData,
      },
      {
        object: quickPick,
        method: "setItems",
        returns: returnsValues.setItems,
      },
      {
        object: quickPick,
        method: "isInitialized",
        returns: returnsValues.isInitialized,
      },
      {
        object: controller,
        method: "shouldIndexOnQuickPickOpen",
        returns: returnsValues.shouldIndexOnQuickPickOpen,
      },
      {
        object: controller,
        method: "shouldLoadDataFromCacheOnQuickPickOpen",
        returns: returnsValues.shouldIndexOnQuickPickOpen,
      },
      {
        object: controller,
        method: "shouldSearchSelection",
        returns: returnsValues.shouldSearchSelection,
      },
    ],
    sandbox
  );
}

function stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
  sandbox: sinon.SinonSandbox,
  returnsValues: { [key: string]: any }
) {
  return stubMultiple(
    [
      {
        object: quickPick,
        method: "isInitialized",
        returns: returnsValues.isInitialized,
      },
      {
        object: config,
        method: "fetchShouldInitOnStartup",
        returns: returnsValues.fetchShouldInitOnStartup,
      },
      {
        object: config,
        method: "fetchShouldWorkspaceDataBeCached",
        returns: returnsValues.fetchShouldWorkspaceDataBeCached,
      },
      {
        object: workspace,
        method: "getData",
        returns: returnsValues.getData,
      },
    ],
    sandbox
  );
}

function stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(
  sandbox: sinon.SinonSandbox,
  returnsValues: { [key: string]: any }
) {
  return stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
    sandbox,
    returnsValues
  );
}

function stubComponentsForShouldLoadDataFromCacheOnStartup(
  sandbox: sinon.SinonSandbox,
  returnsValues: { [key: string]: any }
) {
  return stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
    sandbox,
    returnsValues
  );
}

function stubComponentsForShouldSearchSelection(
  sandbox: sinon.SinonSandbox,
  returnsValues: { [key: string]: any }
) {
  return stubMultiple(
    [
      {
        object: quickPick,
        method: "isInitialized",
        returns: returnsValues.isInitialized,
      },
      {
        object: config,
        method: "fetchShouldSearchSelection",
        returns: returnsValues.fetchShouldSearchSelection,
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
      return stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: true,
        shouldLoadDataFromCacheOnQuickPickOpen: false,
      });
    },
    search2: () => {
      stubComponents(sandbox);
      return stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: true,
        shouldLoadDataFromCacheOnQuickPickOpen: false,
      });
    },
    search3: () => {
      stubComponents(sandbox);
      return stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: true,
      });
    },
    search4: () => {
      stubComponents(sandbox);
      return stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: true,
      });
    },
    search5: () => {
      stubComponents(sandbox);
      return stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: true,
      });
    },
    search6: () => {
      stubComponents(sandbox);
      return stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: true,
      });
    },
    search7: () => {
      stubComponents(sandbox);
      stubComponentsForSearch(sandbox, {
        isInitialized: true,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: false,
      });
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
            object: quickPick,
            method: "setText",
          },
        ],
        sandbox
      );
    },
    search8: () => {
      stubComponents(sandbox);
      stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: false,
      });
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
            object: patternProvider,
            method: "getExcludePatterns",
            returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
          },
        ],
        sandbox
      );
    },
    search9: () => {
      stubComponents(sandbox);
      return stubComponentsForSearch(sandbox, {
        isInitialized: false,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: false,
      });
    },
    search10: () => {
      stubComponents(sandbox);
      stubComponentsForSearch(sandbox, {
        isInitialized: true,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: false,
        shouldSearchSelection: true,
      });
      const editor = getTextEditorStub(true, "test text");

      return stubMultiple(
        [
          {
            object: quickPick,
            method: "setText",
          },
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
            method: "sleepAndExecute",
          },
          {
            object: vscode.window,
            method: "activeTextEditor",
            isNotMethod: true,
            returns: editor,
          },
        ],
        sandbox
      );
    },
    search11: () => {
      stubComponents(sandbox);
      stubComponentsForSearch(sandbox, {
        isInitialized: true,
        shouldIndexOnQuickPickOpen: false,
        shouldLoadDataFromCacheOnQuickPickOpen: false,
        shouldSearchSelection: false,
      });

      return stubMultiple(
        [
          {
            object: quickPick,
            method: "setText",
          },
          {
            object: quickPick,
            method: "loadItems",
          },
          {
            object: quickPick,
            method: "show",
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
            object: cache,
            method: "clear",
          },
          {
            object: cache,
            method: "clearNotSavedUriPaths",
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
            object: cache,
            method: "clear",
          },
          {
            object: cache,
            method: "clearNotSavedUriPaths",
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
    reload3: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: cache,
            method: "clear",
          },
          {
            object: cache,
            method: "clearNotSavedUriPaths",
          },
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
      return stubComponentsForStartup(sandbox, {
        shouldIndexOnStartup: true,
        shouldLoadDataFromCacheOnStartup: false,
      });
    },
    startup2: () => {
      stubComponents(sandbox);
      return stubComponentsForStartup(sandbox, {
        isInitialized: false,
        shouldIndexOnStartup: false,
        shouldLoadDataFromCacheOnStartup: false,
      });
    },
    startup3: () => {
      stubComponents(sandbox);
      return stubComponentsForStartup(sandbox, {
        isInitialized: false,
        shouldIndexOnStartup: false,
        shouldLoadDataFromCacheOnStartup: true,
      });
    },
    startup4: () => {
      stubComponents(sandbox);
      return stubComponentsForStartup(sandbox, {
        isInitialized: false,
        shouldIndexOnStartup: false,
        shouldLoadDataFromCacheOnStartup: true,
      });
    },
    startup5: () => {
      stubComponents(sandbox);
      return stubComponentsForStartup(sandbox, {
        isInitialized: false,
        shouldIndexOnStartup: false,
        shouldLoadDataFromCacheOnStartup: true,
      });
    },
    startup6: () => {
      stubComponents(sandbox);
      return stubComponentsForStartup(sandbox, {
        isInitialized: false,
        shouldIndexOnStartup: false,
        shouldLoadDataFromCacheOnStartup: true,
      });
    },
    shouldIndexOnQuickPickOpen1: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
            returns: false,
          },
          {
            object: controller,
            method:
              "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: true,
          },
        ],
        sandbox
      );
    },
    shouldIndexOnQuickPickOpen2: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
            returns: true,
          },
          {
            object: controller,
            method:
              "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: false,
          },
        ],
        sandbox
      );
    },
    shouldIndexOnQuickPickOpen3: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
            returns: true,
          },
          {
            object: controller,
            method:
              "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: true,
          },
        ],
        sandbox
      );
    },
    shouldIndexOnQuickPickOpen4: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupDisabledAndWorkspaceCachingDisabled",
            returns: false,
          },
          {
            object: controller,
            method:
              "isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: false,
          },
        ],
        sandbox
      );
    },
    shouldIndexOnStartup1: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
            returns: false,
          },
          {
            object: controller,
            method:
              "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: true,
          },
        ],
        sandbox
      );
    },
    shouldIndexOnStartup2: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
            returns: true,
          },
          {
            object: controller,
            method:
              "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: false,
          },
        ],
        sandbox
      );
    },
    shouldIndexOnStartup3: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
            returns: true,
          },
          {
            object: controller,
            method:
              "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: true,
          },
        ],
        sandbox
      );
    },
    shouldIndexOnStartup4: () => {
      stubComponents(sandbox);
      stubMultiple(
        [
          {
            object: controller,
            method: "isInitOnStartupEnabledAndWorkspaceCachingDisabled",
            returns: false,
          },
          {
            object: controller,
            method:
              "isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty",
            returns: false,
          },
        ],
        sandbox
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty1: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: true,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [],
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty2: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [],
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty3: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: false,
          getData: [],
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty4: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [getQpItem()],
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty5: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [],
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingDisabled1: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: true,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: false,
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingDisabled2: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: false,
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingDisabled3: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: true,
        }
      );
    },
    isInitOnStartupDisabledAndWorkspaceCachingDisabled4: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: false,
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingDisabled1: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: true,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: false,
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingDisabled2: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: false,
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingDisabled3: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: true,
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingDisabled4: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: false,
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty1: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: true,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [],
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty2: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: false,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [],
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty3: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: false,
          getData: [],
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty4: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [getQpItem()],
        }
      );
    },
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty5: () => {
      stubComponents(sandbox);
      stubComponentsForIsInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty(
        sandbox,
        {
          isInitialized: false,
          fetchShouldInitOnStartup: true,
          fetchShouldWorkspaceDataBeCached: true,
          getData: [],
        }
      );
    },
    shouldSearchSelection1: () => {
      stubComponents(sandbox);
      stubComponentsForShouldSearchSelection(sandbox, {
        isInitialized: false,
        fetchShouldSearchSelection: true,
      });
      const editor = getTextEditorStub(true, "test text");

      return editor;
    },
    shouldSearchSelection2: () => {
      stubComponents(sandbox);
      stubComponentsForShouldSearchSelection(sandbox, {
        isInitialized: true,
        fetchShouldSearchSelection: false,
      });
      const editor = getTextEditorStub(true, "test text");

      return editor;
    },
    shouldSearchSelection3: () => {
      stubComponents(sandbox);
      stubComponentsForShouldSearchSelection(sandbox, {
        isInitialized: true,
        fetchShouldSearchSelection: true,
      });
      const editor = undefined;

      return editor;
    },
    shouldSearchSelection4: () => {
      stubComponents(sandbox);
      stubComponentsForShouldSearchSelection(sandbox, {
        isInitialized: true,
        fetchShouldSearchSelection: true,
      });
      const editor = getTextEditorStub(true, "test text");

      return editor;
    },
    shouldLoadDataFromCacheOnQuickPickOpen1: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
        isInitialized: true,
        fetchShouldInitOnStartup: true,
        fetchShouldWorkspaceDataBeCached: true,
      });
    },
    shouldLoadDataFromCacheOnQuickPickOpen2: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
        isInitialized: false,
        fetchShouldInitOnStartup: true,
        fetchShouldWorkspaceDataBeCached: true,
      });
    },
    shouldLoadDataFromCacheOnQuickPickOpen3: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
        isInitialized: false,
        fetchShouldInitOnStartup: false,
        fetchShouldWorkspaceDataBeCached: false,
      });
    },
    shouldLoadDataFromCacheOnQuickPickOpen4: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnQuickPickOpen(sandbox, {
        isInitialized: false,
        fetchShouldInitOnStartup: false,
        fetchShouldWorkspaceDataBeCached: true,
      });
    },
    shouldLoadDataFromCacheOnStartup1: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
        isInitialized: true,
        fetchShouldInitOnStartup: true,
        fetchShouldWorkspaceDataBeCached: true,
      });
    },
    shouldLoadDataFromCacheOnStartup2: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
        isInitialized: false,
        fetchShouldInitOnStartup: false,
        fetchShouldWorkspaceDataBeCached: true,
      });
    },
    shouldLoadDataFromCacheOnStartup3: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
        isInitialized: false,
        fetchShouldInitOnStartup: true,
        fetchShouldWorkspaceDataBeCached: false,
      });
    },
    shouldLoadDataFromCacheOnStartup4: () => {
      stubComponents(sandbox);
      stubComponentsForShouldLoadDataFromCacheOnStartup(sandbox, {
        isInitialized: false,
        fetchShouldInitOnStartup: true,
        fetchShouldWorkspaceDataBeCached: true,
      });
    },
    shouldQuickPickOpenFromSelection1: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "isInitialized",
            returns: false,
          },
          {
            object: config,
            method: "fetchShouldQuickPickOpenFromSelection",
          },
        ],
        sandbox
      );
    },
    shouldQuickPickOpenFromSelection2: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "isInitialized",
            returns: true,
          },
          {
            object: config,
            method: "fetchShouldQuickPickOpenFromSelection",
            returns: false,
          },
        ],
        sandbox
      );
    },
    shouldQuickPickOpenFromSelection3: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "isInitialized",
            returns: true,
          },
          {
            object: config,
            method: "fetchShouldQuickPickOpenFromSelection",
            returns: true,
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
            returns: getQpItems(),
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
    handleDidSortingConfigToggle1: () => {
      stubComponents(sandbox);
      return stubMultiple(
        [
          {
            object: controller,
            method: "setBusy",
          },
          {
            object: quickPick,
            method: "reloadSortingSettings",
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
