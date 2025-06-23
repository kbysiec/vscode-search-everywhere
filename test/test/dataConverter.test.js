"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const dataConverter_1 = require("../../src/dataConverter");
const dataConverter_testSetup_1 = require("../testSetup/dataConverter.testSetup");
describe("DataConverter", () => {
    let setups;
    before(() => {
        setups = (0, dataConverter_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("reload", () => {
        it("should fetchConfig method be invoked", () => {
            const [fetchConfigStub] = setups.reload.setupForFetchingConfig();
            dataConverter_1.dataConverter.reload();
            chai_1.assert.equal(fetchConfigStub.calledOnce, true);
        });
    });
    describe("cancel", () => {
        it("should setCancelled method be invoked with true parameter", () => {
            const [setCancelledStub] = setups.cancel.setupForSettingCancelledFlag();
            dataConverter_1.dataConverter.cancel();
            chai_1.assert.equal(setCancelledStub.calledOnce, true);
            chai_1.assert.equal(setCancelledStub.calledWith(true), true);
        });
    });
    describe("convertToQpData", () => {
        it("should return quick pick data - without icons and filter phrases", () => {
            const { workspaceData, qpItems } = setups.convertToQpData.setupForConvertingWithoutIconsAndFilterPhrases();
            chai_1.assert.deepEqual(dataConverter_1.dataConverter.convertToQpData(workspaceData), qpItems);
        });
        it("should return quick pick data - with icons and filter phrases", () => {
            const { workspaceData, qpItems } = setups.convertToQpData.setupForConvertingWithIconsAndFilterPhrases();
            chai_1.assert.deepEqual(dataConverter_1.dataConverter.convertToQpData(workspaceData), qpItems);
        });
        it("should return empty array", () => {
            const { workspaceData, qpItems } = setups.convertToQpData.setupForReturningEmptyArray();
            chai_1.assert.deepEqual(dataConverter_1.dataConverter.convertToQpData(workspaceData), qpItems);
        });
        it("should return empty array if isCancelled equal to true", () => {
            const { workspaceData, qpItems } = setups.convertToQpData.setupForReturningEmptyArrayWhenCancelled();
            chai_1.assert.deepEqual(dataConverter_1.dataConverter.convertToQpData(workspaceData), qpItems);
        });
    });
    describe("fetchConfig", () => {
        it("should fetch icons", () => {
            const icons = setups.fetchConfig.setupForFetchingIcons();
            dataConverter_1.dataConverter.fetchConfig();
            chai_1.assert.equal(dataConverter_1.dataConverter.getIcons(), icons);
        });
        it("should fetch shouldUseItemsFilterPhrases flag", () => {
            const shouldUseItemsFilterPhrases = setups.fetchConfig.setupForFetchingShouldUseItemsFilterPhrasesFlag();
            dataConverter_1.dataConverter.fetchConfig();
            chai_1.assert.equal(dataConverter_1.dataConverter.getShouldUseItemsFilterPhrases(), shouldUseItemsFilterPhrases);
        });
        it("should fetch items filter phrases", () => {
            const itemsFilterPhrases = setups.fetchConfig.setupForFetchingItemsFilterPhrases();
            dataConverter_1.dataConverter.fetchConfig();
            chai_1.assert.equal(dataConverter_1.dataConverter.getItemsFilterPhrases(), itemsFilterPhrases);
        });
    });
});
//# sourceMappingURL=dataConverter.test.js.map