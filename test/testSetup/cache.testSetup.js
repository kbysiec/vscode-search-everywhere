"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const appConfig_1 = require("../../src/appConfig");
const mock = require("../mock/cache.mock");
const itemMockFactory_1 = require("../util/itemMockFactory");
const mockFactory_1 = require("../util/mockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const context = (0, mockFactory_1.getExtensionContext)();
    const sandbox = sinon.createSandbox();
    return {
        before: () => {
            (0, stubHelpers_1.stubMultiple)([
                {
                    object: appConfig_1.appConfig,
                    method: "dataCacheKey",
                    returns: "data",
                    isNotMethod: true,
                },
                {
                    object: appConfig_1.appConfig,
                    method: "configCacheKey",
                    returns: "config",
                    isNotMethod: true,
                },
            ], sandbox);
            return context;
        },
        afterEach: () => {
            sandbox.restore();
        },
        getData: {
            setupForReturningCachedData: () => {
                const qpItems = (0, qpItemMockFactory_1.getQpItems)();
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: qpItems,
                    },
                ], sandbox);
                return qpItems;
            },
            setupForEmptyCache: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: undefined,
                    },
                ], sandbox);
                return [];
            },
        },
        updateData: {
            setupForUpdatingCache: () => {
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "update",
                    },
                ], sandbox);
                return {
                    stubs,
                    qpItems: (0, qpItemMockFactory_1.getQpItems)(),
                };
            },
        },
        getNotSavedUriPaths: {
            setupForReturningCachedPaths: () => {
                const items = (0, itemMockFactory_1.getItems)();
                const paths = items.map((item) => item.path);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: paths,
                    },
                ], sandbox);
                return paths;
            },
            setupForEmptyCache: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: undefined,
                    },
                ], sandbox);
                return [];
            },
        },
        getConfigByKey: {
            setupForExistingConfigKey: () => {
                const key = "searchEverywhere.exclude";
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: { [key]: mock.configuration[key] },
                    },
                ], sandbox);
                return key;
            },
            setupForNonExistentConfigKey: () => {
                const key = "searchEverywhere.exclude";
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: undefined,
                    },
                ], sandbox);
                return key;
            },
        },
        updateConfigByKey: {
            setupForExistingCacheObject: () => {
                const key = "searchEverywhere.exclude";
                const newConfig = Object.assign(Object.assign({}, mock.configuration), { [key]: mock.newExcludePatterns });
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "update",
                    },
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: mock.configuration,
                    },
                ], sandbox);
                return { stubs, key, newConfig };
            },
            setupForNonExistentCacheObject: () => {
                const key = "searchEverywhere.exclude";
                const stubs = (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "update",
                    },
                    {
                        object: context.workspaceState,
                        method: "get",
                        returns: undefined,
                    },
                ], sandbox);
                return { stubs, key };
            },
        },
        clear: {
            setupForClearingDataAndConfig: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "update",
                    },
                ], sandbox);
            },
        },
        clearConfig: {
            setupForClearingConfig: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "update",
                    },
                ], sandbox);
            },
        },
        clearNotSavedUriPaths: {
            setupForClearingNotSavedUriPaths: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: context.workspaceState,
                        method: "update",
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=cache.testSetup.js.map