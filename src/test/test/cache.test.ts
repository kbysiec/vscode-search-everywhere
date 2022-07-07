// import * as vscode from "vscode";
// import * as sinon from "sinon";
// import { assert } from "chai";
// import { getExtensionContext } from "../util/mockFactory";
// import * as mock from "../mock/cache.mock";
// import { appConfig } from "../../appConfig";
// import Cache from "../../cache";
// import { getTestSetups } from "../testSetup/cache.testSetup";

// describe("Cache", () => {
//   let context: vscode.ExtensionContext = getExtensionContext();
//   let cache: Cache = new Cache(context);
//   let updateStub: sinon.SinonStub;
//   let setups = getTestSetups(context);

//   beforeEach(() => {
//     context = getExtensionContext();
//     cache = new Cache(context);

//     setups = getTestSetups(context);
//     updateStub = setups.beforeEach();
//   });

//   describe("getData", () => {
//     it("1: should return array of indexed symbols and files from cache", () => {
//       const qpItems = setups.getData1();
//       assert.equal(cache.getData(), qpItems);
//     });

//     it("2: should return empty array if cache is undefined", () => {
//       const qpItems = setups.getData2();
//       assert.deepEqual(cache.getData(), qpItems);
//     });
//   });

//   describe("updateData", () => {
//     it("1: should update cache with new array", () => {
//       const qpItems = setups.updateData1();
//       cache.updateData(qpItems);

//       assert.equal(
//         updateStub.calledWith(appConfig.dataCacheKey, qpItems),
//         true
//       );
//     });
//   });

//   describe("getConfigByKey", () => {
//     it("1: should return config value from cache", () => {
//       const key = setups.getConfigByKey1();

//       assert.deepEqual(
//         cache.getConfigByKey<string[]>(key),
//         mock.configuration[key]
//       );
//     });

//     it("2: should return undefined if cache does not contain value for given key", () => {
//       const key = setups.getConfigByKey2();
//       assert.equal(cache.getConfigByKey<string[]>(key), undefined);
//     });
//   });

//   describe("updateConfigByKey", () => {
//     it("1: should update config value in cache if cache object exists", () => {
//       const { key, newConfig } = setups.updateConfigByKey1();
//       cache.updateConfigByKey(key, mock.newExcludePatterns);

//       assert.equal(
//         updateStub.calledWith(appConfig.configCacheKey, newConfig),
//         true
//       );
//     });

//     it("2: should create cache object if it does not exist and set config value", () => {
//       const key = setups.updateConfigByKey2();
//       cache.updateConfigByKey(key, mock.newExcludePatterns);

//       assert.equal(
//         updateStub.calledWith(appConfig.configCacheKey, mock.newConfiguration),
//         true
//       );
//     });
//   });

//   describe("clear", () => {
//     it("1: should clearData and clearConfig methods be invoked", () => {
//       cache.clear();
//       assert.equal(updateStub.calledTwice, true);
//     });
//   });

//   describe("clearConfig", () => {
//     it("1: should clear config cache", () => {
//       cache.clearConfig();
//       assert.equal(updateStub.calledOnce, true);
//     });
//   });
// });
