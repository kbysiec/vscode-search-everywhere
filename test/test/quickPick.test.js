"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const vscode = require("vscode");
const quickPick_1 = require("../../src/quickPick");
const quickPick_testSetup_1 = require("../testSetup/quickPick.testSetup");
const eventMockFactory_1 = require("../util/eventMockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
describe("QuickPick", () => {
    let setups;
    before(() => {
        setups = (0, quickPick_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("init", () => {
        it("should vscode quick pick be created", () => {
            const [createQuickPickStub] = setups.init.setupForCreatingVscodeQuickPick();
            quickPick_1.quickPick.init();
            chai_1.assert.equal(createQuickPickStub.calledOnce, true);
        });
        it("should register two event listeners if shouldUseDebounce returns true", () => {
            setups.init.setupForRegisteringTwoEventListenersWhenDebounceEnabled();
            quickPick_1.quickPick.init();
            chai_1.assert.equal(quickPick_1.quickPick.getOnDidChangeValueEventListeners().length, 2);
        });
        it("should register one event listener if shouldUseDebounce returns false", () => {
            setups.init.setupForRegisteringOneEventListenerWhenDebounceDisabled();
            quickPick_1.quickPick.init();
            chai_1.assert.equal(quickPick_1.quickPick.getOnDidChangeValueEventListeners().length, 1);
        });
    });
    describe("reloadSortingSettings", () => {
        it("should set that items should be sorted", () => {
            setups.reloadSortingSettings.setupForSettingSortingEnabled();
            quickPick_1.quickPick.reloadSortingSettings();
            chai_1.assert.equal(quickPick_1.quickPick.getShouldItemsBeSorted(), true);
        });
        it("should set sortByLabel on quickPick control to have separators between items", () => {
            setups.reloadSortingSettings.setupForSettingSortByLabelToFalseForSeparators();
            quickPick_1.quickPick.reloadSortingSettings();
            chai_1.assert.equal(quickPick_1.quickPick.getControl().sortByLabel, false);
        });
    });
    describe("reloadOnDidChangeValueEventListener", () => {
        it("should dispose existing event listeners and register one event listener if shouldUseDebounce returns false", () => {
            setups.reloadOnDidChangeValueEventListener.setupForRegisteringOneListenerWhenDebounceDisabled();
            quickPick_1.quickPick.reloadOnDidChangeValueEventListener();
            chai_1.assert.equal(quickPick_1.quickPick.getOnDidChangeValueEventListeners().length, 1);
        });
        it("should dispose existing event listeners and register two event listeners if shouldUseDebounce returns true", () => {
            setups.reloadOnDidChangeValueEventListener.setupForRegisteringTwoListenersWhenDebounceEnabled();
            quickPick_1.quickPick.reloadOnDidChangeValueEventListener();
            chai_1.assert.equal(quickPick_1.quickPick.getOnDidChangeValueEventListeners().length, 2);
        });
    });
    describe("reload", () => {
        it("should fetch configuration from config component", () => {
            const [shouldUseItemsFilterPhrasesStub, getHelpPhraseStub, getItemsFilterPhrasesStub,] = setups.reload.setupForFetchingConfigurationFromConfig();
            quickPick_1.quickPick.reload();
            chai_1.assert.equal(shouldUseItemsFilterPhrasesStub.calledOnce, true);
            chai_1.assert.equal(getHelpPhraseStub.calledOnce, true);
            chai_1.assert.equal(getItemsFilterPhrasesStub.calledOnce, true);
        });
        it("should fetch help data", () => {
            const qpHelpItems = setups.reload.setupForFetchingHelpData();
            quickPick_1.quickPick.reload();
            chai_1.assert.deepEqual(quickPick_1.quickPick.getHelpItems(), qpHelpItems);
        });
    });
    describe("isInitialized", () => {
        it("should return true if vscode quick pick is initialized", () => {
            setups.isInitialized.setupForReturningTrueWhenQuickPickInitialized();
            chai_1.assert.equal(quickPick_1.quickPick.isInitialized(), true);
        });
        it("should return false if vscode quick pick is not initialized", () => {
            setups.isInitialized.setupForReturningFalseWhenQuickPickNotInitialized();
            chai_1.assert.equal(quickPick_1.quickPick.isInitialized(), false);
        });
    });
    describe("show", () => {
        it("should vscode.quickPick.show method be invoked if quick pick is initialized", () => {
            const [showStub] = setups.show.setupForInvokingShowWhenQuickPickInitialized();
            quickPick_1.quickPick.show();
            chai_1.assert.equal(showStub.calledOnce, true);
        });
    });
    describe("loadItems", () => {
        it("should unsorted items be loaded", () => {
            const items = setups.loadItems.setupForLoadingUnsortedItems();
            quickPick_1.quickPick.loadItems();
            chai_1.assert.deepEqual(quickPick_1.quickPick.getControl().items, items);
        });
        it("should sorted items be loaded", () => {
            const items = setups.loadItems.setupForLoadingSortedItems();
            quickPick_1.quickPick.loadItems();
            chai_1.assert.deepEqual(quickPick_1.quickPick.getControl().items, items);
        });
    });
    describe("loadHelpItems", () => {
        it("should help items be loaded", () => {
            const helpItems = setups.loadHelpItems.setupForLoadingHelpItems();
            quickPick_1.quickPick.loadHelpItems();
            chai_1.assert.deepEqual(quickPick_1.quickPick.getControl().items, helpItems);
        });
    });
    describe("setItems", () => {
        it("should items be set", () => {
            quickPick_1.quickPick.setItems((0, qpItemMockFactory_1.getQpItems)());
            chai_1.assert.equal(quickPick_1.quickPick.getItems().length, 2);
        });
        it("should items have assigned buttons property", () => {
            quickPick_1.quickPick.setItems((0, qpItemMockFactory_1.getQpItems)());
            chai_1.assert.deepEqual(quickPick_1.quickPick.getItems()[0].buttons, [
                {
                    iconPath: new vscode.ThemeIcon("open-preview"),
                    tooltip: "Open to the side",
                },
            ]);
        });
    });
    describe("showLoading", () => {
        it("should vscode.quickPick.busy property be set", () => {
            setups.showLoading.setupForSettingBusyProperty();
            quickPick_1.quickPick.showLoading(true);
            chai_1.assert.equal(quickPick_1.quickPick.getControl().busy, true);
        });
    });
    describe("setText", () => {
        it("should text be set", () => {
            setups.setText.setupForSettingText();
            const text = "test text";
            quickPick_1.quickPick.setText(text);
            chai_1.assert.equal(quickPick_1.quickPick.getControl().value, text);
        });
    });
    describe("setPlaceholder", () => {
        it("should set placeholder to loading text", () => {
            setups.setPlaceholder.setupForSettingLoadingPlaceholder();
            quickPick_1.quickPick.setPlaceholder(true);
            chai_1.assert.equal(quickPick_1.quickPick.getControl().placeholder, "Please wait, loading...");
        });
        it("should set placeholder to searching text if shouldUseItemsFilterPhrase is false", () => {
            setups.setPlaceholder.setupForSettingSearchingPlaceholderWhenFilterPhrasesDisabled();
            quickPick_1.quickPick.setPlaceholder(false);
            chai_1.assert.equal(quickPick_1.quickPick.getControl().placeholder, "Start typing file or symbol name...");
        });
        it("should set placeholder to help text if shouldUseItemsFilterPhrase is true", () => {
            setups.setPlaceholder.setupForSettingHelpPlaceholderWhenFilterPhrasesEnabled();
            quickPick_1.quickPick.setPlaceholder(false);
            chai_1.assert.equal(quickPick_1.quickPick.getControl().placeholder, "Type ? for help or start typing file or symbol name...");
        });
        it("should change quick pick placeholder to help text with not set help phrase if shouldUseItemsFilterPhrase is true", () => {
            setups.setPlaceholder.setupForSettingNotSetHelpPlaceholderWhenHelpPhraseEmpty();
            quickPick_1.quickPick.setPlaceholder(false);
            chai_1.assert.equal(quickPick_1.quickPick.getControl().placeholder, "Help phrase not set. Start typing file or symbol name...");
        });
    });
    describe("setOnDidChangeValueEventListeners", () => {
        it("should set new array of onDidChangeValueEventListeners", () => {
            quickPick_1.quickPick.setOnDidChangeValueEventListeners((0, eventMockFactory_1.getQuickPickOnDidChangeValueEventListeners)(2));
            chai_1.assert.equal(quickPick_1.quickPick.getOnDidChangeValueEventListeners().length, 2);
        });
    });
    describe("handleDidChangeValueClearing", () => {
        it("should clear quick pick items", () => {
            setups.handleDidChangeValueClearing.setupForClearingQuickPickItems();
            quickPick_1.quickPick.handleDidChangeValueClearing();
            chai_1.assert.equal(quickPick_1.quickPick.getControl().items.length, 0);
        });
    });
    describe("handleDidChangeValue", () => {
        it("should load workspace items", () => __awaiter(void 0, void 0, void 0, function* () {
            const [loadItemsStub] = setups.handleDidChangeValue.setupForLoadingWorkspaceItems();
            yield quickPick_1.quickPick.handleDidChangeValue("test text");
            chai_1.assert.equal(loadItemsStub.calledOnce, true);
        }));
        it("should load help items", () => __awaiter(void 0, void 0, void 0, function* () {
            const [loadItemsStub] = setups.handleDidChangeValue.setupForLoadingHelpItems();
            yield quickPick_1.quickPick.handleDidChangeValue("?");
            chai_1.assert.equal(loadItemsStub.calledOnce, true);
        }));
    });
    describe("handleDidAccept", () => {
        it("should open selected qpItem with uri scheme equals to 'file'", () => __awaiter(void 0, void 0, void 0, function* () {
            const [revealRangeStub] = setups.handleDidAccept.setupForOpeningFileSchemeItem();
            yield quickPick_1.quickPick.handleDidAccept();
            chai_1.assert.equal(revealRangeStub.calledOnce, true);
        }));
        it("should open selected qpItem with uri scheme equals to 'untitled'", () => __awaiter(void 0, void 0, void 0, function* () {
            const [revealRangeStub] = setups.handleDidAccept.setupForOpeningUntitledSchemeItem();
            yield quickPick_1.quickPick.handleDidAccept();
            chai_1.assert.equal(revealRangeStub.calledOnce, true);
        }));
        it("should open selected qpItem which is help item", () => __awaiter(void 0, void 0, void 0, function* () {
            const [loadItemsStub] = setups.handleDidAccept.setupForOpeningHelpItem();
            yield quickPick_1.quickPick.handleDidAccept();
            chai_1.assert.equal(loadItemsStub.calledOnce, true);
        }));
    });
    describe("handleDidHide", () => {
        it("should setText method be invoked with empty string as argument", () => {
            setups.handleDidHide.setupForSettingEmptyText();
            quickPick_1.quickPick.handleDidHide();
            chai_1.assert.equal(quickPick_1.quickPick.getControl().value, "");
        });
    });
    describe("handleDidTriggerItemButton", () => {
        it("should openItem method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [openItemStub] = setups.handleDidTriggerItemButton.setupForInvokingOpenItem();
            yield quickPick_1.quickPick.handleDidTriggerItemButton((0, eventMockFactory_1.getQuickPickItemButtonEvent)());
            chai_1.assert.equal(openItemStub.calledOnce, true);
        }));
    });
});
//# sourceMappingURL=quickPick.test.js.map