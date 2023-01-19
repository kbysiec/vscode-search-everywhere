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
    it("1: should vscode quick pick be created", () => {
      const [createQuickPickStub] = setups.init1();
      quickPick.init();

      assert.equal(createQuickPickStub.calledOnce, true);
    });

    it(`2: should register two event listeners
      if shouldUseDebounce returns true`, () => {
      setups.init2();
      quickPick.init();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 2);
    });

    it(`3: should register two event listeners
      if shouldUseDebounce returns false`, () => {
      setups.init3();
      quickPick.init();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 1);
    });
  });

  describe("reloadSortingSettings", () => {
    it(`1: should set that items should be sorted`, () => {
      setups.reloadSortingSettings1();
      quickPick.reloadSortingSettings();

      assert.equal(quickPick.getShouldItemsBeSorted(), true);
    });

    it(`2: should set sortByLabel on quickPick control
      to have separators between items`, () => {
      setups.reloadSortingSettings2();
      quickPick.reloadSortingSettings();

      assert.equal((quickPick.getControl() as any).sortByLabel, false);
    });
  });

  describe("reloadOnDidChangeValueEventListener", () => {
    it(`1: should dispose existing event listeners and
      register one event listener if shouldUseDebounce returns false`, () => {
      setups.reloadOnDidChangeValueEventListener1();
      quickPick.reloadOnDidChangeValueEventListener();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 1);
    });

    it(`2: should dispose existing event listeners and
      register two event listeners if shouldUseDebounce returns true`, () => {
      setups.reloadOnDidChangeValueEventListener2();
      quickPick.reloadOnDidChangeValueEventListener();

      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 2);
    });
  });

  describe("reload", () => {
    it("1: should fetch configuration from config component", () => {
      const [
        shouldUseItemsFilterPhrasesStub,
        getHelpPhraseStub,
        getItemsFilterPhrasesStub,
      ] = setups.reload1();
      quickPick.reload();

      assert.equal(shouldUseItemsFilterPhrasesStub.calledOnce, true);
      assert.equal(getHelpPhraseStub.calledOnce, true);
      assert.equal(getItemsFilterPhrasesStub.calledOnce, true);
    });

    it("2: should fetch help data", () => {
      const qpHelpItems = setups.reload2();
      quickPick.reload();

      assert.deepEqual(quickPick.getHelpItems(), qpHelpItems);
    });
  });

  describe("isInitialized", () => {
    it("1: should return true if vscode quick pick is initialized", () => {
      setups.isInitialized1();
      assert.equal(quickPick.isInitialized(), true);
    });

    it("2: should return false if vscode quick pick is not initialized", () => {
      setups.isInitialized2();
      assert.equal(quickPick.isInitialized(), false);
    });
  });

  describe("show", () => {
    it(`1: should vscode.quickPick.show method be invoked
    if quick pick is initialized`, () => {
      const [showStub] = setups.show1();
      quickPick.show();

      assert.equal(showStub.calledOnce, true);
    });
  });

  describe("loadItems", () => {
    it("1: should unsorted items be loaded", () => {
      const items = setups.loadItems1();
      quickPick.loadItems();

      assert.deepEqual(quickPick.getControl().items, items);
    });

    it("2: should sorted items be loaded", () => {
      const items = setups.loadItems2();
      quickPick.loadItems();

      assert.deepEqual(quickPick.getControl().items, items);
    });
  });

  describe("loadHelpItems", () => {
    it("1: should help items be loaded", () => {
      const helpItems = setups.loadHelpItems1();
      quickPick.loadHelpItems();

      assert.deepEqual(quickPick.getControl().items, helpItems);
    });
  });

  describe("setItems", () => {
    it("1: should items be set", () => {
      quickPick.setItems(getQpItems());

      assert.equal(quickPick.getItems().length, 2);
    });

    it("2: should items have assigned buttons property", () => {
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
    it("1: should vscode.quickPick.busy property be set", () => {
      setups.showLoading1();
      quickPick.showLoading(true);

      assert.equal(quickPick.getControl().busy, true);
    });
  });

  describe("setText", () => {
    it("1: should text be set", () => {
      setups.setText1();
      const text = "test text";
      quickPick.setText(text);

      assert.equal(quickPick.getControl().value, text);
    });
  });

  describe("setPlaceholder", () => {
    it("1: should set placeholder to loading text", () => {
      setups.setPlaceholder1();
      quickPick.setPlaceholder(true);
      assert.equal(
        quickPick.getControl().placeholder,
        "Please wait, loading..."
      );
    });

    it("2: should set placeholder to searching text if shouldUseItemsFilterPhrase is false", () => {
      setups.setPlaceholder2();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPick.getControl().placeholder,
        "Start typing file or symbol name..."
      );
    });

    it("3: should set placeholder to help text if shouldUseItemsFilterPhrase is true", () => {
      setups.setPlaceholder3();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPick.getControl().placeholder,
        "Type ? for help or start typing file or symbol name..."
      );
    });

    it(`4: should change quick pick placeholder to help text with not set help phrase
      if shouldUseItemsFilterPhrase is true`, () => {
      setups.setPlaceholder4();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPick.getControl().placeholder,
        "Help phrase not set. Start typing file or symbol name..."
      );
    });
  });

  describe("setOnDidChangeValueEventListeners", () => {
    it("1: should set new array of onDidChangeValueEventListeners", () => {
      quickPick.setOnDidChangeValueEventListeners(
        getQuickPickOnDidChangeValueEventListeners(2)
      );
      assert.equal(quickPick.getOnDidChangeValueEventListeners().length, 2);
    });
  });

  describe("handleDidChangeValueClearing", () => {
    it("1: should clear quick pick items", () => {
      setups.handleDidChangeValueClearing1();
      quickPick.handleDidChangeValueClearing();

      assert.equal(quickPick.getControl().items.length, 0);
    });
  });

  describe("handleDidChangeValue", () => {
    it("1: should load workspace items", async () => {
      const [loadItemsStub] = setups.handleDidChangeValue1();
      await quickPick.handleDidChangeValue("test text");

      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("2: should load help items", async () => {
      const [loadItemsStub] = setups.handleDidChangeValue2();
      await quickPick.handleDidChangeValue("?");

      assert.equal(loadItemsStub.calledOnce, true);
    });
  });

  describe("handleDidAccept", () => {
    it("1: should open selected qpItem with uri scheme equals to 'file'", async () => {
      const [revealRangeStub] = setups.handleDidAccept1();
      await quickPick.handleDidAccept();
      assert.equal(revealRangeStub.calledOnce, true);
    });

    it("2: should open selected qpItem with uri scheme equals to 'untitled'", async () => {
      const [revealRangeStub] = setups.handleDidAccept2();
      await quickPick.handleDidAccept();

      assert.equal(revealRangeStub.calledOnce, true);
    });

    it("3: should open selected qpItem which is help item", async () => {
      const [loadItemsStub] = setups.handleDidAccept3();
      await quickPick.handleDidAccept();

      assert.equal(loadItemsStub.calledOnce, true);
    });
  });

  describe("handleDidHide", () => {
    it("1: should setText method be invoked with empty string as argument", () => {
      setups.handleDidHide1();
      quickPick.handleDidHide();

      assert.equal(quickPick.getControl().value, "");
    });
  });

  describe("handleDidTriggerItemButton", () => {
    it("1: should openItem method be invoked", async () => {
      const [openItemStub] = setups.handleDidTriggerItemButton1();
      await quickPick.handleDidTriggerItemButton(getQuickPickItemButtonEvent());

      assert.equal(openItemStub.calledOnce, true);
    });
  });
});
