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
const patternProvider_1 = require("../../src/patternProvider");
const patternProvider_testSetup_1 = require("../testSetup/patternProvider.testSetup");
describe("PatternProvider", () => {
    let setups;
    before(() => {
        setups = (0, patternProvider_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("getIncludePatterns", () => {
        it("should return include patterns", () => {
            const includePatterns = setups.getIncludePatterns.setupForReturningIncludePatterns();
            chai_1.assert.equal(patternProvider_1.patternProvider.getIncludePatterns(), includePatterns);
        });
    });
    describe("getExcludePatterns", () => {
        it("should return exclude patterns from extension settings where exclude mode is set to 'search everywhere'", () => __awaiter(void 0, void 0, void 0, function* () {
            const excludePatterns = setups.getExcludePatterns.setupForSearchEverywhereExcludeMode();
            chai_1.assert.equal(yield patternProvider_1.patternProvider.getExcludePatterns(), excludePatterns);
        }));
        it("should return exclude patterns from files and search settings where exclude mode is set to 'files and search'", () => __awaiter(void 0, void 0, void 0, function* () {
            const excludePatterns = setups.getExcludePatterns.setupForFilesAndSearchExcludeMode();
            chai_1.assert.equal(yield patternProvider_1.patternProvider.getExcludePatterns(), excludePatterns);
        }));
        it("should return exclude patterns from gitignore file where exclude mode is set to 'gitignore'", () => __awaiter(void 0, void 0, void 0, function* () {
            const excludePatterns = setups.getExcludePatterns.setupForGitignoreExcludeMode();
            chai_1.assert.equal(yield patternProvider_1.patternProvider.getExcludePatterns(), excludePatterns);
        }));
        it("should return exclude patterns separated with comma and surrounded with curly braces if there are two or more patterns", () => __awaiter(void 0, void 0, void 0, function* () {
            const excludePatterns = setups.getExcludePatterns.setupForMultiplePatternsWithCurlyBraces();
            chai_1.assert.equal(yield patternProvider_1.patternProvider.getExcludePatterns(), excludePatterns);
        }));
        it("should return exclude pattern without comma and surrounding of curly braces if there is only one pattern", () => __awaiter(void 0, void 0, void 0, function* () {
            const excludePatterns = setups.getExcludePatterns.setupForSinglePatternWithoutCurlyBraces();
            chai_1.assert.equal(yield patternProvider_1.patternProvider.getExcludePatterns(), excludePatterns);
        }));
        it("should return empty string if there is not any pattern", () => __awaiter(void 0, void 0, void 0, function* () {
            const excludePatterns = setups.getExcludePatterns.setupForEmptyPatternsArray();
            chai_1.assert.equal(yield patternProvider_1.patternProvider.getExcludePatterns(), excludePatterns);
        }));
    });
    describe("fetchConfig", () => {
        it("should fetch exclude mode", () => __awaiter(void 0, void 0, void 0, function* () {
            const excludeMode = setups.fetchConfig.setupForFetchingExcludeMode();
            yield patternProvider_1.patternProvider.fetchConfig();
            chai_1.assert.equal(patternProvider_1.patternProvider.getExcludeMode(), excludeMode);
        }));
        it("should fetch include patterns", () => __awaiter(void 0, void 0, void 0, function* () {
            const includePatterns = setups.fetchConfig.setupForFetchingIncludePatterns();
            yield patternProvider_1.patternProvider.fetchConfig();
            chai_1.assert.equal(patternProvider_1.patternProvider.getIncludePatterns(), includePatterns);
        }));
        it("should fetch extension exclude patterns", () => __awaiter(void 0, void 0, void 0, function* () {
            const extensionExcludePatterns = setups.fetchConfig.setupForFetchingExtensionExcludePatterns();
            yield patternProvider_1.patternProvider.fetchConfig();
            chai_1.assert.equal(patternProvider_1.patternProvider.getExtensionExcludePatterns(), extensionExcludePatterns);
        }));
        it("should fetch files and search exclude patterns", () => __awaiter(void 0, void 0, void 0, function* () {
            const filesAndSearchExcludePatterns = setups.fetchConfig.setupForFetchingFilesAndSearchExcludePatterns();
            yield patternProvider_1.patternProvider.fetchConfig();
            chai_1.assert.equal(patternProvider_1.patternProvider.getFilesAndSearchExcludePatterns(), filesAndSearchExcludePatterns);
        }));
        it("should fetch gitignore exclude patterns if file is found", () => __awaiter(void 0, void 0, void 0, function* () {
            const gitignoreExcludePatterns = setups.fetchConfig.setupForFetchingGitignoreExcludePatternsWhenFileFound();
            yield patternProvider_1.patternProvider.fetchConfig();
            chai_1.assert.deepEqual(patternProvider_1.patternProvider.getGitignoreExcludePatterns(), gitignoreExcludePatterns);
        }));
        it("should set exclude patterns from extension settings if gitignore file is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const gitignoreExcludePatterns = setups.fetchConfig.setupForFallingBackToExtensionSettingsWhenGitignoreNotFound();
            yield patternProvider_1.patternProvider.fetchConfig();
            chai_1.assert.deepEqual(patternProvider_1.patternProvider.getGitignoreExcludePatterns(), gitignoreExcludePatterns);
        }));
        it("should set exclude patterns from extension settings if gitignore file is found but is empty", () => __awaiter(void 0, void 0, void 0, function* () {
            const gitignoreExcludePatterns = setups.fetchConfig.setupForFallingBackToExtensionSettingsWhenGitignoreEmpty();
            yield patternProvider_1.patternProvider.fetchConfig();
            chai_1.assert.deepEqual(patternProvider_1.patternProvider.getGitignoreExcludePatterns(), gitignoreExcludePatterns);
        }));
    });
});
//# sourceMappingURL=patternProvider.test.js.map