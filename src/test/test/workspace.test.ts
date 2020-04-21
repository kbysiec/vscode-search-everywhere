import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Workspace from "../../workspace";
import {
  getCacheStub,
  getUtilsStub,
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
  getWorkspaceData,
  getItems,
  getQpItems,
  getQpItem,
  getItem,
  getDirectory,
  getQpItemsSymbolAndUri,
  getQpItemsSymbolAndUriExt,
  getTextDocumentChangeEvent,
} from "../util/mockFactory";
import Cache from "../../cache";
import Utils from "../../utils";

describe("Workspace", () => {
  let workspace: Workspace;
  let workspaceAny: any;
  let cacheStub: Cache;
  let utilsStub: Utils;
  let onDidChangeTextDocumentCallbackStub: sinon.SinonStub;

  before(() => {
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    onDidChangeTextDocumentCallbackStub = sinon.stub();
    workspace = new Workspace(
      cacheStub,
      utilsStub,
      onDidChangeTextDocumentCallbackStub
    );
  });

  beforeEach(() => {
    workspaceAny = workspace as any;
  });

  afterEach(() => {
    sinon.restore();
    onDidChangeTextDocumentCallbackStub.resetHistory();
  });

  describe("constructor", () => {
    it("should workspace be initialized", () => {
      workspace = new Workspace(
        cacheStub,
        utilsStub,
        onDidChangeTextDocumentCallbackStub
      );

      assert.exists(workspace);
    });
  });

  describe("indexWorkspace", () => {
    it("should reset cache to initial empty state", async () => {
      const clearStub = sinon.stub(workspaceAny.cache, "clear");
      await workspace.indexWorkspace();

      assert.equal(clearStub.calledOnce, true);
    });

    it("should index all workspace files", async () => {
      const downloadDataStub = sinon.stub(workspaceAny, "downloadData");
      await workspace.indexWorkspace();

      assert.equal(downloadDataStub.calledOnce, true);
    });

    it("should update cache with indexed workspace files", async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "downloadData").returns(getQpItems());
      await workspace.indexWorkspace();

      assert.equal(updateDataStub.calledWith(getQpItems()), true);
    });
  });

  describe("registerEventListeners", () => {
    it("should register workspace event listeners", async () => {
      const onDidChangeConfigurationStub = sinon.stub(
        vscode.workspace,
        "onDidChangeConfiguration"
      );
      const onDidChangeWorkspaceFoldersStub = sinon.stub(
        vscode.workspace,
        "onDidChangeWorkspaceFolders"
      );
      const onDidChangeTextDocumentStub = sinon.stub(
        vscode.workspace,
        "onDidChangeTextDocument"
      );
      await workspace.registerEventListeners();

      assert.equal(onDidChangeConfigurationStub.calledOnce, true);
      assert.equal(onDidChangeWorkspaceFoldersStub.calledOnce, true);
      assert.equal(onDidChangeTextDocumentStub.calledOnce, true);
    });
  });

  describe("getData", () => {
    it("should cache.getData method be invoked", () => {
      const getDataStub = sinon
        .stub(workspaceAny.cache, "getData")
        .returns(Promise.resolve(getItems()));

      workspace.getData();

      assert.equal(getDataStub.calledOnce, true);
    });
  });

  describe("downloadData", () => {
    it("should return data for quick pick", async () => {
      const items = getItems();
      sinon
        .stub(workspaceAny.dataService, "fetchData")
        .returns(Promise.resolve(getWorkspaceData(items)));

      assert.deepEqual(await workspaceAny.downloadData(), getQpItems());
    });
  });

  describe("updateCacheByPath", () => {
    it(`should remove old data for given uri and get
      new data if exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      sinon
        .stub(workspaceAny, "downloadData")
        .returns(Promise.resolve(getQpItemsSymbolAndUri()));
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      const getDataStub = sinon.stub(workspaceAny, "getData");
      getDataStub.onFirstCall().returns(getQpItems());
      getDataStub.onSecondCall().returns(getQpItems(1));

      await workspaceAny.updateCacheByPath(getItem());

      assert.equal(updateDataStub.calledTwice, true);
      assert.deepEqual(updateDataStub.args[1][0], getQpItemsSymbolAndUriExt());
    });

    it(`should find items with old uris, replace the path
      with new uri after directory renaming`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));

      workspaceAny.urisForDirectoryPathUpdate = getItems(1);
      workspaceAny.directoryUriBeforePathUpdate = getDirectory("./fake/");

      const downloadDataStub = sinon
        .stub(workspaceAny, "downloadData")
        .returns(Promise.resolve(getQpItemsSymbolAndUri("./test/fake-files/")));
      sinon.stub(workspaceAny, "getData").returns(getQpItems(1));
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");

      await workspaceAny.updateCacheByPath(getDirectory("./test/fake-files/"));

      assert.equal(
        downloadDataStub.calledWith(getItems(1, "./test/fake-files/")),
        true
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.equal(
        updateDataStub.calledWith(
          getQpItemsSymbolAndUriExt("./test/fake-files/")
        ),
        true
      );
    });

    it(`should do nothing if for given directory uri
      there is not any item for replace the path`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");

      await workspaceAny.updateCacheByPath(getDirectory("./test/fake-files/"));

      assert.equal(updateDataStub.called, false);
    });

    it("should indexWorkspace method be invoked if error is thrown", async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      sinon.stub(workspaceAny, "removeFromCacheByPath").throws("test error");
      const indexWorkspaceStub = sinon.stub(workspaceAny, "indexWorkspace");

      await workspaceAny.updateCacheByPath(getItem());

      assert.equal(indexWorkspaceStub.calledOnce, true);
    });
  });

  describe("removeFromCacheByPath", () => {
    it("should do nothing if getData method returns undefined", async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "getData").returns(undefined);

      await workspaceAny.removeFromCacheByPath(getItem());

      assert.equal(updateDataStub.called, false);
    });

    it("should remove given item from stored data", async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "getData").returns(getQpItems());
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));

      await workspaceAny.removeFromCacheByPath(getItem());

      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it(`should remove items from stored data for
      given renamed directory uri`, async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "getData").returns(getQpItems());
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));

      await workspaceAny.removeFromCacheByPath(getDirectory("./fake/"));

      assert.equal(updateDataStub.calledWith([]), true);
    });
  });

  describe("getUrisForDirectoryPathUpdate", () => {
    it(`should return uris containing renamed directory
      name and file symbol kind`, async () => {
      const qpItems = getQpItems();
      qpItems[1] = getQpItem("./test/fake-files/", 2);
      assert.deepEqual(
        await workspaceAny.getUrisForDirectoryPathUpdate(
          qpItems,
          getDirectory("./fake/")
        ),
        getItems(1, undefined, undefined, true)
      );
    });
  });

  describe("mergeWithDataFromCache", () => {
    it("should return QuickPickItem[] containing merged cached and given data", () => {
      sinon.stub(workspaceAny, "getData").returns(getQpItems());
      assert.deepEqual(
        workspaceAny.mergeWithDataFromCache(getQpItems(1, undefined, 2)),
        getQpItems(3)
      );
    });

    it("should return QuickPickItem[] containing given data if cache is empty", () => {
      sinon.stub(workspaceAny, "getData").returns(undefined);
      assert.deepEqual(
        workspaceAny.mergeWithDataFromCache(getQpItems(1)),
        getQpItems(1)
      );
    });
  });

  describe("updateUrisWithNewDirectoryName", () => {
    it("should return vscode.Uri[] with updated directory path", () => {
      assert.deepEqual(
        workspaceAny.updateUrisWithNewDirectoryName(
          getItems(),
          getDirectory("./fake/"),
          getDirectory("./test/fake-files/")
        ),
        getItems(2, "./test/fake-files/")
      );
    });

    it(`should return unchanged vscode.Uri[]
      if old directory path does not exist in workspace`, () => {
      assert.deepEqual(
        workspaceAny.updateUrisWithNewDirectoryName(
          getItems(),
          getDirectory("./fake/not-exist/"),
          getDirectory("./test/fake-files/")
        ),
        getItems(2, "./fake/")
      );
    });
  });

  describe("onDidChangeConfiguration", () => {
    it("should reindex workspace if extension configuration has changed", async () => {
      sinon.stub(workspaceAny.utils, "hasConfigurationChanged").returns(true);
      const indexWorkspaceStub = sinon.stub(workspaceAny, "indexWorkspace");
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(indexWorkspaceStub.calledOnce, true);
    });

    it("should do nothing if extension configuration has not changed", async () => {
      sinon.stub(workspaceAny.utils, "hasConfigurationChanged").returns(false);
      const indexWorkspaceStub = sinon.stub(workspaceAny, "indexWorkspace");
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(false)
      );

      assert.equal(indexWorkspaceStub.calledOnce, false);
    });
  });

  describe("onDidChangeWorkspaceFolders", () => {
    it("should reindex workspace if amount of opened folders in workspace has changed", async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceChanged").returns(true);
      const indexWorkspaceStub = sinon.stub(workspaceAny, "indexWorkspace");
      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(true)
      );

      assert.equal(indexWorkspaceStub.calledOnce, true);
    });

    it("should do nothing if extension configuration has not changed", async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceChanged").returns(false);
      const indexWorkspaceStub = sinon.stub(workspaceAny, "indexWorkspace");
      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(false)
      );

      assert.equal(indexWorkspaceStub.calledOnce, false);
    });
  });

  describe("onDidChangeTextDocument", () => {
    it(`should updateCacheByPath method be invoked
      if text document has changed and exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const updateDataStub = sinon.stub(workspaceAny, "updateCacheByPath");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(updateDataStub.calledOnce, true);
    });

    it(`should onDidChangeTextDocumentCallback method be invoked
      if text document has changed and exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      sinon.stub(workspaceAny, "updateCacheByPath");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(onDidChangeTextDocumentCallbackStub.calledOnce, true);
    });

    it(`should do nothing if text document does not exist in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));
      const updateDataStub = sinon.stub(workspaceAny, "updateCacheByPath");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(updateDataStub.calledOnce, false);
    });

    it(`should do nothing if text document has not changed`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const updateDataStub = sinon.stub(workspaceAny, "updateCacheByPath");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent();
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(updateDataStub.calledOnce, false);
    });
  });
});
