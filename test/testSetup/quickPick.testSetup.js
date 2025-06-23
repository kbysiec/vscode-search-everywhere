"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const config = require("../../src/config");
const quickPick_1 = require("../../src/quickPick");
const eventMockFactory_1 = require("../util/eventMockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
const stubFactory_1 = require("../util/stubFactory");
const stubHelpers_1 = require("../util/stubHelpers");
function stubControl(sandbox) {
    const quickPickInner = vscode.window.createQuickPick();
    (0, stubHelpers_1.stubMultiple)([
        {
            object: quickPick_1.quickPick,
            method: "getControl",
            returns: quickPickInner,
        },
    ], sandbox);
}
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        init: {
            setupForCreatingVscodeQuickPick: () => {
                const quickPickInner = vscode.window.createQuickPick();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.window,
                        method: "createQuickPick",
                        returns: quickPickInner,
                    },
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
                    {
                        object: config,
                        method: "fetchShouldUseDebounce",
                    },
                    {
                        object: config,
                        method: "fetchShouldItemsBeSorted",
                    },
                ], sandbox);
            },
            setupForRegisteringTwoEventListenersWhenDebounceEnabled: () => {
                const quickPickInner = vscode.window.createQuickPick();
                (0, stubHelpers_1.stubMultiple)([
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
                        object: quickPick_1.quickPick,
                        method: "getOnDidChangeValueEventListeners",
                        returns: [],
                    },
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
                    {
                        object: config,
                        method: "fetchShouldItemsBeSorted",
                    },
                ], sandbox);
            },
            setupForRegisteringOneEventListenerWhenDebounceDisabled: () => {
                const quickPickInner = vscode.window.createQuickPick();
                (0, stubHelpers_1.stubMultiple)([
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
                        object: quickPick_1.quickPick,
                        method: "getOnDidChangeValueEventListeners",
                        returns: [],
                    },
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
                    {
                        object: config,
                        method: "fetchShouldItemsBeSorted",
                    },
                ], sandbox);
            },
        },
        reloadSortingSettings: {
            setupForSettingSortingEnabled: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchShouldItemsBeSorted",
                        returns: true,
                    },
                ], sandbox);
            },
            setupForSettingSortByLabelToFalseForSeparators: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchShouldItemsBeSorted",
                        returns: true,
                    },
                ], sandbox);
            },
        },
        reloadOnDidChangeValueEventListener: {
            setupForRegisteringOneListenerWhenDebounceDisabled: () => {
                stubControl(sandbox);
                let listeners = [];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getOnDidChangeValueEventListeners",
                        callsFake: () => listeners,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "setOnDidChangeValueEventListeners",
                        callsFake: (newOnDidChangeValueEventListeners) => (listeners = newOnDidChangeValueEventListeners),
                    },
                    {
                        object: config,
                        method: "fetchShouldUseDebounce",
                        returns: false,
                    },
                ], sandbox);
                listeners.push(...(0, eventMockFactory_1.getQuickPickOnDidChangeValueEventListeners)());
                return listeners;
            },
            setupForRegisteringTwoListenersWhenDebounceEnabled: () => {
                stubControl(sandbox);
                let listeners = [];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getOnDidChangeValueEventListeners",
                        callsFake: () => listeners,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "setOnDidChangeValueEventListeners",
                        callsFake: (newOnDidChangeValueEventListeners) => (listeners = newOnDidChangeValueEventListeners),
                    },
                    {
                        object: config,
                        method: "fetchShouldUseDebounce",
                        returns: true,
                    },
                ], sandbox);
                listeners.push(...(0, eventMockFactory_1.getQuickPickOnDidChangeValueEventListeners)(1));
                return listeners;
            },
        },
        reload: {
            setupForFetchingConfigurationFromConfig: () => {
                return (0, stubHelpers_1.stubMultiple)([
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
                    {
                        object: config,
                        method: "fetchShouldItemsBeSorted",
                    },
                ], sandbox);
            },
            setupForFetchingHelpData: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "fetchConfig",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getHelpPhrase",
                        returns: "?",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getItemsFilterPhrases",
                        returns: {
                            "0": "$$",
                            "1": "^^",
                            "4": "@@",
                        },
                    },
                    {
                        object: config,
                        method: "fetchShouldItemsBeSorted",
                    },
                ], sandbox);
                return (0, qpItemMockFactory_1.getQpHelpItems)("?", {
                    "0": "$$",
                    "1": "^^",
                    "4": "@@",
                });
            },
        },
        isInitialized: {
            setupForReturningTrueWhenQuickPickInitialized: () => {
                const quickPickInner = vscode.window.createQuickPick();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getControl",
                        returns: quickPickInner,
                    },
                ], sandbox);
            },
            setupForReturningFalseWhenQuickPickNotInitialized: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getControl",
                        returns: undefined,
                        returnsIsUndefined: true,
                    },
                ], sandbox);
            },
        },
        show: {
            setupForInvokingShowWhenQuickPickInitialized: () => {
                const quickPickInner = vscode.window.createQuickPick();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPickInner,
                        method: "show",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getControl",
                        returns: quickPickInner,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "isInitialized",
                        returns: true,
                    },
                ], sandbox);
            },
        },
        loadItems: {
            setupForLoadingUnsortedItems: () => {
                stubControl(sandbox);
                const items = (0, qpItemMockFactory_1.getQpItems)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getItems",
                        returns: items,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getShouldItemsBeSorted",
                        returns: false,
                    },
                ], sandbox);
                return items;
            },
            setupForLoadingSortedItems: () => {
                stubControl(sandbox);
                const items = [
                    (0, qpItemMockFactory_1.getQpItem)(undefined, undefined, undefined, undefined, undefined, 1),
                    (0, qpItemMockFactory_1.getQpItem)(undefined, 2),
                    (0, qpItemMockFactory_1.getQpItem)(undefined, 3, undefined, undefined, undefined, 4),
                    (0, qpItemMockFactory_1.getQpItem)(undefined, 4, undefined, undefined, undefined, 0),
                ];
                items.unshift();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getItems",
                        returns: items,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getShouldItemsBeSorted",
                        returns: true,
                    },
                ], sandbox);
                const separatorItems = {
                    file: {
                        label: "File",
                        kind: vscode.QuickPickItemKind.Separator,
                        symbolKind: vscode.QuickPickItemKind.Separator,
                        uri: vscode.Uri.parse("#"),
                    },
                    module: {
                        label: "Module",
                        kind: vscode.QuickPickItemKind.Separator,
                        symbolKind: vscode.QuickPickItemKind.Separator,
                        uri: vscode.Uri.parse("#"),
                    },
                    class: {
                        label: "Class",
                        kind: vscode.QuickPickItemKind.Separator,
                        symbolKind: vscode.QuickPickItemKind.Separator,
                        uri: vscode.Uri.parse("#"),
                    },
                };
                const itemsWithSeparator = [
                    separatorItems.file,
                    (0, qpItemMockFactory_1.getQpItem)(undefined, 2),
                    (0, qpItemMockFactory_1.getQpItem)(undefined, 4),
                    separatorItems.module,
                    (0, qpItemMockFactory_1.getQpItem)(undefined, undefined, undefined, undefined, undefined, 1),
                    separatorItems.class,
                    (0, qpItemMockFactory_1.getQpItem)(undefined, 3, undefined, undefined, undefined, 4),
                ];
                return itemsWithSeparator;
            },
        },
        loadHelpItems: {
            setupForLoadingHelpItems: () => {
                stubControl(sandbox);
                const helpItems = (0, qpItemMockFactory_1.getQpHelpItems)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getHelpItems",
                        returns: helpItems,
                    },
                ], sandbox);
                return helpItems;
            },
        },
        showLoading: {
            setupForSettingBusyProperty: () => {
                stubControl(sandbox);
            },
        },
        setText: {
            setupForSettingText: () => {
                stubControl(sandbox);
            },
        },
        setPlaceholder: {
            setupForSettingLoadingPlaceholder: () => {
                stubControl(sandbox);
            },
            setupForSettingSearchingPlaceholderWhenFilterPhrasesDisabled: () => {
                stubControl(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getShouldUseItemsFilterPhrases",
                        returns: false,
                    },
                ], sandbox);
            },
            setupForSettingHelpPlaceholderWhenFilterPhrasesEnabled: () => {
                stubControl(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getShouldUseItemsFilterPhrases",
                        returns: true,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getHelpPhrase",
                        returns: "?",
                    },
                ], sandbox);
            },
            setupForSettingNotSetHelpPlaceholderWhenHelpPhraseEmpty: () => {
                stubControl(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getShouldUseItemsFilterPhrases",
                        returns: true,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getHelpPhrase",
                        returns: "",
                    },
                ], sandbox);
            },
        },
        handleDidChangeValueClearing: {
            setupForClearingQuickPickItems: () => {
                stubControl(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "getItems",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
        },
        handleDidChangeValue: {
            setupForLoadingWorkspaceItems: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                ], sandbox);
            },
            setupForLoadingHelpItems: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "loadHelpItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getShouldUseItemsFilterPhrases",
                        returns: true,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getHelpPhrase",
                        returns: "?",
                    },
                ], sandbox);
            },
        },
        handleDidAccept: {
            setupForOpeningFileSchemeItem: () => {
                const editor = (0, stubFactory_1.getTextEditorStub)();
                const quickPickInner = vscode.window.createQuickPick();
                return (0, stubHelpers_1.stubMultiple)([
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
                        object: quickPick_1.quickPick,
                        method: "getControl",
                        returns: quickPickInner,
                    },
                    {
                        object: quickPickInner,
                        method: "selectedItems",
                        returns: [(0, qpItemMockFactory_1.getQpItem)()],
                        isNotMethod: true,
                    },
                    {
                        object: config,
                        method: "fetchShouldHighlightSymbol",
                    },
                ], sandbox);
            },
            setupForOpeningUntitledSchemeItem: () => {
                const editor = (0, stubFactory_1.getTextEditorStub)();
                const quickPickInner = vscode.window.createQuickPick();
                return (0, stubHelpers_1.stubMultiple)([
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
                        object: quickPick_1.quickPick,
                        method: "getControl",
                        returns: quickPickInner,
                    },
                    {
                        object: quickPickInner,
                        method: "selectedItems",
                        returns: [(0, qpItemMockFactory_1.getUntitledQpItem)()],
                        isNotMethod: true,
                    },
                ], sandbox);
            },
            setupForOpeningHelpItem: () => {
                const quickPickInner = vscode.window.createQuickPick();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "loadItems",
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getShouldUseItemsFilterPhrases",
                        returns: true,
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getItemsFilterPhrases",
                        returns: { 0: "$$", 1: "@@" },
                    },
                    {
                        object: quickPick_1.quickPick,
                        method: "getControl",
                        returns: quickPickInner,
                    },
                    {
                        object: quickPickInner,
                        method: "selectedItems",
                        returns: [(0, qpItemMockFactory_1.getQpHelpItem)("?", "0", "$$")],
                        isNotMethod: true,
                    },
                ], sandbox);
            },
        },
        handleDidHide: {
            setupForSettingEmptyText: () => {
                stubControl(sandbox);
            },
        },
        handleDidTriggerItemButton: {
            setupForInvokingOpenItem: () => {
                stubControl(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: quickPick_1.quickPick,
                        method: "openItem",
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=quickPick.testSetup.js.map