import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import ExtensionController from "../../extensionController";
import * as mock from "../mock/extensionController.mock";
import { getExtensionContext } from "../util/mockFactory";

describe("ExtensionController", () => {
  let context: vscode.ExtensionContext;
  let extensionController: ExtensionController;
  let extensionControllerAny: any;

  before(() => {
    context = getExtensionContext();
    extensionController = new ExtensionController(context);
  });

  beforeEach(() => {
    extensionControllerAny = extensionController as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should extension controller be initialized", () => {
      extensionController = new ExtensionController(context);

      assert.exists(extensionController);
    });
  });

  describe("search", () => {
    it("should quickPick.show method be invoked", async () => {
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      await extensionController.search();

      assert.equal(showStub.calledOnce, true);
    });
  });

  describe("loadQuickPickData", () => {
    it("should load data to quick pick", async () => {
      sinon
        .stub(extensionControllerAny, "getQuickPickData")
        .returns(Promise.resolve(mock.qpItems));
      await extensionControllerAny.loadQuickPickData();

      assert.equal(extensionControllerAny.quickPick.quickPick.items.length, 2);
    });
  });

  describe("getQuickPickData", () => {
    it("should return data for quick pick", async () => {
      sinon
        .stub(extensionControllerAny.dataService, "getData")
        .returns(Promise.resolve(mock.items));
      await extensionControllerAny.getQuickPickData();

      assert.deepEqual(
        extensionControllerAny.quickPick.quickPick.items,
        mock.qpItems
      );
    });
  });

  describe("openSelected", () => {
    let openTextDocumentStub: sinon.SinonStub;
    let showTextDocumentStub: sinon.SinonStub;
    let selectQpItemStub: sinon.SinonStub;

    beforeEach(() => {
      openTextDocumentStub = sinon.stub(vscode.workspace, "openTextDocument");
      showTextDocumentStub = sinon.stub(vscode.window, "showTextDocument");
      selectQpItemStub = sinon.stub(extensionControllerAny, "selectQpItem");
    });

    it("should open selected qpItem with uri scheme equals to 'file'", async () => {
      await extensionControllerAny.openSelected(mock.qpItem);

      assert.equal(openTextDocumentStub.calledOnce, true);
      assert.equal(showTextDocumentStub.calledOnce, true);
      assert.equal(selectQpItemStub.calledOnce, true);
    });

    it("should open selected qpItem with uri scheme equals to 'untitled'", async () => {
      await extensionControllerAny.openSelected(mock.qpItemUntitled);

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

      await extensionControllerAny.selectQpItem(editor, mock.qpItem);

      assert.equal(editorRevealRangeStub.calledOnce, true);

      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    });
  });

  describe("onQuickPickSubmit", () => {
    it("should openSelected method be invoked", async () => {
      const openSelectedStub = sinon.stub(
        extensionControllerAny,
        "openSelected"
      );
      const qpItem = mock.qpItem;
      await extensionControllerAny.onQuickPickSubmit(qpItem);

      assert.equal(openSelectedStub.calledWith(qpItem), true);
    });
  });

  describe("onQuickPickChangeValue", () => {
    it("should vscode.window.showInformationMessage method be invoked", async () => {
      const showInformationMessageStub = sinon.stub(
        vscode.window,
        "showInformationMessage"
      );
      const text = "test text";
      await extensionControllerAny.onQuickPickChangeValue(text);

      const expectedText = `Current text: ${text}`;
      assert.equal(showInformationMessageStub.calledWith(expectedText), true);
    });
  });
});
