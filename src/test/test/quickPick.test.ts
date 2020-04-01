import { assert } from "chai";
import * as sinon from "sinon";
import QuickPick from "../../quickPick";
import QuickPickItem from "../../interface/quickPickItem";
import * as mock from "../mock/quickPick.mock";

describe("QuickPick", () => {
  let quickPick: QuickPick;
  let quickPickAny: any;
  let onSubmitCallback: sinon.SinonStub;
  let onChangeValueCallback: sinon.SinonStub;

  before(() => {
    quickPick = new QuickPick(onSubmitCallback, onChangeValueCallback);
  });

  beforeEach(() => {
    onSubmitCallback = sinon.stub();
    onChangeValueCallback = sinon.stub();
    quickPickAny = quickPick as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should quick pick be initialized", () => {
      quickPick = new QuickPick(onSubmitCallback, onChangeValueCallback);

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
    it("should callback be invoked with selected item as argument", () => {
      const qpItem = mock.qpItem;
      quickPickAny.submit(qpItem, onSubmitCallback);

      assert.equal(onSubmitCallback.calledWith(qpItem), true);
    });

    it("should callback not be invoked without selected item as argument", () => {
      quickPickAny.submit(undefined, onSubmitCallback);

      assert.equal(onSubmitCallback.calledOnce, false);
    });
  });

  describe("onDidChangeValue", () => {
    it("should callback be invoked with text as argument", () => {
      const text = "test text";
      quickPickAny.onDidChangeValue(onChangeValueCallback, text);

      assert.equal(onChangeValueCallback.calledWith(text), true);
    });
  });

  describe("onDidAccept", () => {
    it("should submit method be invoked with selected item as argument", () => {
      const submitStub = sinon.stub(quickPickAny, "submit");
      const qpItem = mock.qpItem;
      quickPickAny.quickPick.selectedItems[0] = qpItem;
      quickPickAny.onDidAccept(onSubmitCallback);

      assert.equal(submitStub.calledWith(qpItem, onSubmitCallback), true);
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
