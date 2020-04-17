import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Workspace from "../../workspace";
import * as mock from "../mock/workspace.mock";
import {
  getCacheStub,
  getUtilsStub,
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
  getWorkspaceData,
} from "../util/mockFactory";
import Cache from "../../cache";
import Utils from "../../utils";

describe("Workspace", () => {
  let workspace: Workspace;
  let workspaceAny: any;
  let cacheStub: Cache;
  let utilsStub: Utils;

  before(() => {
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    workspace = new Workspace(cacheStub, utilsStub);
  });

  beforeEach(() => {
    workspaceAny = workspace as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should workspace be initialized", () => {
      workspace = new Workspace(cacheStub, utilsStub);

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
      sinon.stub(workspaceAny, "downloadData").returns(mock.qpItems);
      await workspace.indexWorkspace();

      assert.equal(updateDataStub.calledWith(mock.qpItems), true);
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
      await workspace.registerEventListeners();

      assert.equal(onDidChangeConfigurationStub.calledOnce, true);
      assert.equal(onDidChangeWorkspaceFoldersStub.calledOnce, true);
    });
  });

  describe("getData", () => {
    it("should cache.getData method be invoked", () => {
      const getDataStub = sinon
        .stub(workspaceAny.cache, "getData")
        .returns(Promise.resolve(mock.items));

      workspace.getData();

      assert.equal(getDataStub.calledOnce, true);
    });
  });

  describe("downloadData", () => {
    it("should return data for quick pick", async () => {
      sinon
        .stub(workspaceAny.dataService, "fetchData")
        .returns(Promise.resolve(getWorkspaceData(mock.items)));

      assert.deepEqual(await workspaceAny.downloadData(), mock.qpItems);
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
});
