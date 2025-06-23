"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const cache = require("../../src/cache");
const workspaceCommon_1 = require("../../src/workspaceCommon");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        removeFromCacheByPath: {
            setupForRemovingGivenUriFromStoredDataWhenFileRemoved: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
            setupForRemovingGivenUriFromStoredDataWhenFileRenamedOrMoved: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
            setupForRemovingGivenUriFromStoredDataWhenTextInFileChanged: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
            setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRemoved: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
            setupForRemovingAllUrisForGivenFolderUriWhenDirectoryRenamed: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
            setupForRemovingGivenUriWhenFileReloadedIfUnsaved: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: (0, qpItemMockFactory_1.getQpItems)(),
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=workspaceRemover.testSetup.js.map