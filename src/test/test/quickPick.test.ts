import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import QuickPick from "../../quickPick";
import QuickPickItem from "../../interface/quickPickItem";
import * as mock from "../mock/quickPick.mock";

describe("QuickPick", () => {
  let quickPick: QuickPick;
  let quickPickAny: any;

  before(() => {
    quickPick = new QuickPick();
  });

  beforeEach(() => {
    quickPickAny = quickPick as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should quick pick be initialized", () => {
      quickPick = new QuickPick();

      assert.exists(quickPick);
    });
  });

  describe("show", () => {
    it("should vscode.quickPick.show method be invoked", () => {
      const showStub = sinon.stub(quickPickAny.quickPick, "show");
      quickPick.show();

      assert.equal(showStub.calledOnce, true);
    });
  });

  describe("loadItems", () => {
    it("should items be loaded", () => {
      quickPick.loadItems(mock.qpItems);

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

  describe("submit", () => {
    it("should openSelected method be invoked with selected item as argument", () => {
      const openSelectedStub = sinon.stub(quickPickAny, "openSelected");
      quickPickAny.submit(mock.qpItem);

      assert.equal(openSelectedStub.calledWith(mock.qpItem), true);
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
      await quickPickAny.openSelected(mock.qpItem);

      assert.equal(openTextDocumentStub.calledOnce, true);
      assert.equal(showTextDocumentStub.calledOnce, true);
      assert.equal(selectQpItemStub.calledOnce, true);
    });

    it("should open selected qpItem with uri scheme equals to 'untitled'", async () => {
      await quickPickAny.openSelected(mock.qpItemUntitled);

      assert.equal(openTextDocumentStub.calledOnce, true);
      assert.equal(showTextDocumentStub.calledOnce, true);
      assert.equal(selectQpItemStub.calledOnce, true);
    });
  });

  describe("selectQpItem", () => {
    it("should editor.revealRange method be called", async () => {
      const document = await vscode.workspace.openTextDocument(
        mock.itemUntitledUri
      );
      const editor = await vscode.window.showTextDocument(document);
      const editorRevealRangeStub = sinon.stub(editor, "revealRange");
      await quickPickAny.selectQpItem(editor, mock.qpItem);

      assert.equal(editorRevealRangeStub.calledOnce, true);

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
      quickPickAny.quickPick.selectedItems[0] = mock.qpItem;
      quickPickAny.onDidAccept();

      assert.equal(submitStub.calledWith(mock.qpItem), true);
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
