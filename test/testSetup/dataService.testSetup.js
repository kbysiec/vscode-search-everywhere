"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const config = require("../../src/config");
const dataService_1 = require("../../src/dataService");
const patternProvider_1 = require("../../src/patternProvider");
const utils_1 = require("../../src/utils");
const itemMockFactory_1 = require("../util/itemMockFactory");
const mockFactory_1 = require("../util/mockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const stubConfig = (sandbox, itemsFilter = {}, isCancelled = false) => {
    (0, stubHelpers_1.stubMultiple)([
        {
            object: dataService_1.dataService,
            method: "getItemsFilter",
            returns: itemsFilter,
        },
        {
            object: dataService_1.dataService,
            method: "getIsCancelled",
            returns: isCancelled,
        },
        {
            object: patternProvider_1.patternProvider,
            method: "getExcludePatterns",
            returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
        },
        {
            object: patternProvider_1.patternProvider,
            method: "getIncludePatterns",
            returns: Promise.resolve(["**/**/*"]),
        },
        {
            object: utils_1.utils,
            method: "getSplitter",
            returns: "§&§",
        },
    ], sandbox);
};
const stubFetchingItems = (sandbox) => {
    (0, stubHelpers_1.stubMultiple)([
        {
            object: utils_1.utils,
            method: "createWorkspaceData",
            returns: (0, mockFactory_1.getWorkspaceData)(),
        },
        {
            object: vscode.workspace,
            method: "findFiles",
            returns: Promise.resolve((0, itemMockFactory_1.getItems)()),
        },
        {
            object: vscode.commands,
            method: "executeCommand",
            returns: Promise.resolve((0, itemMockFactory_1.getDocumentSymbolItemSingleLineArray)(1)),
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
                return (0, stubHelpers_1.stubMultiple)([{ object: dataService_1.dataService, method: "fetchConfig" }], sandbox);
            },
        },
        cancel: {
            setupForSettingCancelledFlag: () => {
                return (0, stubHelpers_1.stubMultiple)([{ object: dataService_1.dataService, method: "setIsCancelled" }], sandbox);
            },
        },
        fetchData: {
            setupForReturningWorkspaceDataWithEmptyExcludePatterns: () => {
                stubConfig(sandbox);
                stubFetchingItems(sandbox);
            },
            setupForReturningWorkspaceDataWithSingleExcludePattern: () => {
                stubConfig(sandbox);
                stubFetchingItems(sandbox);
            },
            setupForReturningWorkspaceDataWithMultipleExcludePatterns: () => {
                stubConfig(sandbox);
                stubFetchingItems(sandbox);
            },
            setupForPrintingErrorMessageWhenErrorThrown: () => {
                stubConfig(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "printErrorMessage",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        throws: "test error",
                    },
                    {
                        object: vscode.commands,
                        method: "executeCommand",
                    },
                    {
                        object: utils_1.utils,
                        method: "createWorkspaceData",
                    },
                ], sandbox);
            },
            setupForReturningUriItemsWhenUrisParamProvided: () => {
                stubConfig(sandbox);
                stubFetchingItems(sandbox);
            },
            setupForRetryingSymbolsFetchWhenUndefinedReturned: () => {
                stubConfig(sandbox);
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataService_1.dataService,
                        method: "getSymbolsForUri",
                        returns: Promise.resolve(undefined),
                    },
                    {
                        object: utils_1.utils,
                        method: "sleep",
                    },
                    {
                        object: utils_1.utils,
                        method: "createWorkspaceData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: Promise.resolve((0, itemMockFactory_1.getItems)(1)),
                    },
                    {
                        object: vscode.commands,
                        method: "executeCommand",
                        returns: Promise.resolve((0, itemMockFactory_1.getDocumentSymbolItemSingleLineArray)(1)),
                    },
                ], sandbox);
            },
            setupForReturningEmptyArrayWhenFetchingCancelled: () => {
                stubConfig(sandbox, undefined, true);
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "clearWorkspaceData",
                    },
                ], sandbox);
                stubFetchingItems(sandbox);
            },
            setupForFilteringItemsByAllowedKinds: () => {
                stubConfig(sandbox, (0, mockFactory_1.getItemsFilter)([0]));
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "createWorkspaceData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: Promise.resolve((0, itemMockFactory_1.getItems)(1)),
                    },
                    {
                        object: vscode.commands,
                        method: "executeCommand",
                        returns: Promise.resolve((0, itemMockFactory_1.getDocumentSymbolItemSingleLineArray)(1, true)),
                    },
                ], sandbox);
            },
            setupForFilteringItemsByIgnoredKinds: () => {
                stubConfig(sandbox, (0, mockFactory_1.getItemsFilter)([], [0]));
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "createWorkspaceData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: Promise.resolve((0, itemMockFactory_1.getItems)(1)),
                    },
                    {
                        object: vscode.commands,
                        method: "executeCommand",
                        returns: Promise.resolve((0, itemMockFactory_1.getDocumentSymbolItemSingleLineArray)(1)),
                    },
                ], sandbox);
            },
            setupForFilteringItemsByIgnoredNames: () => {
                stubConfig(sandbox, (0, mockFactory_1.getItemsFilter)([], [], ["fake"]));
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "createWorkspaceData",
                        returns: (0, mockFactory_1.getWorkspaceData)(),
                    },
                    {
                        object: utils_1.utils,
                        method: "sleep",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: Promise.resolve((0, itemMockFactory_1.getItems)(2)),
                    },
                    {
                        object: vscode.commands,
                        method: "executeCommand",
                        returns: Promise.resolve(),
                    },
                ], sandbox);
            },
            setupForExcludingExistingUrisFromElements: () => {
                stubConfig(sandbox);
                const workspaceDataItems = [
                    {
                        uri: vscode.Uri.file("/./fake/fake-1.ts"),
                        get elements() {
                            return [
                                this.uri,
                                {
                                    name: "fake-1.ts§&§test name",
                                    detail: "test details",
                                    kind: 1,
                                    range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(3, 0)),
                                    selectionRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(3, 0)),
                                    children: [],
                                },
                            ];
                        },
                    },
                ];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: utils_1.utils,
                        method: "createWorkspaceData",
                        returns: (0, mockFactory_1.getWorkspaceData)(workspaceDataItems),
                    },
                    {
                        object: utils_1.utils,
                        method: "sleep",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: Promise.resolve((0, itemMockFactory_1.getItems)(2)),
                    },
                    {
                        object: vscode.commands,
                        method: "executeCommand",
                        returns: Promise.resolve(),
                    },
                ], sandbox);
            },
        },
        isUriExistingInWorkspace: {
            setupForReturningTrueWhenUriExists: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataService_1.dataService,
                        method: "fetchUris",
                        returns: Promise.resolve((0, itemMockFactory_1.getItems)()),
                    },
                ], sandbox);
            },
            setupForReturningFalseWhenUriDoesNotExist: () => {
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: dataService_1.dataService,
                        method: "fetchUris",
                        returns: Promise.resolve((0, itemMockFactory_1.getItems)()),
                    },
                ], sandbox);
            },
        },
        fetchConfig: {
            setupForFetchingItemsFilter: () => {
                const configuration = (0, mockFactory_1.getConfiguration)().searchEverywhere;
                const expected = configuration.itemsFilter;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchItemsFilter",
                        returns: expected,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "fetchConfig",
                    },
                ], sandbox);
                return expected;
            },
            setupForInvokingPatternProviderFetchConfig: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "fetchConfig",
                    },
                    {
                        object: config,
                        method: "fetchItemsFilter",
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=dataService.testSetup.js.map