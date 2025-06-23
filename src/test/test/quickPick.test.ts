import { assert } from "chai";
import * as vscode from "vscode";
import { quickPick } from "../../quickPick";
import { getTestSetups } from "../testSetup/quickPick.testSetup";
import {
  getQuickPickItemButtonEvent,
  getQuickPickOnDidChangeValueEventListeners,
} from "../util/eventMockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("QuickPick", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("init", () => {
    it("should vscode quick pick be created", () => {
      const [createQuickPickStub] =
        setups.init.setupForCreatingVscodeQuickPick();
      quickPick.init();

      assert.equal(createQuickPickStub.calledOnce, true);
    });

    it("should register two event listeners if shouldUseDebounce returns true", () => {
      setups.init.setupForRegisteringTwoEventListenersWhenDebounceEnabled();
      quickPick.init();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 2);
    });

    it("should register one event listener if shouldUseDebounce returns false", () => {
      setups.init.setupForRegisteringOneEventListenerWhenDebounceDisabled();
      quickPick.init();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 1);
    });
  });

  describe("reloadSortingSettings", () => {
    it("should set that items should be sorted", () => {
      setups.reloadSortingSettings.setupForSettingSortingEnabled();
      quickPick.reloadSortingSettings();

      assert.equal(quickPick.getShouldItemsBeSorted(), true);
    });

    it("should set sortByLabel on quickPick control to have separators between items", () => {
      setups.reloadSortingSettings.setupForSettingSortByLabelToFalseForSeparators();
      quickPick.reloadSortingSettings();

      assert.equal((quickPick.getControl() as any).sortByLabel, false);
    });
  });

  describe("reloadOnDidChangeValueEventListener", () => {
    it("should dispose existing event listeners and register one event listener if shouldUseDebounce returns false", () => {
      setups.reloadOnDidChangeValueEventListener.setupForRegisteringOneListenerWhenDebounceDisabled();
      quickPick.reloadOnDidChangeValueEventListener();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 1);
    });

    it("should dispose existing event listeners and register two event listeners if shouldUseDebounce returns true", () => {
      setups.reloadOnDidChangeValueEventListener.setupForRegisteringTwoListenersWhenDebounceEnabled();
      quickPick.reloadOnDidChangeValueEventListener();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 2);
    });
  });

  describe("reload", () => {
    it("should fetch configuration from config component", () => {
      const [
        shouldUseItemsFilterPhrasesStub,
        getHelpPhraseStub,
        getItemsFilterPhrasesStub,
      ] = setups.reload.setupForFetchingConfigurationFromConfig();
      quickPick.reload();

      assert.equal(shouldUseItemsFilterPhrasesStub.calledOnce, true);
      assert.equal(getHelpPhraseStub.calledOnce, true);
      assert.equal(getItemsFilterPhrasesStub.calledOnce, true);
    });

    it("should fetch help data", () => {
      const qpHelpItems = setups.reload.setupForFetchingHelpData();
      quickPick.reload();

      assert.deepEqual(quickPick.getHelpItems(), qpHelpItems);
    });
  });

  describe("isInitialized", () => {
    it("should return true if vscode quick pick is initialized", () => {
      setups.isInitialized.setupForReturningTrueWhenQuickPickInitialized();
      assert.equal(quickPick.isInitialized(), true);
    });

    it("should return false if vscode quick pick is not initialized", () => {
      setups.isInitialized.setupForReturningFalseWhenQuickPickNotInitialized();
      assert.equal(quickPick.isInitialized(), false);
    });
  });

  describe("show", () => {
    it("should vscode.quickPick.show method be invoked if quick pick is initialized", () => {
      const [showStub] =
        setups.show.setupForInvokingShowWhenQuickPickInitialized();
      quickPick.show();

      assert.equal(showStub.calledOnce, true);
    });
  });

  describe("loadItems", () => {
    it("should unsorted items be loaded", () => {
      const items = setups.loadItems.setupForLoadingUnsortedItems();
      quickPick.loadItems();

      assert.deepEqual(quickPick.getControl().items, items);
    });

    it("should sorted items be loaded", () => {
      const items = setups.loadItems.setupForLoadingSortedItems();
      quickPick.loadItems();

      assert.deepEqual(quickPick.getControl().items, items);
    });
  });

  describe("loadHelpItems", () => {
    it("should help items be loaded", () => {
      const helpItems = setups.loadHelpItems.setupForLoadingHelpItems();
      quickPick.loadHelpItems();

      assert.deepEqual(quickPick.getControl().items, helpItems);
    });
  });

  describe("setItems", () => {
    it("should items be set", () => {
      quickPick.setItems(getQpItems());

      assert.equal(quickPick.getItems().length, 2);
    });

    it("should items have assigned buttons property", () => {
      quickPick.setItems(getQpItems());

      assert.deepEqual(quickPick.getItems()[0].buttons, [
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
      quickPick.showLoading(true);

      assert.equal(quickPick.getControl().busy, true);
    });
  });

  describe("setText", () => {
    it("should text be set", () => {
      setups.setText.setupForSettingText();
      const text = "test text";
      quickPick.setText(text);

      assert.equal(quickPick.getControl().value, text);
    });
  });

  describe("setPlaceholder", () => {
    it("should set placeholder to loading text", () => {
      setups.setPlaceholder.setupForSettingLoadingPlaceholder();
      quickPick.setPlaceholder(true);
      assert.equal(
        quickPick.getControl().placeholder,
        "Please wait, loading..."
      );
    });

    it("should set placeholder to searching text if shouldUseItemsFilterPhrase is false", () => {
      setups.setPlaceholder.setupForSettingSearchingPlaceholderWhenFilterPhrasesDisabled();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPick.getControl().placeholder,
        "Start typing file or symbol name..."
      );
    });

    it("should set placeholder to help text if shouldUseItemsFilterPhrase is true", () => {
      setups.setPlaceholder.setupForSettingHelpPlaceholderWhenFilterPhrasesEnabled();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPick.getControl().placeholder,
        "Type ? for help or start typing file or symbol name..."
      );
    });

    it("should change quick pick placeholder to help text with not set help phrase if shouldUseItemsFilterPhrase is true", () => {
      setups.setPlaceholder.setupForSettingNotSetHelpPlaceholderWhenHelpPhraseEmpty();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPick.getControl().placeholder,
        "Help phrase not set. Start typing file or symbol name..."
      );
    });
  });

  describe("setOnDidChangeValueEventListeners", () => {
    it("should set new array of onDidChangeValueEventListeners", () => {
      quickPick.setOnDidChangeValueEventListeners(
        getQuickPickOnDidChangeValueEventListeners(2)
      );
      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 2);
    });
  });

  describe("handleDidChangeValueClearing", () => {
    it("should clear quick pick items", () => {
      setups.handleDidChangeValueClearing.setupForClearingQuickPickItems();
      quickPick.handleDidChangeValueClearing();

      assert.equal(quickPick.getControl().items.length, 0);
    });
  });

  describe("handleDidChangeValue", () => {
    it("should load workspace items", async () => {
      const [loadItemsStub] =
        setups.handleDidChangeValue.setupForLoadingWorkspaceItems();
      await quickPick.handleDidChangeValue("test text");

      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("should load help items", async () => {
      const [loadItemsStub] =
        setups.handleDidChangeValue.setupForLoadingHelpItems();
      await quickPick.handleDidChangeValue("?");

      assert.equal(loadItemsStub.calledOnce, true);
    });
  });

  describe("handleDidAccept", () => {
    it("should open selected qpItem with uri scheme equals to 'file'", async () => {
      const [revealRangeStub] =
        setups.handleDidAccept.setupForOpeningFileSchemeItem();
      await quickPick.handleDidAccept();
      assert.equal(revealRangeStub.calledOnce, true);
    });

    it("should open selected qpItem with uri scheme equals to 'untitled'", async () => {
      const [revealRangeStub] =
        setups.handleDidAccept.setupForOpeningUntitledSchemeItem();
      await quickPick.handleDidAccept();

      assert.equal(revealRangeStub.calledOnce, true);
    });

    it("should open selected qpItem which is help item", async () => {
      const [loadItemsStub] = setups.handleDidAccept.setupForOpeningHelpItem();
      await quickPick.handleDidAccept();

      assert.equal(loadItemsStub.calledOnce, true);
    });
  });

  describe("handleDidHide", () => {
    it("should setText method be invoked with empty string as argument", () => {
      setups.handleDidHide.setupForSettingEmptyText();
      quickPick.handleDidHide();

      assert.equal(quickPick.getControl().value, "");
    });
  });

  describe("handleDidTriggerItemButton", () => {
    it("should openItem method be invoked", async () => {
      const [openItemStub] =
        setups.handleDidTriggerItemButton.setupForInvokingOpenItem();
      await quickPick.handleDidTriggerItemButton(getQuickPickItemButtonEvent());

      assert.equal(openItemStub.calledOnce, true);
    });
  });
});
