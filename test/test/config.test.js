"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const config = require("../../src/config");
const config_testSetup_1 = require("../testSetup/config.testSetup");
describe("Config", () => {
    let configuration;
    let setups;
    before(() => {
        setups = (0, config_testSetup_1.getTestSetups)();
        configuration = setups.before();
    });
    beforeEach(() => setups.beforeEach());
    afterEach(() => setups.afterEach());
    describe("fetchShouldDisplayNotificationInStatusBar", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldDisplayNotificationInStatusBar";
            chai_1.assert.equal(config.fetchShouldDisplayNotificationInStatusBar(), configuration[section][key]);
        });
    });
    describe("fetchShouldInitOnStartup", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldInitOnStartup";
            chai_1.assert.equal(config.fetchShouldInitOnStartup(), configuration[section][key]);
        });
    });
    describe("fetchShouldHighlightSymbol", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldHighlightSymbol";
            chai_1.assert.equal(config.fetchShouldHighlightSymbol(), configuration[section][key]);
        });
    });
    describe("fetchShouldUseDebounce", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldUseDebounce";
            chai_1.assert.equal(config.fetchShouldUseDebounce(), configuration[section][key]);
        });
    });
    describe("fetchIcons", () => {
        it("should return object containing icons from configuration", () => {
            const section = "searchEverywhere";
            const key = "icons";
            chai_1.assert.equal(config.fetchIcons(), configuration[section][key]);
        });
    });
    describe("fetchItemsFilter", () => {
        it("should return object containing items filter from configuration", () => {
            const section = "searchEverywhere";
            const key = "itemsFilter";
            chai_1.assert.equal(config.fetchItemsFilter(), configuration[section][key]);
        });
    });
    describe("fetchShouldUseItemsFilterPhrases", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldUseItemsFilterPhrases";
            chai_1.assert.equal(config.fetchShouldUseItemsFilterPhrases(), configuration[section][key]);
        });
    });
    describe("fetchItemsFilterPhrases", () => {
        it("should return object containing items filter phrases from configuration", () => {
            const section = "searchEverywhere";
            const key = "itemsFilterPhrases";
            chai_1.assert.equal(config.fetchItemsFilterPhrases(), configuration[section][key]);
        });
    });
    describe("fetchHelpPhrase", () => {
        it("should return help phrase from configuration", () => {
            const section = "searchEverywhere";
            const key = "helpPhrase";
            chai_1.assert.equal(config.fetchHelpPhrase(), configuration[section][key]);
        });
    });
    describe("fetchShouldItemsBeSorted", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldItemsBeSorted";
            chai_1.assert.equal(config.fetchShouldItemsBeSorted(), configuration[section][key]);
        });
    });
    describe("fetchShouldSearchSelection", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldSearchSelection";
            chai_1.assert.equal(config.fetchShouldSearchSelection(), configuration[section][key]);
        });
    });
    describe("fetchExclude", () => {
        it("should return array of exclude patterns from configuration", () => {
            const section = "searchEverywhere";
            const key = "exclude";
            chai_1.assert.equal(config.fetchExclude(), configuration[section][key]);
        });
        it("should return array of exclude patterns from cache if it is not empty", () => {
            const section = "searchEverywhere";
            const key = "exclude";
            const [getConfigurationStub] = setups.fetchExclude.setupForReturningFromCache(section, key);
            chai_1.assert.deepEqual(config.fetchExclude(), configuration[section][key]);
            chai_1.assert.equal(getConfigurationStub.calledOnce, false);
        });
    });
    describe("fetchInclude", () => {
        it("should return array of include pattern from configuration", () => {
            const section = "searchEverywhere";
            const key = "include";
            chai_1.assert.equal(config.fetchInclude(), configuration[section][key]);
        });
    });
    describe("fetchFilesAndSearchExclude", () => {
        it("should return array of exclude patterns from configuration", () => {
            chai_1.assert.deepEqual(config.fetchFilesAndSearchExclude(), [
                "**/.git",
                "**/search_exclude/**",
            ]);
        });
    });
    describe("fetchExcludeMode", () => {
        it("should return exclude mode from configuration", () => {
            const section = "searchEverywhere";
            const key = "excludeMode";
            chai_1.assert.equal(config.fetchExcludeMode(), configuration[section][key]);
        });
    });
    describe("fetchShouldWorkspaceDataBeCached", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldWorkspaceDataBeCached";
            chai_1.assert.equal(config.fetchShouldWorkspaceDataBeCached(), configuration[section][key]);
        });
    });
    describe("fetchShouldSearchSelection", () => {
        it("should return boolean from configuration", () => {
            const section = "searchEverywhere";
            const key = "shouldSearchSelection";
            chai_1.assert.equal(config.fetchShouldSearchSelection(), configuration[section][key]);
        });
    });
});
//# sourceMappingURL=config.test.js.map