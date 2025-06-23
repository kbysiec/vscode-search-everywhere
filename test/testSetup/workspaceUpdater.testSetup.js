"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const cache = require("../../src/cache");
const utils_1 = require("../../src/utils");
const workspaceCommon_1 = require("../../src/workspaceCommon");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        updateCacheByPath: {
            setupForInvokingIndexMethodWhenErrorThrown: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "index",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "downloadData",
                        throws: new Error("test error"),
                    },
                    {
                        object: utils_1.utils,
                        method: "printErrorMessage",
                    },
                ], sandbox);
            },
            setupForUpdatingDataWhenFileTextChanged: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "downloadData",
                        returns: Promise.resolve((0, qpItemMockFactory_1.getQpItemsSymbolAndUri)("./fake-new/")),
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: [],
                    },
                ], sandbox);
            },
            setupForUpdatingDataWhenFileCreated: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "downloadData",
                        returns: Promise.resolve((0, qpItemMockFactory_1.getQpItem)()),
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: [],
                    },
                ], sandbox);
            },
            setupForUpdatingDataWhenFileRenamedOrMoved: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "downloadData",
                        returns: Promise.resolve((0, qpItemMockFactory_1.getQpItem)()),
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: [],
                    },
                ], sandbox);
            },
            setupForUpdatingDataForAllUrisWhenFolderRenamedOrMoved: () => {
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
                    {
                        object: utils_1.utils,
                        method: "updateQpItemsWithNewDirectoryPath",
                        returns: (0, qpItemMockFactory_1.getQpItems)(2, "./fake-new/"),
                    },
                ], sandbox);
            },
            setupForUpdatingDataWhenFileReloadedIfUnsaved: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: cache,
                        method: "updateData",
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "downloadData",
                        returns: Promise.resolve((0, qpItemMockFactory_1.getQpItemsSymbolAndUri)("./fake-new/")),
                    },
                    {
                        object: workspaceCommon_1.workspaceCommon,
                        method: "getData",
                        returns: [],
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=workspaceUpdater.testSetup.js.map