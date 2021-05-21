import * as vscode from "vscode";
import QuickPick from "../../quickPick";
import { getQuickPickOnDidChangeValueEventListeners } from "../util/eventMockFactory";
import { getItem, getUntitledItem } from "../util/itemMockFactory";
import { getQpItems, getQpHelpItems } from "../util/qpItemMockFactory";
import { getTextEditorStub } from "../util/stubFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";

export const getTestSetups = (quickPick: QuickPick) => {
  const quickPickAny = quickPick as any;
  return {
    init1: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      return stubMultiple([
        {
          object: vscode.window,
          method: "createQuickPick",
          returns: quickPickInner,
        },
      ]);
    },
    init2: () => {
      restoreStubbedMultiple([
        {
          object: vscode.window,
          method: "createQuickPick",
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
        },
      ]);
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      stubMultiple([
        {
          object: vscode.window,
          method: "createQuickPick",
          returns: quickPickInner,
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
          returns: true,
        },
        {
          object: quickPickAny,
          method: "onDidChangeValueEventListeners",
          returns: [],
          isNotMethod: true,
        },
      ]);
    },
    init3: () => {
      restoreStubbedMultiple([
        {
          object: vscode.window,
          method: "createQuickPick",
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
        },
      ]);
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      stubMultiple([
        {
          object: vscode.window,
          method: "createQuickPick",
          returns: quickPickInner,
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
          returns: false,
        },
        {
          object: quickPickAny,
          method: "onDidChangeValueEventListeners",
          returns: [],
          isNotMethod: true,
        },
      ]);
    },
    reload1: () => {
      restoreStubbedMultiple([
        { object: quickPickAny.config, method: "shouldUseItemsFilterPhrases" },
        { object: quickPickAny.config, method: "getHelpPhrase" },
        { object: quickPickAny.config, method: "getItemsFilterPhrases" },
      ]);

      return stubMultiple([
        {
          object: quickPickAny.config,
          method: "shouldUseItemsFilterPhrases",
        },
        {
          object: quickPickAny.config,
          method: "getHelpPhrase",
        },
        {
          object: quickPickAny.config,
          method: "getItemsFilterPhrases",
        },
      ]);
    },
    reload2: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "fetchConfig",
        },
        {
          object: quickPickAny,
          method: "helpPhrase",
          returns: "?",
          isNotMethod: true,
        },
        {
          object: quickPickAny,
          method: "itemsFilterPhrases",
          returns: {
            "0": "$$",
            "1": "^^",
            "4": "@@",
          },
          isNotMethod: true,
        },
      ]);

      return getQpHelpItems("?", {
        "0": "$$",
        "1": "^^",
        "4": "@@",
      });
    },
    isInitialized1: () => {
      const quickPickInner =
        vscode.window.createQuickPick<vscode.QuickPickItem>();
      stubMultiple([
        {
          object: quickPickAny,
          method: "quickPick",
          returns: quickPickInner,
          isNotMethod: true,
        },
      ]);
    },
    isInitialized2: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "quickPick",
          returns: undefined,
          isNotMethod: true,
          returnsIsUndefined: true,
        },
      ]);
    },
    show1: () => {
      return stubMultiple([
        {
          object: quickPickAny.quickPick,
          method: "show",
        },
        {
          object: quickPickAny,
          method: "isInitialized",
          returns: true,
        },
      ]);
    },
    loadItems1: () => {
      const items = getQpItems();
      stubMultiple([
        {
          object: quickPickAny,
          method: "items",
          returns: items,
          isNotMethod: true,
        },
      ]);

      return items;
    },
    loadItems2: () => {
      const helpItems = getQpHelpItems();
      stubMultiple([
        {
          object: quickPickAny,
          method: "helpItems",
          returns: helpItems,
          isNotMethod: true,
        },
      ]);

      return helpItems;
    },
    setPlaceholder2: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "shouldUseItemsFilterPhrases",
          returns: false,
          isNotMethod: true,
        },
      ]);
    },
    setPlaceholder3: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "shouldUseItemsFilterPhrases",
          returns: true,
          isNotMethod: true,
        },
        {
          object: quickPickAny,
          method: "helpPhrase",
          returns: "?",
          isNotMethod: true,
        },
      ]);
    },
    setPlaceholder4: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "shouldUseItemsFilterPhrases",
          returns: true,
          isNotMethod: true,
        },
        {
          object: quickPickAny,
          method: "helpPhrase",
          returns: "",
          isNotMethod: true,
        },
      ]);
    },
    reloadOnDidChangeValueEventListener1: () => {
      restoreStubbedMultiple([
        { object: quickPickAny.config, method: "shouldUseDebounce" },
      ]);
      stubMultiple([
        {
          object: quickPickAny,
          method: "onDidChangeValueEventListeners",
          returns: getQuickPickOnDidChangeValueEventListeners(),
          isNotMethod: true,
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
          returns: false,
        },
      ]);
    },
    reloadOnDidChangeValueEventListener2: () => {
      restoreStubbedMultiple([
        { object: quickPickAny.config, method: "shouldUseDebounce" },
      ]);
      stubMultiple([
        {
          object: quickPickAny,
          method: "onDidChangeValueEventListeners",
          returns: getQuickPickOnDidChangeValueEventListeners(1),
          isNotMethod: true,
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
          returns: true,
        },
      ]);
    },
    handleDidChangeValueClearing1: () => {
      stubMultiple([
        {
          object: quickPickAny.quickPick,
          method: "items",
          returns: getQpItems(),
        },
      ]);
    },
    handleDidChangeValue1: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "loadItems",
        },
      ]);
    },
    handleDidChangeValue2: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "loadItems",
        },
        {
          object: quickPickAny,
          method: "shouldUseItemsFilterPhrases",
          returns: true,
          isNotMethod: true,
        },
        {
          object: quickPickAny,
          method: "helpPhrase",
          returns: "?",
          isNotMethod: true,
        },
      ]);
    },
    handleDidAccept1: () => {
      const editor = getTextEditorStub();

      return stubMultiple([
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
      ]);
    },
    handleDidAccept2: () => {
      const editor = getTextEditorStub();

      restoreStubbedMultiple([
        {
          object: vscode.window,
          method: "showTextDocument",
        },
        {
          object: vscode.workspace,
          method: "openTextDocument",
        },
        {
          object: quickPickAny.config,
          method: "shouldHighlightSymbol",
        },
      ]);

      return stubMultiple([
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
          object: quickPickAny.config,
          method: "shouldHighlightSymbol",
          returns: true,
        },
      ]);
    },
    handleDidAccept3: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "loadItems",
        },
        {
          object: quickPickAny,
          method: "shouldUseItemsFilterPhrases",
          returns: true,
          isNotMethod: true,
        },
        {
          object: quickPickAny,
          method: "itemsFilterPhrases",
          returns: { 0: "$$", 1: "@@" },
          isNotMethod: true,
        },
      ]);
    },
  };
};
