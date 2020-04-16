import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Cache from "../../cache";
import QuickPick from "../../interface/quickPickItem";
import { appConfig } from "../../appConfig";
import * as mock from "../mock/cache.mock";
import { getExtensionContext } from "../util/mockFactory";

describe("Cache", () => {
  let cache: Cache;
  let updateStub: sinon.SinonStub;
  let context: vscode.ExtensionContext;

  before(() => {
    sinon.stub(appConfig, "dataCacheKey").value("cache");
    sinon.stub(appConfig, "configCacheKey").value("config");
    context = getExtensionContext();
    updateStub = sinon.stub();
    context.workspaceState.update = updateStub;

    cache = new Cache(context);
  });

  afterEach(() => {
    sinon.restore();
    updateStub.resetHistory();
  });

  describe("getData", () => {
    it("should return array of indexed symbols and files from cache", () => {
      sinon.stub(context.workspaceState, "get").returns(mock.qpItems);

      assert.deepEqual(cache.getData(), mock.qpItems);
    });

    it("should return empty array if cache is undefined", () => {
      sinon.stub(context.workspaceState, "get").returns(undefined);

      assert.deepEqual(cache.getData(), []);
    });
  });

  describe("updateData", () => {
    it("should update cache with new array", () => {
      cache.updateData(mock.qpItems);

      assert.equal(
        updateStub.calledWith(appConfig.dataCacheKey, mock.qpItems),
        true
      );
    });
  });

  describe("getConfigByKey", () => {
    it("should return config value from cache", () => {
      const key = "searchEverywhere.exclude";
      sinon
        .stub(context.workspaceState, "get")
        .returns({ [key]: mock.configuration[key] });

      assert.deepEqual(
        cache.getConfigByKey<string[]>(key),
        mock.configuration[key]
      );
    });

    it("should return undefined if cache does not contain value for given key", () => {
      const key = "searchEverywhere.exclude";
      sinon.stub(context.workspaceState, "get").returns(undefined);

      assert.equal(cache.getConfigByKey<string[]>(key), undefined);
    });
  });

  describe("updateConfigByKey", () => {
    it("should update config value in cache if cache object exists", () => {
      const key = "searchEverywhere.exclude";
      const newExcludePatterns = ["**/node_modules/**", ".gitignore"];
      sinon.stub(context.workspaceState, "get").returns(mock.configuration);
      const newConfig = {
        ...mock.configuration,
        ...{ [key]: newExcludePatterns },
      };
      cache.updateConfigByKey(key, newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, newConfig),
        true
      );
    });
  });

  describe("updateConfigByKey", () => {
    it("should update config value in cache if cache object exists", () => {
      const key = "searchEverywhere.exclude";
      sinon.stub(context.workspaceState, "get").returns(mock.configuration);
      cache.updateConfigByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, mock.newConfiguration),
        true
      );
    });

    it("should create cache object if it does not exist and set config value", () => {
      const key = "searchEverywhere.exclude";
      sinon.stub(context.workspaceState, "get").returns(undefined);
      cache.updateConfigByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, mock.newConfiguration),
        true
      );
    });
  });

  describe("clear", () => {
    it("should remove all values from cache", () => {
      cache.clear();

      assert.equal(updateStub.calledTwice, true);
    });
  });
});
