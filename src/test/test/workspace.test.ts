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
  getFileWatcherStub,
  getFileRenameEvent,
} from "../util/mockFactory";
import Cache from "../../cache";
import Utils from "../../utils";
import ActionType from "../../enum/actionType";

describe("Workspace", () => {
  let workspace: Workspace;
  let workspaceAny: any;
  let cacheStub: Cache;
  let utilsStub: Utils;
  let onDidChangeRemoveCreateCallbackStub: sinon.SinonStub;

  before(() => {
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    onDidChangeRemoveCreateCallbackStub = sinon.stub();
    workspace = new Workspace(
      cacheStub,
      utilsStub,
      onDidChangeRemoveCreateCallbackStub
    );
  });

  beforeEach(() => {
    workspaceAny = workspace as any;
  });

  afterEach(() => {
    sinon.restore();
    onDidChangeRemoveCreateCallbackStub.resetHistory();
  });

  describe("constructor", () => {
    it("should workspace be initialized", () => {
      workspace = new Workspace(
        cacheStub,
        utilsStub,
        onDidChangeRemoveCreateCallbackStub
      );

      assert.exists(workspace);
    });
  });

  describe("index", () => {
    it(`should registerAction method be invoked
      which register rebuild action with indexWorkspace method`, async () => {
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspace.index();

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Rebuild);
    });
  });

  describe("indexWorkspace", () => {
    it("should reset cache to initial empty state", async () => {
      const clearStub = sinon.stub(workspaceAny.cache, "clear");
      await workspaceAny.indexWorkspace();

      assert.equal(clearStub.calledOnce, true);
    });

    it("should index all workspace files", async () => {
      const downloadDataStub = sinon.stub(workspaceAny, "downloadData");
      await workspaceAny.indexWorkspace();

      assert.equal(downloadDataStub.calledOnce, true);
    });

    it("should update cache with indexed workspace files", async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "downloadData").returns(getQpItems());
      await workspaceAny.indexWorkspace();

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
      const fileWatcherStub = getFileWatcherStub();
      const createFileSystemWatcherStub = sinon
        .stub(vscode.workspace, "createFileSystemWatcher")
        .returns(fileWatcherStub);

      await workspace.registerEventListeners();

      assert.equal(onDidChangeConfigurationStub.calledOnce, true);
      assert.equal(onDidChangeWorkspaceFoldersStub.calledOnce, true);
      assert.equal(onDidChangeTextDocumentStub.calledOnce, true);
      assert.equal(createFileSystemWatcherStub.calledOnce, true);
      assert.equal(fileWatcherStub.onDidChange.calledOnce, true);
      assert.equal(fileWatcherStub.onDidCreate.calledOnce, true);
      assert.equal(fileWatcherStub.onDidDelete.calledOnce, true);
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

    it(`should registerAction method be invoked which
      register rebuild action with indexWorkspace method if error is thrown`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      sinon.stub(workspaceAny, "removeFromCacheByPath").throws("test error");
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");

      await workspaceAny.updateCacheByPath(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Rebuild);
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

  describe("cleanDirectoryRenamingData", () => {
    it("should variables values related to directory renaming be set to undefined", () => {
      sinon
        .stub(workspaceAny, "directoryUriBeforePathUpdate")
        .value(getDirectory("#"));
      sinon.stub(workspaceAny, "urisForDirectoryPathUpdate").value(getItems());

      workspaceAny.cleanDirectoryRenamingData();

      assert.equal(workspaceAny.directoryUriBeforePathUpdate, undefined);
      assert.equal(workspaceAny.urisForDirectoryPathUpdate, undefined);
    });
  });

  describe("onDidChangeConfiguration", () => {
    it(`should registerAction method be invoked which register
      rebuild action with indexWorkspace method if extension configuration has changed`, async () => {
      sinon.stub(workspaceAny.utils, "hasConfigurationChanged").returns(true);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Rebuild);
    });

    it("should do nothing if extension configuration has not changed", async () => {
      sinon.stub(workspaceAny.utils, "hasConfigurationChanged").returns(false);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidChangeWorkspaceFolders", () => {
    it(`should registerAction method be invoked which register
      rebuild action with indexWorkspace method if amount of opened folders in workspace has changed`, async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceChanged").returns(true);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(true)
      );

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Rebuild);
    });

    it("should do nothing if extension configuration has not changed", async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceChanged").returns(false);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidChangeTextDocument", () => {
    it(`should registerAction method be invoked which register
      remove action with removeFromCacheByUri method if text document
      has changed and exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`should onDidChangeRemoveCreateCallback method be invoked
      if text document has changed and exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      sinon.stub(workspaceAny, "updateCacheByPath");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(onDidChangeRemoveCreateCallbackStub.calledOnce, true);
    });

    it(`should do nothing if text document does not exist in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });

    it(`should do nothing if text document has not changed`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent();
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidRenameFiles", () => {
    it(`should registerAction method be invoked which register
      remove action with removeFromCacheByUri method if workspace
      contains more than one folder`, async () => {
      sinon
        .stub(workspaceAny.utils, "hasWorkspaceMoreThanOneFolder")
        .returns(true);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });

    it("should do nothing if workspace contains either one folder or any", async () => {
      sinon
        .stub(workspaceAny.utils, "hasWorkspaceMoreThanOneFolder")
        .returns(false);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidFileSave", () => {
    it(`should registerAction method be invoked which register
      update action with updateCacheByUri method if file or directory has
      been renamed and exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`should do nothing if file or directory has been
      renamed but does not exist in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidFileFolderCreate", () => {
    it(`should registerAction method be invoked which register
      update action with updateCacheByUri method`, async () => {
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileFolderCreate(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });
  });

  describe("onDidFileFolderDelete", () => {
    it(`should registerAction method be invoked which register
      remove action with removeFromCacheByUri method`, async () => {
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileFolderDelete(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });
  });
});
