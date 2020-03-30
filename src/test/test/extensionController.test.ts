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
    it("should quick pick be initialized", () => {
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

  describe("onQuickPickSubmit", () => {
    it("should vscode.window.showInformationMessage method be invoked", async () => {
      const showInformationMessageStub = sinon.stub(
        vscode.window,
        "showInformationMessage"
      );
      const qpItem = mock.qpItem;
      await extensionControllerAny.onQuickPickSubmit(qpItem);

      const expectedText = `Selected qpItem label: ${qpItem.label}`;
      assert.equal(showInformationMessageStub.calledWith(expectedText), true);
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
