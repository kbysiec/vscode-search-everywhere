import { assert } from "chai";
import * as vscode from "vscode";
import { appConfig } from "../../appConfig";
import * as cache from "../../cache";
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
    it("1: should return array of indexed symbols and files from cache", () => {
      const qpItems = setups.getData1();
      assert.equal(cache.getData(), qpItems);
    });

    it("2: should return empty array if cache is undefined", () => {
      const qpItems = setups.getData2();
      assert.deepEqual(cache.getData(), qpItems);
    });
  });

  describe("updateData", () => {
    it("1: should update cache with new array", () => {
      const {
        stubs: [updateStub],
        qpItems,
      } = setups.updateData1();
      cache.updateData(qpItems);

      assert.equal(
        updateStub.calledWith(appConfig.dataCacheKey, qpItems),
        true
      );
    });
  });

  describe("getNotSavedUriPaths", () => {
    it("1: should return array of uri paths from cache", () => {
      const paths = setups.getNotSavedUriPaths1();
      assert.equal(cache.getNotSavedUriPaths(), paths);
    });

    it("2: should return empty array if cache is undefined", () => {
      const paths = setups.getNotSavedUriPaths2();
      assert.deepEqual(cache.getNotSavedUriPaths(), paths);
    });
  });

  describe("getConfigByKey", () => {
    it("1: should return config value from cache", () => {
      const key = setups.getConfigByKey1();

      assert.deepEqual(
        cache.getConfigByKey<string[]>(key),
        mock.configuration[key]
      );
    });

    it("2: should return undefined if cache does not contain value for given key", () => {
      const key = setups.getConfigByKey2();
      assert.equal(cache.getConfigByKey<string[]>(key), undefined);
    });
  });

  describe("updateConfigByKey", () => {
    it("1: should update config value in cache if cache object exists", () => {
      const {
        stubs: [updateStub],
        key,
        newConfig,
      } = setups.updateConfigByKey1();
      cache.updateConfigByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, newConfig),
        true
      );
    });

    it("2: should create cache object if it does not exist and set config value", () => {
      const {
        stubs: [updateStub],
        key,
      } = setups.updateConfigByKey2();
      cache.updateConfigByKey(key, mock.newExcludePatterns);

      assert.equal(
        updateStub.calledWith(appConfig.configCacheKey, mock.newConfiguration),
        true
      );
    });
  });

  describe("clear", () => {
    it("1: should clear data and config from cache", () => {
      const [updateStub] = setups.clear1();
      cache.clear();
      assert.equal(updateStub.calledTwice, true);
    });
  });

  describe("clearConfig", () => {
    it("1: should clear config from cache", () => {
      const [updateStub] = setups.clearConfig1();
      cache.clearConfig();
      assert.equal(updateStub.calledOnce, true);
    });
  });

  describe("clearNotSavedUriPaths", () => {
    it("1: should clear not saved uri paths from cache", () => {
      const [updateStub] = setups.clearNotSavedUriPaths1();
      cache.clearNotSavedUriPaths();
      assert.equal(updateStub.calledOnce, true);
    });
  });
});
