"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const dataService_1 = require("../../src/dataService");
const dataService_testSetup_1 = require("../testSetup/dataService.testSetup");
const itemMockFactory_1 = require("../util/itemMockFactory");
describe("DataService", () => {
    let setups;
    before(() => {
        setups = (0, dataService_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("reload", () => {
        it("should fetchConfig method be invoked", () => {
            const [fetchConfigStub] = setups.reload.setupForFetchingConfig();
            dataService_1.dataService.reload();
            chai_1.assert.equal(fetchConfigStub.calledOnce, true);
        });
    });
    describe("cancel", () => {
        it("should setCancelled method be invoked with true parameter", () => {
            const [setCancelledStub] = setups.cancel.setupForSettingCancelledFlag();
            dataService_1.dataService.cancel();
            chai_1.assert.equal(setCancelledStub.calledOnce, true);
            chai_1.assert.equal(setCancelledStub.calledWith(true), true);
        });
    });
    describe("fetchData", () => {
        it("should return workspace data when exclude patterns array is empty", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForReturningWorkspaceDataWithEmptyExcludePatterns();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 4);
        }));
        it("should return array of vscode.Uri or vscode.DocumentSymbol items with workspace data when exclude patterns array contains one element", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForReturningWorkspaceDataWithSingleExcludePattern();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 4);
        }));
        it("should return array of vscode.Uri or vscode.DocumentSymbol items with workspace data when exclude patterns array contains more than one element", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForReturningWorkspaceDataWithMultipleExcludePatterns();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 4);
        }));
        it("should utils.printErrorMessage method be invoked if error is thrown", () => __awaiter(void 0, void 0, void 0, function* () {
            const [printErrorMessageStub] = setups.fetchData.setupForPrintingErrorMessageWhenErrorThrown();
            yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(printErrorMessageStub.calledOnce, true);
        }));
        it("should return array of vscode.Uri items (given uris param is an array with items)", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForReturningUriItemsWhenUrisParamProvided();
            const items = yield dataService_1.dataService.fetchData((0, itemMockFactory_1.getItems)());
            chai_1.assert.equal(items.count, 4);
        }));
        it("should repeat trial to get symbols for file if returned undefined", () => __awaiter(void 0, void 0, void 0, function* () {
            const [getSymbolsForUriStub] = setups.fetchData.setupForRetryingSymbolsFetchWhenUndefinedReturned();
            yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(getSymbolsForUriStub.callCount, 10);
        }));
        it("should return empty array of items with workspace data if fetching is canceled", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForReturningEmptyArrayWhenFetchingCancelled();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 0);
        }));
        it("should return array of items filtered by itemsFilter with defined allowed kinds", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForFilteringItemsByAllowedKinds();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 1);
        }));
        it("should return array of items filtered by itemsFilter with defined ignored kinds", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForFilteringItemsByIgnoredKinds();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 1);
        }));
        it("should return array of items filtered by itemsFilter with defined ignored names", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForFilteringItemsByIgnoredNames();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 0);
        }));
        it("should not include uri if already exists in elements", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.fetchData.setupForExcludingExistingUrisFromElements();
            const items = yield dataService_1.dataService.fetchData();
            chai_1.assert.equal(items.count, 3);
        }));
    });
    describe("isUriExistingInWorkspace", () => {
        it("should return true if uri exists in workspace", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.isUriExistingInWorkspace.setupForReturningTrueWhenUriExists();
            const item = (0, itemMockFactory_1.getItem)();
            chai_1.assert.equal(yield dataService_1.dataService.isUriExistingInWorkspace(item), true);
        }));
        it("should return false if uri does not exist in workspace", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.isUriExistingInWorkspace.setupForReturningFalseWhenUriDoesNotExist();
            const item = (0, itemMockFactory_1.getItem)("./test/path/to/workspace");
            chai_1.assert.equal(yield dataService_1.dataService.isUriExistingInWorkspace(item), false);
        }));
    });
    describe("getIsCancelled", () => {
        it("should return state of isCancelled flag", () => {
            dataService_1.dataService.setIsCancelled(true);
            chai_1.assert.equal(dataService_1.dataService.getIsCancelled(), true);
        });
    });
    describe("fetchConfig", () => {
        it("should fetch items filter", () => {
            const itemsFilter = setups.fetchConfig.setupForFetchingItemsFilter();
            dataService_1.dataService.fetchConfig();
            chai_1.assert.equal(dataService_1.dataService.getItemsFilter(), itemsFilter);
        });
        it("should patternProvider.fetchConfig method be invoked", () => {
            const [patternProviderFetchConfigStub] = setups.fetchConfig.setupForInvokingPatternProviderFetchConfig();
            dataService_1.dataService.fetchConfig();
            chai_1.assert.equal(patternProviderFetchConfigStub.calledOnce, true);
        });
    });
});
//# sourceMappingURL=dataService.test.js.map