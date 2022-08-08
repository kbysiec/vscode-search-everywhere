import * as sinon from "sinon";
import * as vscode from "vscode";
import * as config from "../../config";
import { quickPick } from "../../quickPick";
import { getQuickPickOnDidChangeValueEventListeners } from "../util/eventMockFactory";
import {
  getQpHelpItem,
  getQpHelpItems,
  getQpItem,
  getQpItems,
  getUntitledQpItem,
} from "../util/qpItemMockFactory";
import { getTextEditorStub } from "../util/stubFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },
    init1: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      return stubMultiple(
        [
          {
            object: vscode.window,
            method: "createQuickPick",
            returns: quickPickInner,
          },
        ],
        sandbox
      );
    },
    init2: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      stubMultiple(
        [
          {
            object: vscode.window,
            method: "createQuickPick",
            returns: quickPickInner,
          },
          {
            object: config,
            method: "fetchShouldUseDebounce",
            returns: true,
          },
          {
            object: quickPick,
            method: "getOnDidChangeValueEventListeners",
            returns: [],
          },
        ],
        sandbox
      );
    },
    init3: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      stubMultiple(
        [
          {
            object: vscode.window,
            method: "createQuickPick",
            returns: quickPickInner,
          },
          {
            object: config,
            method: "fetchShouldUseDebounce",
            returns: false,
          },
          {
            object: quickPick,
            method: "getOnDidChangeValueEventListeners",
            returns: [],
          },
        ],
        sandbox
      );
    },
    reload1: () => {
      return stubMultiple(
        [
          {
            object: config,
            method: "fetchShouldUseItemsFilterPhrases",
          },
          {
            object: config,
            method: "fetchHelpPhrase",
          },
          {
            object: config,
            method: "fetchItemsFilterPhrases",
          },
        ],
        sandbox
      );
    },
    reload2: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "fetchConfig",
          },
          {
            object: quickPick,
            method: "getHelpPhrase",
            returns: "?",
          },
          {
            object: quickPick,
            method: "getItemsFilterPhrases",
            returns: {
              "0": "$$",
              "1": "^^",
              "4": "@@",
            },
          },
        ],
        sandbox
      );

      return getQpHelpItems("?", {
        "0": "$$",
        "1": "^^",
        "4": "@@",
      });
    },
    isInitialized1: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getControl",
            returns: quickPickInner,
          },
        ],
        sandbox
      );
    },
    isInitialized2: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getControl",
            returns: undefined,
            returnsIsUndefined: true,
          },
        ],
        sandbox
      );
    },
    show1: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      return stubMultiple(
        [
          {
            object: quickPickInner,
            method: "show",
          },
          {
            object: quickPick,
            method: "getControl",
            returns: quickPickInner,
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
    loadItems1: () => {
      const items = getQpItems();
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getItems",
            returns: items,
          },
        ],
        sandbox
      );

      return items;
    },
    loadItems2: () => {
      const helpItems = getQpHelpItems();
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getHelpItemsProp",
            returns: helpItems,
          },
        ],
        sandbox
      );

      return helpItems;
    },
    setPlaceholder2: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getShouldUseItemsFilterPhrases",
            returns: false,
          },
        ],
        sandbox
      );
    },
    setPlaceholder3: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getShouldUseItemsFilterPhrases",
            returns: true,
          },
          {
            object: quickPick,
            method: "getHelpPhrase",
            returns: "?",
          },
        ],
        sandbox
      );
    },
    setPlaceholder4: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getShouldUseItemsFilterPhrases",
            returns: true,
          },
          {
            object: quickPick,
            method: "getHelpPhrase",
            returns: "",
          },
        ],
        sandbox
      );
    },
    reloadOnDidChangeValueEventListener1: () => {
      let listeners: vscode.Disposable[] = [];
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getOnDidChangeValueEventListeners",
            callsFake: () => listeners,
          },
          {
            object: quickPick,
            method: "setOnDidChangeValueEventListeners",
            callsFake: (
              newOnDidChangeValueEventListeners: vscode.Disposable[]
            ) => (listeners = newOnDidChangeValueEventListeners),
          },
          {
            object: config,
            method: "fetchShouldUseDebounce",
            returns: false,
          },
        ],
        sandbox
      );
      listeners.push(...getQuickPickOnDidChangeValueEventListeners());
      return listeners;
    },
    reloadOnDidChangeValueEventListener2: () => {
      let listeners: vscode.Disposable[] = [];
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getOnDidChangeValueEventListeners",
            callsFake: () => listeners,
          },
          {
            object: quickPick,
            method: "setOnDidChangeValueEventListeners",
            callsFake: (
              newOnDidChangeValueEventListeners: vscode.Disposable[]
            ) => (listeners = newOnDidChangeValueEventListeners),
          },
          {
            object: config,
            method: "fetchShouldUseDebounce",
            returns: true,
          },
        ],
        sandbox
      );
      listeners.push(...getQuickPickOnDidChangeValueEventListeners(1));
      return listeners;
    },
    handleDidChangeValueClearing1: () => {
      stubMultiple(
        [
          {
            object: quickPick,
            method: "getItems",
            returns: getQpItems(),
          },
        ],
        sandbox
      );
    },
    handleDidChangeValue1: () => {
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "loadItems",
          },
        ],
        sandbox
      );
    },
    handleDidChangeValue2: () => {
      return stubMultiple(
        [
          {
            object: quickPick,
            method: "loadItems",
          },
          {
            object: quickPick,
            method: "getShouldUseItemsFilterPhrases",
            returns: true,
          },
          {
            object: quickPick,
            method: "getHelpPhrase",
            returns: "?",
          },
        ],
        sandbox
      );
    },
    handleDidAccept1: () => {
      const editor = getTextEditorStub();
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();

      return stubMultiple(
        [
          {
            object: editor,
            method: "revealRange",
          },
          {
            object: vscode.window,
            method: "showTextDocument",
            returns: editor,
          },
          {
            object: vscode.workspace,
            method: "openTextDocument",
          },
          {
            object: quickPick,
            method: "getControl",
            returns: quickPickInner,
          },
          {
            object: quickPickInner,
            method: "selectedItems",
            returns: [getQpItem()],
            isNotMethod: true,
          },
        ],
        sandbox
      );
    },
    handleDidAccept2: () => {
      const editor = getTextEditorStub();
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();

      return stubMultiple(
        [
          {
            object: editor,
            method: "revealRange",
          },
          {
            object: vscode.window,
            method: "showTextDocument",
            returns: editor,
          },
          {
            object: vscode.workspace,
            method: "openTextDocument",
          },
          {
            object: config,
            method: "fetchShouldHighlightSymbol",
            returns: true,
          },
          {
            object: quickPick,
            method: "getControl",
            returns: quickPickInner,
          },
          {
            object: quickPickInner,
            method: "selectedItems",
            returns: [getUntitledQpItem()],
            isNotMethod: true,
          },
        ],
        sandbox
      );
    },
    handleDidAccept3: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();

      return stubMultiple(
        [
          {
            object: quickPick,
            method: "loadItems",
          },
          {
            object: quickPick,
            method: "getShouldUseItemsFilterPhrases",
            returns: true,
          },
          {
            object: quickPick,
            method: "getItemsFilterPhrases",
            returns: { 0: "$$", 1: "@@" },
          },
          {
            object: quickPick,
            method: "getControl",
            returns: quickPickInner,
          },
          {
            object: quickPickInner,
            method: "selectedItems",
            returns: [getQpHelpItem("?", "0", "$$")],
            isNotMethod: true,
          },
        ],
        sandbox
      );
    },
  };
};
