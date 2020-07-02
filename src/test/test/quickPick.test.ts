import * as vscode from "vscode";
import * as sinon from "sinon";
import { assert } from "chai";
import { getUntitledItem } from "../util/itemMockFactory";
import { getQuickPickOnDidChangeValueEventListeners } from "../util/eventMockFactory";
import {
  getQpItems,
  getQpHelpItems,
  getQpItem,
  getUntitledQpItem,
  getQpHelpItem,
} from "../util/qpItemMockFactory";
import { getConfigStub } from "../util/stubFactory";
import QuickPickItem from "../../interface/quickPickItem";
import QuickPick from "../../quickPick";
import Config from "../../config";

describe("QuickPick", () => {
  let quickPick: QuickPick;
  let quickPickAny: any;
  let configStub: Config;

  before(() => {
    configStub = getConfigStub();
    quickPick = new QuickPick(configStub);
  });

  beforeEach(() => {
    quickPickAny = quickPick as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("init", () => {
    it("should vscode quick pick be created", () => {
      const quickPickInner = vscode.window.createQuickPick<QuickPickItem>();
      const createQuickPickStub = sinon
        .stub(vscode.window, "createQuickPick")
        .returns(quickPickInner);

      quickPick.init();

      assert.equal(createQuickPickStub.calledOnce, true);
    });
  });

  describe("reloadOnDidChangeValueEventListener", () => {
    it(`should disposeOnDidChangeValueEventListeners
      and registerOnDidChangeValueEventListeners methods be invoked`, () => {
      const disposeOnDidChangeValueEventListenersStub = sinon.stub(
        quickPickAny,
        "disposeOnDidChangeValueEventListeners"
      );
      const registerOnDidChangeValueEventListenersStub = sinon.stub(
        quickPickAny,
        "registerOnDidChangeValueEventListeners"
      );
      quickPick.reloadOnDidChangeValueEventListener();

      assert.equal(disposeOnDidChangeValueEventListenersStub.calledOnce, true);
      assert.equal(registerOnDidChangeValueEventListenersStub.calledOnce, true);
    });
  });

  describe("reload", () => {
    it("should fetchConfig and fetchHelpData methods be invoked", () => {
      const fetchConfigStub = sinon.stub(quickPickAny, "fetchConfig");
      const fetchHelpDataStub = sinon.stub(quickPickAny, "fetchHelpData");

      quickPick.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
      assert.equal(fetchHelpDataStub.calledOnce, true);
    });
  });

  describe("isInitialized", () => {
    it("should return true if vscode quick pick is initialized", () => {
      const quickPickInner = vscode.window.createQuickPick<QuickPickItem>();
      sinon.stub(quickPickAny, "quickPick").value(quickPickInner);

      assert.equal(quickPick.isInitialized(), true);
    });

    it("should return false if vscode quick pick is initialized", () => {
      sinon.stub(quickPickAny, "quickPick").value(undefined);

      assert.equal(quickPick.isInitialized(), false);
    });
  });

  describe("show", () => {
    it(`should vscode.quickPick.show method be invoked
    if quick pick is initialized`, () => {
      sinon.stub(quickPick, "isInitialized").returns(true);
      const showStub = sinon.stub(quickPickAny.quickPick, "show");
      quickPick.show();

      assert.equal(showStub.calledOnce, true);
    });
  });

  describe("loadItems", () => {
    it("should items be loaded", () => {
      const items = getQpItems();
      sinon.stub(quickPickAny, "items").value(items);
      quickPick.loadItems();

      assert.deepEqual(quickPickAny.quickPick.items, items);
    });

    it("should help items be loaded", () => {
      const helpItems = getQpHelpItems();
      sinon.stub(quickPickAny, "helpItems").value(helpItems);
      quickPick.loadItems(true);

      assert.deepEqual(quickPickAny.quickPick.items, helpItems);
    });
  });

  describe("setItems", () => {
    it("should items be set", () => {
      quickPick.setItems(getQpItems());

      assert.equal(quickPickAny.quickPick.items.length, 2);
    });
  });

  describe("showLoading", () => {
    it("should vscode.quickPick.busy property be set", () => {
      quickPick.showLoading(true);

      assert.equal(quickPickAny.quickPick.busy, true);
    });
  });

  describe("setText", () => {
    it("should text be set", () => {
      const text = "test text";
      quickPick.setText(text);

      assert.equal(quickPickAny.quickPick.value, text);
    });
  });

  describe("setPlaceholder", () => {
    it("should set placeholder to loading text", () => {
      quickPick.setPlaceholder(true);
      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Please wait, loading..."
      );
    });

    it("should set placeholder to searching text if shouldUseItemsFilterPhrase is false", () => {
      sinon.stub(quickPickAny, "shouldUseItemsFilterPhrases").value(false);

      quickPick.setPlaceholder(false);

      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Start typing file or symbol name..."
      );
    });

    it("should set placeholder to help text if shouldUseItemsFilterPhrase is true", () => {
      sinon.stub(quickPickAny, "shouldUseItemsFilterPhrases").value(true);
      sinon.stub(quickPickAny, "helpPhrase").value("?");

      quickPick.setPlaceholder(false);

      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Type ? for help or start typing file or symbol name..."
      );
    });

    it(`should change quick pick placeholder to help text with not set help phrase
      if shouldUseItemsFilterPhrase is true`, () => {
      sinon.stub(quickPickAny, "shouldUseItemsFilterPhrases").value(true);
      sinon.stub(quickPickAny, "helpPhrase").value("");

      quickPick.setPlaceholder(false);

      assert.equal(
        quickPickAny.quickPick.placeholder,
        "Help phrase not set. Start typing file or symbol name..."
      );
    });
  });

  describe("disposeOnDidChangeValueEventListeners", () => {
    it(`should dispose all onDidChangeValue event listeners
      and reset the array for them`, () => {
      sinon
        .stub(quickPickAny, "onDidChangeValueEventListeners")
        .value(getQuickPickOnDidChangeValueEventListeners());
      quickPickAny.disposeOnDidChangeValueEventListeners();

      assert.equal(quickPickAny.onDidChangeValueEventListeners.length, 0);
    });
  });

  describe("registerOnDidChangeValueEventListeners", () => {
    it(`should register one event listener if shouldUseDebounce
      returns false`, () => {
      const onDidChangeValueEventListeners: vscode.Disposable[] = [];
      sinon
        .stub(quickPickAny, "onDidChangeValueEventListeners")
        .value(onDidChangeValueEventListeners);
      sinon.stub(quickPickAny.config, "shouldUseDebounce").returns(false);

      quickPickAny.registerOnDidChangeValueEventListeners();

      assert.equal(quickPickAny.onDidChangeValueEventListeners.length, 1);
    });

    it(`should register two event listeners if shouldUseDebounce
      returns true`, () => {
      const onDidChangeValueEventListeners: vscode.Disposable[] = [];
      sinon
        .stub(quickPickAny, "onDidChangeValueEventListeners")
        .value(onDidChangeValueEventListeners);
      sinon.stub(quickPickAny.config, "shouldUseDebounce").returns(true);

      quickPickAny.registerOnDidChangeValueEventListeners();

      assert.equal(quickPickAny.onDidChangeValueEventListeners.length, 2);
    });
  });

  describe("submit", () => {
    it("should openSelected method be invoked with selected item as argument", () => {
      const openSelectedStub = sinon.stub(quickPickAny, "openSelected");
      quickPickAny.submit(getQpItem());

      assert.equal(openSelectedStub.calledWith(getQpItem()), true);
    });

    it("should openSelected method not be invoked without selected item as argument", () => {
      const openSelectedStub = sinon.stub(quickPickAny, "openSelected");
      quickPickAny.submit(undefined);

      assert.equal(openSelectedStub.calledOnce, false);
    });
  });

  describe("openSelected", () => {
    let openTextDocumentStub: sinon.SinonStub;
    let showTextDocumentStub: sinon.SinonStub;
    let selectQpItemStub: sinon.SinonStub;

    beforeEach(() => {
      openTextDocumentStub = sinon.stub(vscode.workspace, "openTextDocument");
      showTextDocumentStub = sinon.stub(vscode.window, "showTextDocument");
      selectQpItemStub = sinon.stub(quickPickAny, "selectQpItem");
    });

    it("should open selected qpItem with uri scheme equals to 'file'", async () => {
      await quickPickAny.openSelected(getQpItem());

      assert.equal(openTextDocumentStub.calledOnce, true);
      assert.equal(showTextDocumentStub.calledOnce, true);
      assert.equal(selectQpItemStub.calledOnce, true);
    });

    it("should open selected qpItem with uri scheme equals to 'untitled'", async () => {
      await quickPickAny.openSelected(getUntitledQpItem());

      assert.equal(openTextDocumentStub.calledOnce, true);
      assert.equal(showTextDocumentStub.calledOnce, true);
      assert.equal(selectQpItemStub.calledOnce, true);
    });

    it(`should set text to selected items filter phrase
       if given item is help item`, async () => {
      sinon.stub(quickPickAny, "shouldUseItemsFilterPhrases").value(true);
      sinon.stub(quickPickAny, "itemsFilterPhrases").value({ "0": "$$" });
      const setTextStub = sinon.stub(quickPickAny, "setText");
      const loadItemsStub = sinon.stub(quickPickAny, "loadItems");

      await quickPickAny.openSelected(getQpHelpItem("?", "0", "$$"));

      assert.equal(setTextStub.calledWith("$$"), true);
      assert.equal(loadItemsStub.calledOnce, true);
    });
  });

  describe("selectQpItem", () => {
    it("should editor.revealRange method be called", async () => {
      const document = await vscode.workspace.openTextDocument(
        getUntitledItem()
      );
      const editor = await vscode.window.showTextDocument(document);
      const editorRevealRangeStub = sinon.stub(editor, "revealRange");
      await quickPickAny.selectQpItem(editor, getQpItem());

      assert.equal(editorRevealRangeStub.calledOnce, true);

      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    });

    it("should select symbol if config.shouldHighlightSymbol returns true", async () => {
      sinon.stub(quickPickAny.config, "shouldHighlightSymbol").returns(true);
      const document = await vscode.workspace.openTextDocument(
        getUntitledItem()
      );
      const editor = await vscode.window.showTextDocument(document);
      await quickPickAny.selectQpItem(
        editor,
        getQpItem(undefined, undefined, true)
      );

      assert.equal(editor.selection.start.line, 0);
      assert.equal(editor.selection.start.character, 0);
      assert.equal(editor.selection.end.line, 0);
      assert.equal(editor.selection.end.character, 5);

      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    });

    it("should select symbol if config.shouldHighlightSymbol returns false", async () => {
      sinon.stub(quickPickAny.config, "shouldHighlightSymbol").returns(false);
      const document = await vscode.workspace.openTextDocument(
        getUntitledItem()
      );
      const editor = await vscode.window.showTextDocument(document);
      await quickPickAny.selectQpItem(editor, getQpItem());

      assert.equal(editor.selection.start.line, 0);
      assert.equal(editor.selection.start.character, 0);
      assert.equal(editor.selection.end.line, 0);
      assert.equal(editor.selection.end.character, 0);

      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    });
  });

  describe("getHelpItems", () => {
    it("should return array of help items", () => {
      sinon.stub(quickPickAny, "helpPhrase").value("?");
      sinon
        .stub(quickPickAny, "itemsFilterPhrases")
        .value({ 0: "$$", 4: "@@" });

      assert.deepEqual(quickPickAny.getHelpItems(), getQpHelpItems());
    });
  });

  describe("getHelpItemForKind", () => {
    it("should return help item for given kind and itemFilterPhrase", () => {
      sinon.stub(quickPickAny, "helpPhrase").value("?");

      assert.deepEqual(
        quickPickAny.getHelpItemForKind("0", "$$"),
        getQpHelpItem("?", "0", "$$")
      );
    });
  });

  describe("fetchConfig", () => {
    it("should fetch config", () => {
      const shouldUseItemsFilterPhrasesStub = sinon.stub(
        quickPickAny.config,
        "shouldUseItemsFilterPhrases"
      );
      const getHelpPhrase = sinon.stub(quickPickAny.config, "getHelpPhrase");
      const getItemsFilterPhrasesStub = sinon.stub(
        quickPickAny.config,
        "getItemsFilterPhrases"
      );

      quickPickAny.fetchConfig();

      assert.equal(shouldUseItemsFilterPhrasesStub.calledOnce, true);
      assert.equal(getHelpPhrase.calledOnce, true);
      assert.equal(getItemsFilterPhrasesStub.calledOnce, true);
    });
  });

  describe("fetchHelpData", () => {
    it("should fetch help data", () => {
      const helpItemsFromConfig = getQpHelpItems();
      sinon.stub(quickPickAny, "helpItems").value([]);
      sinon.stub(quickPickAny, "getHelpItems").returns(helpItemsFromConfig);

      quickPickAny.fetchHelpData();

      assert.equal(quickPickAny.helpItems, helpItemsFromConfig);
    });
  });

  describe("onDidChangeValueClearing", () => {
    it("should clear quick pick items", () => {
      quickPickAny.quickPick.items = getQpItems();
      quickPickAny.onDidChangeValueClearing();

      assert.equal(quickPickAny.quickPick.items.length, 0);
    });
  });

  describe("onDidChangeValue", () => {
    it("should load workspace items", () => {
      const loadItemsStub = sinon.stub(quickPickAny, "loadItems");
      quickPickAny.onDidChangeValue("test text");

      assert.equal(loadItemsStub.calledOnce, true);
    });

    it("should load help items", () => {
      sinon.stub(quickPickAny, "shouldUseItemsFilterPhrases").value(true);
      sinon.stub(quickPickAny, "helpPhrase").value("?");
      const loadItemsStub = sinon.stub(quickPickAny, "loadItems");

      quickPickAny.onDidChangeValue("?");

      assert.equal(loadItemsStub.calledWith(true), true);
    });
  });

  describe("onDidAccept", () => {
    it("should submit method be invoked with selected item as argument", () => {
      const submitStub = sinon.stub(quickPickAny, "submit");
      quickPickAny.quickPick.selectedItems[0] = getQpItem();
      quickPickAny.onDidAccept();

      assert.equal(submitStub.calledWith(getQpItem()), true);
    });
  });

  describe("onDidHide", () => {
    it("should setText method be invoked with empty string as argument", () => {
      const setTextStub = sinon.stub(quickPickAny, "setText");
      quickPickAny.onDidHide();

      assert.equal(setTextStub.calledWith(""), true);
    });
  });
});
