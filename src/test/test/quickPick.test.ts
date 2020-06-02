import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import QuickPick from "../../quickPick";
import {
  getQpItems,
  getQpItem,
  getUntitledQpItem,
  getUntitledItem,
  getConfigStub,
} from "../util/mockFactory";
import Config from "../../config";
import QuickPickItem from "../../interface/quickPickItem";

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

  describe("constructor", () => {
    it("should quick pick be initialized", () => {
      quickPick = new QuickPick(configStub);

      assert.exists(quickPick);
    });
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
      sinon.stub(quickPickAny, "items").value(getQpItems());
      quickPick.loadItems();

      assert.equal(quickPickAny.quickPick.items.length, 2);
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
    it("should placeholder text be set", () => {
      const text = "test text";
      quickPick.setPlaceholder(text);

      assert.equal(quickPickAny.quickPick.placeholder, text);
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

  describe("onDidChangeValue", () => {
    it("should invoke vscode.window.showInformationMessage be invoked with text as argument", () => {
      const showInformationMessageStub = sinon.stub(
        vscode.window,
        "showInformationMessage"
      );
      const text = "test text";
      quickPickAny.onDidChangeValue(text);

      const expectedText = `Current text: ${text}`;
      assert.equal(showInformationMessageStub.calledWith(expectedText), true);
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
