import * as vscode from "vscode";
import * as sinon from "sinon";
import { assert } from "chai";
import { getUntitledItem } from "../util/itemMockFactory";
import {
  getQpItems,
  getQpHelpItems,
  getQpItem,
  getUntitledQpItem,
  getQpHelpItem,
} from "../util/qpItemMockFactory";
import { getConfigStub } from "../util/stubFactory";
import QuickPick from "../../quickPick";
import Config from "../../config";
import { getTestSetups } from "../testSetup/quickPick.testSetup";

describe("QuickPick", () => {
  let configStub: Config = getConfigStub();
  let quickPick: QuickPick = new QuickPick(configStub);
  let quickPickAny: any;
  let setups = getTestSetups(quickPick);

  beforeEach(() => {
    configStub = getConfigStub();
    quickPick = new QuickPick(configStub);
    quickPickAny = quickPick as any;
    quickPick.init();
    setups = getTestSetups(quickPick);
  });

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

      assert.equal(quickPickAny.onDidChangeValueEventListeners.length, 2);
    });

    it(`3: should register two event listeners
      if shouldUseDebounce returns false`, () => {
      setups.init3();
      quickPick.init();

      assert.equal(quickPickAny.onDidChangeValueEventListeners.length, 1);
    });
  });

  describe("reloadOnDidChangeValueEventListener", () => {
    it(`1: should dispose existing event listeners and
      register one event listener if shouldUseDebounce returns false`, () => {
      setups.reloadOnDidChangeValueEventListener1();
      quickPick.reloadOnDidChangeValueEventListener();

      assert.equal(quickPickAny.onDidChangeValueEventListeners.length, 1);
    });

    it(`2: should dispose existing event listeners and
      register two event listeners if shouldUseDebounce returns true`, () => {
      setups.reloadOnDidChangeValueEventListener2();
      quickPick.reloadOnDidChangeValueEventListener();

      assert.equal(quickPickAny.onDidChangeValueEventListeners.length, 2);
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

      assert.deepEqual(quickPickAny.helpItems, qpHelpItems);
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
    it("1: should items be loaded", () => {
      const items = setups.loadItems1();
      quickPick.loadItems();

      assert.deepEqual(quickPickAny.quickPick.items, items);
    });

    it("2: should help items be loaded", () => {
      const helpItems = setups.loadItems2();
      quickPick.loadItems(true);

      assert.deepEqual(quickPickAny.quickPick.items, helpItems);
    });
  });

  describe("setItems", () => {
    it("1: should items be set", () => {
      quickPick.setItems(getQpItems());

      assert.equal(quickPickAny.items.length, 2);
    });
  });

  describe("showLoading", () => {
    it("1: should vscode.quickPick.busy property be set", () => {
      quickPick.showLoading(true);

      assert.equal(quickPickAny.quickPick.busy, true);
    });
  });

  describe("setText", () => {
    it("1: should text be set", () => {
      const text = "test text";
      quickPick.setText(text);

      assert.equal(quickPickAny.quickPick.value, text);
    });
  });

  describe("setPlaceholder", () => {
    it("1: should set placeholder to loading text", () => {
      quickPick.setPlaceholder(true);
      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Please wait, loading..."
      );
    });

    it("2: should set placeholder to searching text if shouldUseItemsFilterPhrase is false", () => {
      setups.setPlaceholder2();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Start typing file or symbol name..."
      );
    });

    it("3: should set placeholder to help text if shouldUseItemsFilterPhrase is true", () => {
      setups.setPlaceholder3();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Type ? for help or start typing file or symbol name..."
      );
    });

    it(`4: should change quick pick placeholder to help text with not set help phrase
      if shouldUseItemsFilterPhrase is true`, () => {
      setups.setPlaceholder4();
      quickPick.setPlaceholder(false);

      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Help phrase not set. Start typing file or symbol name..."
      );
    });
  });

  describe("onDidChangeValueClearing", () => {
    it("1: should clear quick pick items", () => {
      setups.onDidChangeValueClearing1();
      quickPickAny.onDidChangeValueClearing();

      assert.equal(quickPickAny.quickPick.items.length, 0);
    });
  });

  describe("onDidChangeValue", () => {
    it("1: should load workspace items", async () => {
      const [loadItemsStub] = setups.onDidChangeValue1();
      await quickPickAny.onDidChangeValue("test text");

      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("2: should load help items", async () => {
      const [loadItemsStub] = setups.onDidChangeValue2();
      await quickPickAny.onDidChangeValue("?");

      assert.equal(loadItemsStub.calledOnce, true);
    });
  });

  describe("onDidAccept", () => {
    it("1: should open selected qpItem with uri scheme equals to 'file'", async () => {
      const [revealRangeStub] = await setups.onDidAccept1();
      quickPickAny.quickPick.selectedItems[0] = getQpItem();
      await quickPickAny.onDidAccept();

      assert.equal(revealRangeStub.calledOnce, true);

      revealRangeStub.restore();
    });

    it("2: should open selected qpItem with uri scheme equals to 'untitled'", async () => {
      const [revealRangeStub] = await setups.onDidAccept2();
      quickPickAny.quickPick.selectedItems[0] = getUntitledQpItem();
      await quickPickAny.onDidAccept();

      assert.equal(revealRangeStub.calledOnce, true);

      revealRangeStub.restore();
    });

    it("3: should open selected qpItem which is help item", async () => {
      const [loadItemsStub] = setups.onDidAccept3();
      quickPickAny.quickPick.selectedItems[0] = getQpHelpItem("?", "0", "$$");
      await quickPickAny.onDidAccept();

      assert.equal(loadItemsStub.calledOnce, true);
    });
  });

  describe("onDidHide", () => {
    it("1: should setText method be invoked with empty string as argument", () => {
      quickPickAny.onDidHide();

      assert.equal(quickPickAny.quickPick.value, "");
    });
  });
});
