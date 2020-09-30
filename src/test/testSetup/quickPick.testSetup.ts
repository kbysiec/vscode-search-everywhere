import * as vscode from "vscode";
import QuickPick from "../../quickPick";
import { getQuickPickOnDidChangeValueEventListeners } from "../util/eventMockFactory";
import { getUntitledItem } from "../util/itemMockFactory";
import { getQpItems, getQpHelpItems } from "../util/qpItemMockFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";

export const getTestSetups = (quickPick: QuickPick) => {
  const quickPickAny = quickPick as any;
  return {
    init1: () => {
      const quickPickInner = vscode.window.createQuickPick<
        vscode.QuickPickItem
      >();
      return stubMultiple([
        {
          object: vscode.window,
          method: "createQuickPick",
          returns: quickPickInner,
        },
      ]);
    },
    reloadOnDidChangeValueEventListener1: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "disposeOnDidChangeValueEventListeners",
        },
        {
          object: quickPickAny,
          method: "registerOnDidChangeValueEventListeners",
        },
      ]);
    },
    reload1: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "fetchConfig",
        },
        {
          object: quickPickAny,
          method: "fetchHelpData",
        },
      ]);
    },
    isInitialized1: () => {
      const quickPickInner = vscode.window.createQuickPick<
        vscode.QuickPickItem
      >();
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
    disposeOnDidChangeValueEventListeners1: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "onDidChangeValueEventListeners",
          returns: getQuickPickOnDidChangeValueEventListeners(),
          isNotMethod: true,
        },
      ]);
    },
    registerOnDidChangeValueEventListeners1: () => {
      restoreStubbedMultiple([
        { object: quickPickAny.config, method: "shouldUseDebounce" },
      ]);
      const onDidChangeValueEventListeners: vscode.Disposable[] = [];

      stubMultiple([
        {
          object: quickPickAny,
          method: "onDidChangeValueEventListeners",
          returns: onDidChangeValueEventListeners,
          isNotMethod: true,
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
          returns: false,
        },
      ]);
    },
    registerOnDidChangeValueEventListeners2: () => {
      restoreStubbedMultiple([
        { object: quickPickAny.config, method: "shouldUseDebounce" },
      ]);
      const onDidChangeValueEventListeners: vscode.Disposable[] = [];

      stubMultiple([
        {
          object: quickPickAny,
          method: "onDidChangeValueEventListeners",
          returns: onDidChangeValueEventListeners,
          isNotMethod: true,
        },
        {
          object: quickPickAny.config,
          method: "shouldUseDebounce",
          returns: true,
        },
      ]);
    },
    submit1: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "openSelected",
        },
      ]);
    },
    submit2: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "openSelected",
        },
      ]);
    },
    openSelectedBeforeEach: () => {
      return stubMultiple([
        {
          object: vscode.workspace,
          method: "openTextDocument",
        },
        {
          object: vscode.window,
          method: "showTextDocument",
        },
        {
          object: quickPickAny,
          method: "selectQpItem",
        },
      ]);
    },
    openSelectedAfterEach: () => {
      restoreStubbedMultiple([
        {
          object: vscode.workspace,
          method: "openTextDocument",
        },
        {
          object: vscode.window,
          method: "showTextDocument",
        },
        {
          object: quickPickAny,
          method: "selectQpItem",
        },
      ]);
    },
    openSelected3: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "setText",
        },
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
          returns: { "0": "$$" },
          isNotMethod: true,
        },
      ]);
    },
    selectQpItem1: async () => {
      const document = await vscode.workspace.openTextDocument(
        getUntitledItem()
      );
      const editor = await vscode.window.showTextDocument(document);
      const [editorRevealRangeStub] = stubMultiple([
        {
          object: editor,
          method: "revealRange",
        },
      ]);

      return {
        editor,
        editorRevealRangeStub,
      };
    },
    selectQpItem2: () => {
      restoreStubbedMultiple([
        { object: quickPickAny.config, method: "shouldHighlightSymbol" },
      ]);
      stubMultiple([
        {
          object: quickPickAny.config,
          method: "shouldHighlightSymbol",
          returns: true,
        },
      ]);
    },
    selectQpItem3: () => {
      restoreStubbedMultiple([
        { object: quickPickAny.config, method: "shouldHighlightSymbol" },
      ]);
      stubMultiple([
        {
          object: quickPickAny.config,
          method: "shouldHighlightSymbol",
          returns: false,
        },
      ]);
    },
    getHelpItems1: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "helpPhrase",
          returns: "?",
          isNotMethod: true,
        },
        {
          object: quickPickAny,
          method: "itemsFilterPhrases",
          returns: { 0: "$$", 4: "@@" },
          isNotMethod: true,
        },
      ]);
    },
    getHelpItemForKind1: () => {
      stubMultiple([
        {
          object: quickPickAny,
          method: "helpPhrase",
          returns: "?",
          isNotMethod: true,
        },
      ]);
    },
    fetchConfig1: () => {
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
    fetchHelpData1: () => {
      const helpItemsFromConfig = getQpHelpItems();
      stubMultiple([
        {
          object: quickPickAny,
          method: "helpItems",
          returns: [],
          isNotMethod: true,
        },
        {
          object: quickPickAny,
          method: "getHelpItems",
          returns: helpItemsFromConfig,
        },
      ]);

      return helpItemsFromConfig;
    },
    onDidChangeValue1: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "loadItems",
        },
      ]);
    },
    onDidChangeValue2: () => {
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
    onDidAccept1: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "submit",
        },
      ]);
    },
    onDidHide1: () => {
      return stubMultiple([
        {
          object: quickPickAny,
          method: "setText",
        },
      ]);
    },
  };
};
