"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const types_1 = require("../../src/types");
const workspaceRemover = require("../../src/workspaceRemover");
const workspaceRemover_testSetup_1 = require("../testSetup/workspaceRemover.testSetup");
const itemMockFactory_1 = require("../util/itemMockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
describe("WorkspaceRemover", () => {
    let setups;
    before(() => {
        setups = (0, workspaceRemover_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("removeFromCacheByPath", () => {
        it("should remove given uri from stored data when file is removed ", () => {
            const [updateDataStub] = setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenFileRemoved();
            workspaceRemover.removeFromCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.RemoveFile);
            chai_1.assert.equal(updateDataStub.calledWith((0, qpItemMockFactory_1.getQpItems)(1, undefined, 1)), true);
        });
        it("should remove given uri from stored data when file is renamed or moved", () => {
            const [updateDataStub] = setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenFileRenamedOrMoved();
            workspaceRemover.removeFromCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.RenameOrMoveFile);
            chai_1.assert.equal(updateDataStub.calledWith((0, qpItemMockFactory_1.getQpItems)(1, undefined, 1)), true);
        });
        it("should remove given uri from stored data when text in file is changed", () => {
            const [updateDataStub] = setups.removeFromCacheByPath.setupForRemovingGivenUriFromStoredDataWhenTextInFileChanged();
            workspaceRemover.removeFromCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.TextChange);
            chai_1.assert.equal(updateDataStub.calledWith((0, qpItemMockFactory_1.getQpItems)(1, undefined, 1)), true);
        });
        it("should remove all uris for given folder uri when directory is removed", () => {
            const [updateDataStub] = setups.removeFromCacheByPath.setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRemoved();
            workspaceRemover.removeFromCacheByPath((0, itemMockFactory_1.getDirectory)("./fake/"), types_1.DetailedActionType.RemoveDirectory);
            chai_1.assert.equal(updateDataStub.calledWith([]), true);
        });
        it("should remove all uris for given folder uri when directory is renamed", () => {
            const [updateDataStub] = setups.removeFromCacheByPath.setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRenamed();
            workspaceRemover.removeFromCacheByPath((0, itemMockFactory_1.getDirectory)("./fake/"), types_1.DetailedActionType.RenameOrMoveDirectory);
            chai_1.assert.equal(updateDataStub.calledWith([]), true);
        });
        it("should remove given uri when file is reloaded if it is unsaved", () => {
            const [updateDataStub] = setups.removeFromCacheByPath.setupForRemovingGivenUriWhenFileReloadedIfUnsaved();
            workspaceRemover.removeFromCacheByPath((0, itemMockFactory_1.getItem)(), types_1.DetailedActionType.ReloadUnsavedUri);
            chai_1.assert.equal(updateDataStub.calledWith((0, qpItemMockFactory_1.getQpItems)(1, undefined, 1)), true);
        });
    });
});
//# sourceMappingURL=workspaceRemover.test.js.map