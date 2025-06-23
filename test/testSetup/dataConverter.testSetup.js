"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const config = require("../../src/config");
const dataConverter_1 = require("../../src/dataConverter");
const utils_1 = require("../../src/utils");
const dataConverter_mock_1 = require("../mock/dataConverter.mock");
const mockFactory_1 = require("../util/mockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const stubConfig = (sandbox, icons = {}, shouldUseItemsFilterPhrases = false, itemsFilterPhrases = {}, workspaceFolders = dataConverter_mock_1.mocks.workspaceFolders) => {
    (0, stubHelpers_1.stubMultiple)([
        {
            object: dataConverter_1.dataConverter,
            method: "getIcons",
            returns: icons,
        },
        {
            object: dataConverter_1.dataConverter,
            method: "getShouldUseItemsFilterPhrases",
            returns: shouldUseItemsFilterPhrases,
        },
        {
            object: dataConverter_1.dataConverter,
            method: "getItemsFilterPhrases",
            returns: itemsFilterPhrases,
        },
        {
            object: vscode.workspace,
            method: "workspaceFolders",
            returns: workspaceFolders,
            isNotMethod: true,
            returnsIsUndefined: !!workspaceFolders,
        },
    ], sandbox);
};
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        reload: {
            setupForFetchingConfig: () => {
                return (0, stubHelpers_1.stubMultiple)([{ object: dataConverter_1.dataConverter, method: "fetchConfig" }], sandbox);
            },
        },
        cancel: {
            setupForSettingCancelledFlag: () => {
                return (0, stubHelpers_1.stubMultiple)([{ object: dataConverter_1.dataConverter, method: "setCancelled" }], sandbox);
            },
        },
        convertToQpData: {
            setupForConvertingWithoutIconsAndFilterPhrases: () => {
                stubConfig(sandbox);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "getNameFromUri",
                        returns: "fake-1.ts",
                    },
                    {
                        object: utils_1.utils,
                        method: "normalizeUriPath",
                        returns: "/./fake/fake-1.ts",
                    },
                    {
                        object: utils_1.utils,
                        method: "getSplitter",
                        returns: "§&§",
                    },
                ], sandbox);
                const { workspaceData, qpItems } = dataConverter_mock_1.mocks.convertToQpData1();
                return {
                    workspaceData,
                    qpItems,
                };
            },
            setupForConvertingWithIconsAndFilterPhrases: () => {
                const configuration = (0, mockFactory_1.getConfiguration)().searchEverywhere;
                stubConfig(sandbox, configuration.icons, true, configuration.itemsFilterPhrases, null);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "getNameFromUri",
                        returns: "fake-1.ts",
                    },
                    {
                        object: utils_1.utils,
                        method: "normalizeUriPath",
                        returns: "/./fake/fake-1.ts",
                    },
                    {
                        object: utils_1.utils,
                        method: "getSplitter",
                        returns: "§&§",
                    },
                ], sandbox);
                const { workspaceData, qpItems } = dataConverter_mock_1.mocks.convertToQpData2();
                return {
                    workspaceData,
                    qpItems,
                };
            },
            setupForReturningEmptyArray: () => {
                return {
                    workspaceData: (0, mockFactory_1.getWorkspaceData)(),
                    qpItems: [],
                };
            },
            setupForReturningEmptyArrayWhenCancelled: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataConverter_1.dataConverter,
                        method: "getIsCancelled",
                        returns: true,
                    },
                ], sandbox);
                const { workspaceData } = dataConverter_mock_1.mocks.convertToQpData4();
                return {
                    workspaceData,
                    qpItems: [],
                };
            },
        },
        fetchConfig: {
            setupForFetchingIcons: () => {
                const configuration = (0, mockFactory_1.getConfiguration)().searchEverywhere;
                const expected = configuration.icons;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchIcons",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchShouldUseItemsFilterPhrases",
                    },
                    {
                        object: config,
                        method: "fetchItemsFilterPhrases",
                    },
                ], sandbox);
                return expected;
            },
            setupForFetchingShouldUseItemsFilterPhrasesFlag: () => {
                const configuration = (0, mockFactory_1.getConfiguration)().searchEverywhere;
                const expected = configuration.shouldUseItemsFilterPhrases;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchShouldUseItemsFilterPhrases",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchIcons",
                    },
                    {
                        object: config,
                        method: "fetchItemsFilterPhrases",
                    },
                ], sandbox);
                return expected;
            },
            setupForFetchingItemsFilterPhrases: () => {
                const configuration = (0, mockFactory_1.getConfiguration)().searchEverywhere;
                const expected = configuration.itemsFilterPhrases;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchItemsFilterPhrases",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchShouldUseItemsFilterPhrases",
                    },
                    {
                        object: config,
                        method: "fetchIcons",
                    },
                ], sandbox);
                return expected;
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=dataConverter.testSetup.js.map