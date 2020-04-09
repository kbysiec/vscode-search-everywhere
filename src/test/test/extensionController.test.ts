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
    it(`should quickPick.show method be invoked if workspace contains
      at least one folder opened`, async () => {
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(true);
      await extensionController.search();

      assert.equal(showStub.calledOnce, true);
    });

    it(`should display notification if workspace contains does not contain
      any folder opened`, async () => {
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      const printNoFolderOpenedMessageStub = sinon.stub(
        extensionControllerAny.utils,
        "printNoFolderOpenedMessage"
      );
      sinon
        .stub(extensionControllerAny.utils, "hasWorkspaceAnyFolder")
        .returns(false);
      await extensionController.search();

      assert.equal(showStub.calledOnce, false);
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });
  });

  describe("startup", () => {
    it("should cacheWorkspaceFiles method be invoked", async () => {
      const cacheWorkspaceFilesStub = sinon.stub(
        extensionControllerAny,
        "cacheWorkspaceFiles"
      );
      await extensionControllerAny.startup();

      assert.equal(cacheWorkspaceFilesStub.calledOnce, true);
    });
  });

  describe("loadQuickPickData", () => {
    it("should load data to quick pick from cache", async () => {
      sinon
        .stub(extensionControllerAny, "getQuickPickDataFromCache")
        .returns(Promise.resolve(mock.qpItems));
      await extensionControllerAny.loadQuickPickData();

      assert.equal(extensionControllerAny.quickPick.quickPick.items.length, 2);
    });

    it("should load empty array to quick pick if cache is empty", async () => {
      sinon
        .stub(extensionControllerAny, "getQuickPickDataFromCache")
        .returns(Promise.resolve());
      await extensionControllerAny.loadQuickPickData();

      assert.equal(extensionControllerAny.quickPick.quickPick.items.length, 0);
    });
  });

  describe("cacheWorkspaceFiles", () => {
    it("should reset cache to initial empty state", async () => {
      const clearStub = sinon.stub(extensionControllerAny.cache, "clear");
      await extensionControllerAny.cacheWorkspaceFiles();

      assert.equal(clearStub.calledOnce, true);
    });

    it("should index all workspace files", async () => {
      const getQuickPickDataStub = sinon.stub(
        extensionControllerAny,
        "getQuickPickData"
      );
      await extensionControllerAny.cacheWorkspaceFiles();

      assert.equal(getQuickPickDataStub.calledOnce, true);
    });

    it("should update cache with indexed workspace files", async () => {
      const updateDataStub = sinon.stub(
        extensionControllerAny.cache,
        "updateData"
      );
      sinon
        .stub(extensionControllerAny, "getQuickPickData")
        .returns(mock.qpItems);
      await extensionControllerAny.cacheWorkspaceFiles();

      assert.equal(updateDataStub.calledWith(mock.qpItems), true);
    });
  });

  describe("getQuickPickData", () => {
    it("should return data for quick pick", async () => {
      sinon
        .stub(extensionControllerAny.dataService, "getData")
        .returns(Promise.resolve(mock.items));

      assert.deepEqual(
        await extensionControllerAny.getQuickPickData(),
        mock.qpItems
      );
    });
  });

  describe("getQuickPickDataFromCache", () => {
    it("should cache.getData method be invoked", () => {
      const getDataStub = sinon
        .stub(extensionControllerAny.cache, "getData")
        .returns(Promise.resolve(mock.items));

      extensionControllerAny.getQuickPickDataFromCache();

      assert.equal(getDataStub.calledOnce, true);
    });
  });

  describe("initComponents", () => {
    it("should init components", async () => {
      extensionControllerAny.initComponents();

      assert.equal(typeof extensionControllerAny.cache, "object");
      assert.equal(typeof extensionControllerAny.dataService, "object");
      assert.equal(typeof extensionControllerAny.utils, "object");
      assert.equal(typeof extensionControllerAny.quickPick, "object");
    });
  });
});
