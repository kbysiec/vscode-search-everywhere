import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Workspace from "../../workspace";
import * as mock from "../mock/workspace.mock";
import { getCacheStub, getUtilsStub } from "../util/mockFactory";
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

  describe("cacheWorkspaceFiles", () => {
    it("should reset cache to initial empty state", async () => {
      const clearStub = sinon.stub(workspaceAny.cache, "clear");
      await workspace.cacheWorkspaceFiles();

      assert.equal(clearStub.calledOnce, true);
    });

    it("should index all workspace files", async () => {
      const getQuickPickDataStub = sinon.stub(workspaceAny, "getQuickPickData");
      await workspace.cacheWorkspaceFiles();

      assert.equal(getQuickPickDataStub.calledOnce, true);
    });

    it("should update cache with indexed workspace files", async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "getQuickPickData").returns(mock.qpItems);
      await workspace.cacheWorkspaceFiles();

      assert.equal(updateDataStub.calledWith(mock.qpItems), true);
    });
  });

  describe("registerEventListeners", () => {
    it("should register workspace event listeners", async () => {
      const onDidChangeConfigurationStub = sinon.stub(
        vscode.workspace,
        "onDidChangeConfiguration"
      );
      await workspace.registerEventListeners();

      assert.equal(onDidChangeConfigurationStub.calledOnce, true);
    });
  });

  describe("getQuickPickDataFromCache", () => {
    it("should cache.getData method be invoked", () => {
      const getDataStub = sinon
        .stub(workspaceAny.cache, "getData")
        .returns(Promise.resolve(mock.items));

      workspace.getQuickPickDataFromCache();

      assert.equal(getDataStub.calledOnce, true);
    });
  });

  describe("getQuickPickData", () => {
    it("should return data for quick pick", async () => {
      sinon
        .stub(workspaceAny.dataService, "getData")
        .returns(Promise.resolve(mock.items));

      assert.deepEqual(await workspaceAny.getQuickPickData(), mock.qpItems);
    });
  });

  describe("onDidChangeConfiguration", () => {
    it("should reindex workspace if extension configuration has changed", async () => {
      sinon.stub(workspaceAny.utils, "hasConfigurationChanged").returns(true);
      const cacheWorkspaceFilesStub = sinon.stub(
        workspaceAny,
        "cacheWorkspaceFiles"
      );
      await workspaceAny.onDidChangeConfiguration(
        mock.configurationChangeEvent
      );

      assert.equal(cacheWorkspaceFilesStub.calledOnce, true);
    });

    it("should do nothing if extension configuration has not changed", async () => {
      sinon.stub(workspaceAny.utils, "hasConfigurationChanged").returns(false);
      const cacheWorkspaceFilesStub = sinon.stub(
        workspaceAny,
        "cacheWorkspaceFiles"
      );
      await workspaceAny.onDidChangeConfiguration(
        mock.configurationChangeEvent
      );

      assert.equal(cacheWorkspaceFilesStub.calledOnce, false);
    });
  });
});
