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
const types_1 = require("../../src/types");
const workspaceUpdater = require("../../src/workspaceUpdater");
const workspaceUpdater_testSetup_1 = require("../testSetup/workspaceUpdater.testSetup");
const itemMockFactory_1 = require("../util/itemMockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
describe("WorkspaceUpdater", () => {
    let setups;
    before(() => {
        setups = (0, workspaceUpdater_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("updateCacheByPath", () => {
        it("should index method be invoked which register rebuild action if error is thrown", () => __awaiter(void 0, void 0, void 0, function* () {
            const [indexStub] = setups.updateCacheByPath.setupForInvokingIndexMethodWhenErrorThrown();
            yield workspaceUpdater.updateCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.TextChange);
            chai_1.assert.equal(indexStub.calledOnce, true);
        }));
        it("should update data for given uri when file text is changed", () => __awaiter(void 0, void 0, void 0, function* () {
            const [updateDataStub] = setups.updateCacheByPath.setupForUpdatingDataWhenFileTextChanged();
            yield workspaceUpdater.updateCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.TextChange);
            chai_1.assert.equal(updateDataStub.calledOnce, true);
            chai_1.assert.deepEqual(updateDataStub.args[0][0], (0, qpItemMockFactory_1.getQpItemsSymbolAndUriExt)("./fake-new/"));
        }));
        it("should update data for given uri when file is created", () => __awaiter(void 0, void 0, void 0, function* () {
            const [updateDataStub] = setups.updateCacheByPath.setupForUpdatingDataWhenFileCreated();
            yield workspaceUpdater.updateCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.CreateNewFile);
            chai_1.assert.equal(updateDataStub.calledOnce, true);
            chai_1.assert.deepEqual(updateDataStub.args[0][0], (0, qpItemMockFactory_1.getQpItems)(1));
        }));
        it("should update data for given uri when file is renamed or moved", () => __awaiter(void 0, void 0, void 0, function* () {
            const [updateDataStub] = setups.updateCacheByPath.setupForUpdatingDataWhenFileRenamedOrMoved();
            yield workspaceUpdater.updateCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.RenameOrMoveFile);
            chai_1.assert.equal(updateDataStub.calledOnce, true);
            chai_1.assert.deepEqual(updateDataStub.args[0][0], (0, qpItemMockFactory_1.getQpItems)(1));
        }));
        it("should update data for all uris for given folder uri when folder renamed or moved", () => __awaiter(void 0, void 0, void 0, function* () {
            const [updateDataStub] = setups.updateCacheByPath.setupForUpdatingDataForAllUrisWhenFolderRenamedOrMoved();
            yield workspaceUpdater.updateCacheByPath((0, itemMockFactory_1.getDirectory)("./fake-new/"), types_1.DetailedActionType.RenameOrMoveDirectory);
            chai_1.assert.equal(updateDataStub.calledOnce, true);
            chai_1.assert.deepEqual(updateDataStub.args[0][0], (0, qpItemMockFactory_1.getQpItems)(2, "./fake-new/"));
        }));
        it("should update data for given uri when file is reloaded if it is unsaved", () => __awaiter(void 0, void 0, void 0, function* () {
            const [updateDataStub] = setups.updateCacheByPath.setupForUpdatingDataWhenFileReloadedIfUnsaved();
            yield workspaceUpdater.updateCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.ReloadUnsavedUri);
            chai_1.assert.equal(updateDataStub.calledOnce, true);
            chai_1.assert.deepEqual(updateDataStub.args[0][0], (0, qpItemMockFactory_1.getQpItemsSymbolAndUriExt)("./fake-new/"));
        }));
    });
});
//# sourceMappingURL=workspaceUpdater.test.js.map