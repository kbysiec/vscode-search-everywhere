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

  describe("getDataFromCache", () => {
    it("should return array of indexed symbols and files from cache", () => {
      sinon.stub(context.workspaceState, "get").returns(mock.qpItems);

      assert.deepEqual(cache.getDataFromCache(), mock.qpItems);
    });

    it("should return empty array if cache is undefined", () => {
      sinon.stub(context.workspaceState, "get").returns(undefined);

      assert.deepEqual(cache.getDataFromCache(), []);
    });
  });

  describe("updateDataCache", () => {
    it("should update cache with new array", () => {
      cache.updateDataCache(mock.qpItems);

      assert.equal(
        updateStub.calledWith(appConfig.dataCacheKey, mock.qpItems),
        true
      );
    });
  });

  describe("getConfigFromCacheByKey", () => {
    it("should return config value from cache", () => {
      const key = "searchEverywhere.exclude";
      sinon
        .stub(context.workspaceState, "get")
        .returns({ [key]: mock.configuration[key] });

      assert.deepEqual(
        cache.getConfigFromCacheByKey<string[]>(key),
        mock.configuration[key]
      );
    });

    it("should return undefined if cache does not contain value for passed key", () => {
      const key = "searchEverywhere.exclude";
      sinon.stub(context.workspaceState, "get").returns(undefined);

      assert.equal(cache.getConfigFromCacheByKey<string[]>(key), undefined);
    });
  });

  describe("updateConfigCacheByKey", () => {
    it("should update config value in cache if cache object exists", () => {
      const key = "searchEverywhere.exclude";
      const newExcludePatterns = ["**/node_modules/**", ".gitignore"];
      sinon.stub(context.workspaceState, "get").returns(mock.configuration);
      const newConfig = {
        ...mock.configuration,
        ...{ [key]: newExcludePatterns },
      };
      cache.updateConfigCacheByKey(key, newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, newConfig),
        true
      );
    });
  });

  describe("updateConfigCacheByKey", () => {
    it("should update config value in cache if cache object exists", () => {
      const key = "searchEverywhere.exclude";
      sinon.stub(context.workspaceState, "get").returns(mock.configuration);
      cache.updateConfigCacheByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, mock.newConfiguration),
        true
      );
    });

    it("should create cache object if it does not exist and set config value", () => {
      const key = "searchEverywhere.exclude";
      sinon.stub(context.workspaceState, "get").returns(undefined);
      cache.updateConfigCacheByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, mock.newConfiguration),
        true
      );
    });
  });

  describe("clearCache", () => {
    it("should remove all values from cache", () => {
      cache.clearCache();

      assert.equal(updateStub.calledTwice, true);
    });
  });
});
