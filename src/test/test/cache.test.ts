import * as vscode from "vscode";
import * as sinon from "sinon";
import { assert } from "chai";
import { getExtensionContext } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import * as mock from "../mock/cache.mock";
import { appConfig } from "../../appConfig";
import Cache from "../../cache";

describe("Cache", () => {
  let cache: Cache;
  let cacheAny: any;
  let updateStub: sinon.SinonStub;
  let context: vscode.ExtensionContext;

  before(() => {
    sinon.stub(appConfig, "dataCacheKey").value("cache");
    sinon.stub(appConfig, "configCacheKey").value("config");
    context = getExtensionContext();
    updateStub = sinon.stub();
    context.workspaceState.update = updateStub;

    cache = new Cache(context);
    cacheAny = cache as any;
  });

  afterEach(() => {
    sinon.restore();
    updateStub.resetHistory();
  });

  describe("getData", () => {
    it("should return array of indexed symbols and files from cache", () => {
      sinon.stub(context.workspaceState, "get").returns(getQpItems());

      assert.deepEqual(cache.getData(), getQpItems());
    });

    it("should return empty array if cache is undefined", () => {
      sinon.stub(context.workspaceState, "get").returns(undefined);

      assert.deepEqual(cache.getData(), []);
    });
  });

  describe("updateData", () => {
    it("should update cache with new array", () => {
      cache.updateData(getQpItems());

      assert.equal(
        updateStub.calledWith(appConfig.dataCacheKey, getQpItems()),
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
    it("should clearData and clearConfig methods be invoked", () => {
      const clearDataStub = sinon.stub(cacheAny, "clearData");
      const clearConfigStub = sinon.stub(cache, "clearConfig");
      cache.clear();

      assert.equal(clearDataStub.calledOnce, true);
      assert.equal(clearConfigStub.calledOnce, true);
    });
  });

  describe("clearData", () => {
    it("should clear data cache", () => {
      cacheAny.clearData();

      assert.equal(updateStub.calledOnce, true);
    });
  });

  describe("clearConfig", () => {
    it("should clear config cache", () => {
      cache.clearConfig();

      assert.equal(updateStub.calledOnce, true);
    });
  });
});
