"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const appConfig_1 = require("../../src/appConfig");
const cache = require("../../src/cache");
const mock = require("../mock/cache.mock");
const cache_testSetup_1 = require("../testSetup/cache.testSetup");
describe("Cache", () => {
    let context;
    let setups;
    before(() => {
        setups = (0, cache_testSetup_1.getTestSetups)();
        context = setups.before();
        cache.initCache(context);
    });
    afterEach(() => setups.afterEach());
    describe("getData", () => {
        it("should return array of indexed symbols and files from cache", () => {
            const qpItems = setups.getData.setupForReturningCachedData();
            chai_1.assert.equal(cache.getData(), qpItems);
        });
        it("should return empty array if cache is undefined", () => {
            const qpItems = setups.getData.setupForEmptyCache();
            chai_1.assert.deepEqual(cache.getData(), qpItems);
        });
    });
    describe("updateData", () => {
        it("should update cache with new array", () => {
            const { stubs: [updateStub], qpItems, } = setups.updateData.setupForUpdatingCache();
            cache.updateData(qpItems);
            chai_1.assert.equal(updateStub.calledWith(appConfig_1.appConfig.dataCacheKey, qpItems), true);
        });
    });
    describe("getNotSavedUriPaths", () => {
        it("should return array of uri paths from cache", () => {
            const paths = setups.getNotSavedUriPaths.setupForReturningCachedPaths();
            chai_1.assert.equal(cache.getNotSavedUriPaths(), paths);
        });
        it("should return empty array if cache is undefined", () => {
            const paths = setups.getNotSavedUriPaths.setupForEmptyCache();
            chai_1.assert.deepEqual(cache.getNotSavedUriPaths(), paths);
        });
    });
    describe("getConfigByKey", () => {
        it("should return config value from cache", () => {
            const key = setups.getConfigByKey.setupForExistingConfigKey();
            chai_1.assert.deepEqual(cache.getConfigByKey(key), mock.configuration[key]);
        });
        it("should return undefined if cache does not contain value for given key", () => {
            const key = setups.getConfigByKey.setupForNonExistentConfigKey();
            chai_1.assert.equal(cache.getConfigByKey(key), undefined);
        });
    });
    describe("updateConfigByKey", () => {
        it("should update config value in cache if cache object exists", () => {
            const { stubs: [updateStub], key, newConfig, } = setups.updateConfigByKey.setupForExistingCacheObject();
            cache.updateConfigByKey(key, mock.newExcludePatterns);
            chai_1.assert.equal(updateStub.calledWith(appConfig_1.appConfig.configCacheKey, newConfig), true);
        });
        it("should create cache object if it does not exist and set config value", () => {
            const { stubs: [updateStub], key, } = setups.updateConfigByKey.setupForNonExistentCacheObject();
            cache.updateConfigByKey(key, mock.newExcludePatterns);
            chai_1.assert.equal(updateStub.calledWith(appConfig_1.appConfig.configCacheKey, mock.newConfiguration), true);
        });
    });
    describe("clear", () => {
        it("should clear data and config from cache", () => {
            const [updateStub] = setups.clear.setupForClearingDataAndConfig();
            cache.clear();
            chai_1.assert.equal(updateStub.calledTwice, true);
        });
    });
    describe("clearConfig", () => {
        it("should clear config from cache", () => {
            const [updateStub] = setups.clearConfig.setupForClearingConfig();
            cache.clearConfig();
            chai_1.assert.equal(updateStub.calledOnce, true);
        });
    });
    describe("clearNotSavedUriPaths", () => {
        it("should clear not saved uri paths from cache", () => {
            const [updateStub] = setups.clearNotSavedUriPaths.setupForClearingNotSavedUriPaths();
            cache.clearNotSavedUriPaths();
            chai_1.assert.equal(updateStub.calledOnce, true);
        });
    });
});
//# sourceMappingURL=cache.test.js.map