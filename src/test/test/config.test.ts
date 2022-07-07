// import { assert } from "chai";
// import * as sinon from "sinon";
// import * as vscode from "vscode";
// import Cache from "../../cache";
// import Config from "../../config";
// import { getTestSetups } from "../testSetup/config.testSetup";
// import { getCacheStub } from "../util/stubFactory";

// describe("Config", () => {
//   let configuration: { [key: string]: any };
//   let getConfigurationStub: sinon.SinonStub;
//   let cacheStub: Cache = getCacheStub();
//   let config: Config = new Config(cacheStub);
//   let setups = getTestSetups(config);

//   beforeEach(() => {
//     ({
//       configuration,
//       stubs: [getConfigurationStub],
//     } = setups.beforeEach());
//     cacheStub = getCacheStub();
//     config = new Config(cacheStub);
//     setups = getTestSetups(config);
//   });

//   afterEach(() => {
//     (vscode.workspace.getConfiguration as sinon.SinonStub).restore();
//   });

//   describe("shouldDisplayNotificationInStatusBar", () => {
//     it("1: should return boolean from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "shouldDisplayNotificationInStatusBar";

//       assert.equal(
//         config.shouldDisplayNotificationInStatusBar(),
//         configuration[section][key]
//       );
//     });
//   });

//   describe("shouldInitOnStartup", () => {
//     it("1: should return boolean from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "shouldInitOnStartup";

//       assert.equal(config.shouldInitOnStartup(), configuration[section][key]);
//     });
//   });

//   describe("shouldHighlightSymbol", () => {
//     it("1: should return boolean from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "shouldHighlightSymbol";

//       assert.equal(config.shouldHighlightSymbol(), configuration[section][key]);
//     });
//   });

//   describe("shouldUseDebounce", () => {
//     it("1: should return boolean from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "shouldUseDebounce";

//       assert.equal(config.shouldUseDebounce(), configuration[section][key]);
//     });
//   });

//   describe("getIcons", () => {
//     it("1: should return object containing icons from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "icons";

//       assert.equal(config.getIcons(), configuration[section][key]);
//     });
//   });

//   describe("getItemsFilter", () => {
//     it("1: should return object containing items filter from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "itemsFilter";

//       assert.equal(config.getItemsFilter(), configuration[section][key]);
//     });
//   });

//   describe("shouldUseItemsFilterPhrases", () => {
//     it("1: should return boolean from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "shouldUseItemsFilterPhrases";

//       assert.equal(
//         config.shouldUseItemsFilterPhrases(),
//         configuration[section][key]
//       );
//     });
//   });

//   describe("getHelpPhrase", () => {
//     it("1: should return help phrase from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "helpPhrase";

//       assert.equal(config.getHelpPhrase(), configuration[section][key]);
//     });
//   });

//   describe("getItemsFilterPhrases", () => {
//     it("1: should return object containing items filter phrases from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "itemsFilterPhrases";

//       assert.equal(config.getItemsFilterPhrases(), configuration[section][key]);
//     });
//   });

//   describe("getExclude", () => {
//     it("1: should return array of exclude patterns from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "exclude";

//       assert.equal(config.getExclude(), configuration[section][key]);
//     });

//     it(`2: should return array of exclude patterns
//         from cache if it is not empty`, () => {
//       const section = "searchEverywhere";
//       const key = "exclude";
//       setups.getExclude2(section, key);

//       assert.deepEqual(config.getExclude(), configuration[section][key]);
//       assert.equal(getConfigurationStub.calledOnce, false);
//     });
//   });

//   describe("getInclude", () => {
//     it("1: should return array of include pattern from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "include";

//       assert.equal(config.getInclude(), configuration[section][key]);
//     });
//   });

//   describe("getFilesAndSearchExclude", () => {
//     it("1: should return array of exclude patterns from configuration", () => {
//       assert.deepEqual(config.getFilesAndSearchExclude(), [
//         "**/.git",
//         "**/search_exclude/**",
//       ]);
//     });
//   });

//   describe("getExcludeMode", () => {
//     it("1: should return exclude mode from configuration", () => {
//       const section = "searchEverywhere";
//       const key = "excludeMode";

//       assert.equal(config.getExcludeMode(), configuration[section][key]);
//     });
//   });
// });
