"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const config = require("../../src/config");
const patternProvider_1 = require("../../src/patternProvider");
const types_1 = require("../../src/types");
const itemMockFactory_1 = require("../util/itemMockFactory");
const stubFactory_1 = require("../util/stubFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    return {
        afterEach: () => {
            sandbox.restore();
        },
        getIncludePatterns: {
            setupForReturningIncludePatterns: () => {
                const patterns = "**/*.{js,ts}";
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getIncludePatterns",
                        returns: patterns,
                    },
                ], sandbox);
                return patterns;
            },
        },
        getExcludePatterns: {
            setupForSearchEverywhereExcludeMode: () => {
                const patterns = ["**/.history/**", "**/.vscode/**"];
                const expected = `{${patterns.join(",")}}`;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludeMode",
                        returns: types_1.ExcludeMode.SearchEverywhere,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExtensionExcludePatterns",
                        returns: patterns,
                    },
                ], sandbox);
                return expected;
            },
            setupForFilesAndSearchExcludeMode: () => {
                const patterns = ["**/.history/**", "**/.vscode/**"];
                const expected = `{${patterns.join(",")}}`;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludeMode",
                        returns: types_1.ExcludeMode.FilesAndSearch,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getFilesAndSearchExcludePatterns",
                        returns: patterns,
                    },
                ], sandbox);
                return expected;
            },
            setupForGitignoreExcludeMode: () => {
                const patterns = ["**/.history/**", "**/.vscode/**"];
                const expected = `{${patterns.join(",")}}`;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludeMode",
                        returns: types_1.ExcludeMode.Gitignore,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getGitignoreExcludePatterns",
                        returns: patterns,
                    },
                ], sandbox);
                return expected;
            },
            setupForMultiplePatternsWithCurlyBraces: () => {
                const patterns = ["**/.history/**", "**/.vscode/**"];
                const expected = `{${patterns.join(",")}}`;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludeMode",
                        returns: types_1.ExcludeMode.SearchEverywhere,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExtensionExcludePatterns",
                        returns: patterns,
                    },
                ], sandbox);
                return expected;
            },
            setupForSinglePatternWithoutCurlyBraces: () => {
                const patterns = ["**/.history/**"];
                const expected = "**/.history/**";
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludeMode",
                        returns: types_1.ExcludeMode.SearchEverywhere,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExtensionExcludePatterns",
                        returns: patterns,
                    },
                ], sandbox);
                return expected;
            },
            setupForEmptyPatternsArray: () => {
                const expected = "";
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExcludeMode",
                        returns: types_1.ExcludeMode.SearchEverywhere,
                    },
                    {
                        object: patternProvider_1.patternProvider,
                        method: "getExtensionExcludePatterns",
                        returns: [],
                    },
                ], sandbox);
                return expected;
            },
        },
        fetchConfig: {
            setupForFetchingExcludeMode: () => {
                const expected = types_1.ExcludeMode.Gitignore;
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchInclude",
                    },
                    {
                        object: config,
                        method: "fetchExclude",
                    },
                    {
                        object: config,
                        method: "fetchFilesAndSearchExclude",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: [],
                    },
                ], sandbox);
                return expected;
            },
            setupForFetchingIncludePatterns: () => {
                const expected = "**/*.{js,ts}";
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                    {
                        object: config,
                        method: "fetchInclude",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchExclude",
                    },
                    {
                        object: config,
                        method: "fetchFilesAndSearchExclude",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: [],
                    },
                ], sandbox);
                return expected;
            },
            setupForFetchingExtensionExcludePatterns: () => {
                const expected = ["**/.history/**", "**/.vscode/**"];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                    {
                        object: config,
                        method: "fetchInclude",
                    },
                    {
                        object: config,
                        method: "fetchExclude",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchFilesAndSearchExclude",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: [],
                    },
                ], sandbox);
                return expected;
            },
            setupForFetchingFilesAndSearchExcludePatterns: () => {
                const expected = ["**/.history/**", "**/.vscode/**"];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                    {
                        object: config,
                        method: "fetchInclude",
                    },
                    {
                        object: config,
                        method: "fetchExclude",
                    },
                    {
                        object: config,
                        method: "fetchFilesAndSearchExclude",
                        returns: expected,
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: [],
                    },
                ], sandbox);
                return expected;
            },
            setupForFetchingGitignoreExcludePatternsWhenFileFound: () => {
                const textDocument = (0, stubFactory_1.getTextDocumentStub)();
                const expected = ["dist", "out", ".vscode", ".history"];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                    {
                        object: config,
                        method: "fetchInclude",
                    },
                    {
                        object: config,
                        method: "fetchExclude",
                    },
                    {
                        object: config,
                        method: "fetchFilesAndSearchExclude",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: (0, itemMockFactory_1.getItems)(1),
                    },
                    {
                        object: vscode.workspace,
                        method: "openTextDocument",
                        returns: textDocument,
                    },
                    {
                        object: textDocument,
                        method: "getText",
                        returns: "# Project\ndist\nout\n\n# IDE config files\n\n.vscode\n.history\n\n",
                    },
                ], sandbox);
                return expected;
            },
            setupForFallingBackToExtensionSettingsWhenGitignoreNotFound: () => {
                const expected = ["**/.history/**", "**/.vscode/**"];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                    {
                        object: config,
                        method: "fetchInclude",
                    },
                    {
                        object: config,
                        method: "fetchExclude",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchFilesAndSearchExclude",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: [],
                    },
                ], sandbox);
                return expected;
            },
            setupForFallingBackToExtensionSettingsWhenGitignoreEmpty: () => {
                const textDocument = (0, stubFactory_1.getTextDocumentStub)();
                const expected = ["**/.history/**", "**/.vscode/**"];
                (0, stubHelpers_1.stubMultiple)([
                    {
                        object: config,
                        method: "fetchExcludeMode",
                    },
                    {
                        object: config,
                        method: "fetchInclude",
                    },
                    {
                        object: config,
                        method: "fetchExclude",
                        returns: expected,
                    },
                    {
                        object: config,
                        method: "fetchFilesAndSearchExclude",
                    },
                    {
                        object: vscode.workspace,
                        method: "findFiles",
                        returns: (0, itemMockFactory_1.getItems)(1),
                    },
                    {
                        object: vscode.workspace,
                        method: "openTextDocument",
                        returns: textDocument,
                    },
                    {
                        object: textDocument,
                        method: "getText",
                        returns: "",
                    },
                ], sandbox);
                return expected;
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=patternProvider.testSetup.js.map