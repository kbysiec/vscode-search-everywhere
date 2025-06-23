import { assert } from "chai";
import * as vscode from "vscode";
import { appConfig } from "../../src/appConfig";
import * as cache from "../../src/cache";
import * as mock from "../mock/cache.mock";
import { getTestSetups } from "../testSetup/cache.testSetup";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("Cache", () => {
  let context: vscode.ExtensionContext;
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
    context = setups.before();
    cache.initCache(context);
  });
  afterEach(() => setups.afterEach());

  describe("getData", () => {
    it("should return array of indexed symbols and files from cache", () => {
      const qpItems = setups.getData.setupForReturningCachedData();
      assert.equal(cache.getData(), qpItems);
    });

    it("should return empty array if cache is undefined", () => {
      const qpItems = setups.getData.setupForEmptyCache();
      assert.deepEqual(cache.getData(), qpItems);
    });
  });

  describe("updateData", () => {
    it("should update cache with new array", () => {
      const {
        stubs: [updateStub],
        qpItems,
      } = setups.updateData.setupForUpdatingCache();
      cache.updateData(qpItems);

      assert.equal(
        updateStub.calledWith(appConfig.dataCacheKey, qpItems),
        true
      );
    });
  });

  describe("getNotSavedUriPaths", () => {
    it("should return array of uri paths from cache", () => {
      const paths = setups.getNotSavedUriPaths.setupForReturningCachedPaths();
      assert.equal(cache.getNotSavedUriPaths(), paths);
    });

    it("should return empty array if cache is undefined", () => {
      const paths = setups.getNotSavedUriPaths.setupForEmptyCache();
      assert.deepEqual(cache.getNotSavedUriPaths(), paths);
    });
  });

  describe("getConfigByKey", () => {
    it("should return config value from cache", () => {
      const key = setups.getConfigByKey.setupForExistingConfigKey();

      assert.deepEqual(
        cache.getConfigByKey<string[]>(key),
        mock.configuration[key]
      );
    });

    it("should return undefined if cache does not contain value for given key", () => {
      const key = setups.getConfigByKey.setupForNonExistentConfigKey();
      assert.equal(cache.getConfigByKey<string[]>(key), undefined);
    });
  });

  describe("updateConfigByKey", () => {
    it("should update config value in cache if cache object exists", () => {
      const {
        stubs: [updateStub],
        key,
        newConfig,
      } = setups.updateConfigByKey.setupForExistingCacheObject();
      cache.updateConfigByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, newConfig),
        true
      );
    });

    it("should create cache object if it does not exist and set config value", () => {
      const {
        stubs: [updateStub],
        key,
      } = setups.updateConfigByKey.setupForNonExistentCacheObject();
      cache.updateConfigByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, mock.newConfiguration),
        true
      );
    });
  });

  describe("clear", () => {
    it("should clear data and config from cache", () => {
      const [updateStub] = setups.clear.setupForClearingDataAndConfig();
      cache.clear();
      assert.equal(updateStub.calledTwice, true);
    });
  });

  describe("clearConfig", () => {
    it("should clear config from cache", () => {
      const [updateStub] = setups.clearConfig.setupForClearingConfig();
      cache.clearConfig();
      assert.equal(updateStub.calledOnce, true);
    });
  });

  describe("clearNotSavedUriPaths", () => {
    it("should clear not saved uri paths from cache", () => {
      const [updateStub] =
        setups.clearNotSavedUriPaths.setupForClearingNotSavedUriPaths();
      cache.clearNotSavedUriPaths();
      assert.equal(updateStub.calledOnce, true);
    });
  });
});
