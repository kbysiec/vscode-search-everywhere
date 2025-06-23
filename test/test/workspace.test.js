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
const workspace_1 = require("../../src/workspace");
const workspace_testSetup_1 = require("../testSetup/workspace.testSetup");
const eventMockFactory_1 = require("../util/eventMockFactory");
const mockFactory_1 = require("../util/mockFactory");
const stubFactory_1 = require("../util/stubFactory");
describe("Workspace", () => {
    let setups;
    before(() => {
        setups = (0, workspace_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("init", () => {
        it("should utils.setWorkspaceFoldersCommonPath method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [setWorkspaceFoldersCommonPathStub] = setups.init.setupForInvokingSetWorkspaceFoldersCommonPath();
            yield workspace_1.workspace.init();
            chai_1.assert.equal(setWorkspaceFoldersCommonPathStub.calledOnce, true);
        }));
        it("should dataService.fetchConfig method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [fetchConfigStub] = setups.init.setupForInvokingDataServiceFetchConfig();
            yield workspace_1.workspace.init();
            chai_1.assert.equal(fetchConfigStub.calledOnce, true);
        }));
        it("should dataConverter.fetchConfig method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [fetchConfigStub] = setups.init.setupForInvokingDataConverterFetchConfig();
            yield workspace_1.workspace.init();
            chai_1.assert.equal(fetchConfigStub.calledOnce, true);
        }));
    });
    describe("index", () => {
        it("should common.index method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [indexStub] = setups.index.setupForInvokingCommonIndexMethod();
            yield workspace_1.workspace.index(types_1.ActionTrigger.Search);
            chai_1.assert.equal(indexStub.calledOnce, true);
        }));
        it("should cache.clear method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [clearStub] = setups.index.setupForInvokingCacheClearMethod();
            yield workspace_1.workspace.index(types_1.ActionTrigger.Search);
            chai_1.assert.equal(clearStub.calledOnce, true);
        }));
    });
    describe("removeDataForUnsavedUris", () => {
        it("should common.registerAction be invoked twice for each unsaved uri", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.removeDataForUnsavedUris.setupForInvokingRegisterActionTwiceForEachUnsavedUri();
            yield workspace_1.workspace.removeDataForUnsavedUris();
            chai_1.assert.equal(registerActionStub.callCount, 4);
        }));
        it("should clear array of unsaved uris", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.removeDataForUnsavedUris.setupForClearingArrayOfUnsavedUris();
            yield workspace_1.workspace.removeDataForUnsavedUris();
            chai_1.assert.equal(workspace_1.workspace.getNotSavedUris().size, 0);
        }));
    });
    describe("registerEventListeners", () => {
        it("should register workspace event listeners", () => {
            const [onDidChangeConfigurationStub, onDidChangeWorkspaceFoldersStub, onDidChangeTextDocumentStub, onDidSaveTextDocumentStub, onWillProcessingStub, onDidProcessingStub, onWillExecuteActionStub,] = setups.registerEventListeners.setupForRegisteringWorkspaceEventListeners();
            workspace_1.workspace.registerEventListeners();
            chai_1.assert.equal(onDidChangeConfigurationStub.calledOnce, true);
            chai_1.assert.equal(onDidChangeWorkspaceFoldersStub.calledOnce, true);
            chai_1.assert.equal(onDidChangeTextDocumentStub.calledOnce, true);
            chai_1.assert.equal(onDidSaveTextDocumentStub.calledOnce, true);
            chai_1.assert.equal(onWillProcessingStub.calledOnce, true);
            chai_1.assert.equal(onDidProcessingStub.calledOnce, true);
            chai_1.assert.equal(onWillExecuteActionStub.calledOnce, true);
        });
    });
    describe("getData", () => {
        it("should common.getData method be invoked", () => {
            const [getDataStub] = setups.getData.setupForInvokingCommonGetDataMethod();
            workspace_1.workspace.getData();
            chai_1.assert.equal(getDataStub.calledOnce, true);
        });
    });
    describe("shouldReindexOnConfigurationChange", () => {
        it("should return true if extension configuration has changed and is not excluded from refreshing", () => {
            setups.shouldReindexOnConfigurationChange.setupForReturningTrueWhenConfigurationChangedAndNotExcluded();
            chai_1.assert.equal(workspace_1.workspace.shouldReindexOnConfigurationChange((0, eventMockFactory_1.getConfigurationChangeEvent)(true, true, false)), true);
        });
        it("should return false if extension configuration has changed but is excluded from refreshing", () => {
            setups.shouldReindexOnConfigurationChange.setupForReturningFalseWhenConfigurationChangedButExcluded();
            chai_1.assert.equal(workspace_1.workspace.shouldReindexOnConfigurationChange((0, eventMockFactory_1.getConfigurationChangeEvent)(false)), false);
        });
        it("should return false if extension configuration has not changed", () => {
            setups.shouldReindexOnConfigurationChange.setupForReturningFalseWhenConfigurationNotChanged();
            chai_1.assert.equal(workspace_1.workspace.shouldReindexOnConfigurationChange((0, eventMockFactory_1.getConfigurationChangeEvent)(false)), false);
        });
        it("should return true if exclude mode is set to 'files and search', configuration has changed and files.exclude has changed", () => {
            setups.shouldReindexOnConfigurationChange.setupForReturningTrueWhenFilesAndSearchModeAndFilesExcludeChanged();
            chai_1.assert.equal(workspace_1.workspace.shouldReindexOnConfigurationChange((0, eventMockFactory_1.getConfigurationChangeEvent)(false, false, true, types_1.ExcludeMode.FilesAndSearch, true)), true);
        });
        it("should return true if exclude mode is set to 'files and search', configuration has changed and search.exclude has changed", () => {
            setups.shouldReindexOnConfigurationChange.setupForReturningTrueWhenFilesAndSearchModeAndSearchExcludeChanged();
            chai_1.assert.equal(workspace_1.workspace.shouldReindexOnConfigurationChange((0, eventMockFactory_1.getConfigurationChangeEvent)(false, false, true, types_1.ExcludeMode.FilesAndSearch, false, true)), true);
        });
    });
    describe("handleDidChangeConfiguration", () => {
        it("should index method be invoked which register rebuild action if extension configuration has changed", () => __awaiter(void 0, void 0, void 0, function* () {
            const [indexStub] = setups.handleDidChangeConfiguration.setupForInvokingIndexWhenExtensionConfigurationChanged();
            yield workspace_1.workspace.handleDidChangeConfiguration((0, eventMockFactory_1.getConfigurationChangeEvent)(true));
            chai_1.assert.equal(indexStub.calledOnce, true);
        }));
        it("should onDidDebounceConfigToggle event be emitted if isDebounceConfigurationToggled is true", () => __awaiter(void 0, void 0, void 0, function* () {
            const eventEmitter = setups.handleDidChangeConfiguration.setupForEmittingDebounceConfigToggleEvent();
            yield workspace_1.workspace.handleDidChangeConfiguration((0, eventMockFactory_1.getConfigurationChangeEvent)(true));
            chai_1.assert.equal(eventEmitter.fire.calledOnce, true);
        }));
        it("should onDidSortingConfigToggle event be emitted if isSortingConfigurationToggled is true", () => __awaiter(void 0, void 0, void 0, function* () {
            const eventEmitter = setups.handleDidChangeConfiguration.setupForEmittingSortingConfigToggleEvent();
            yield workspace_1.workspace.handleDidChangeConfiguration((0, eventMockFactory_1.getConfigurationChangeEvent)(true));
            chai_1.assert.equal(eventEmitter.fire.calledOnce, true);
        }));
        it("should do nothing if extension configuration has not changed", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub, onDidDebounceConfigToggleEventEmitterStub] = setups.handleDidChangeConfiguration.setupForDoingNothingWhenExtensionConfigurationNotChanged();
            yield workspace_1.workspace.handleDidChangeConfiguration((0, eventMockFactory_1.getConfigurationChangeEvent)(false));
            chai_1.assert.equal(registerActionStub.calledOnce, false);
            chai_1.assert.equal(onDidDebounceConfigToggleEventEmitterStub.calledOnce, false);
        }));
        it("should cache.clearConfig method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [clearConfigStub] = setups.handleDidChangeConfiguration.setupForInvokingCacheClearConfigMethod();
            yield workspace_1.workspace.handleDidChangeConfiguration((0, eventMockFactory_1.getConfigurationChangeEvent)(true));
            chai_1.assert.equal(clearConfigStub.calledOnce, true);
        }));
    });
    describe("handleDidChangeWorkspaceFolders", () => {
        it("should index method be invoked which register rebuild action if amount of opened folders in workspace has changed", () => __awaiter(void 0, void 0, void 0, function* () {
            const [indexStub] = setups.handleDidChangeWorkspaceFolders.setupForInvokingIndexWhenWorkspaceFoldersChanged();
            yield workspace_1.workspace.handleDidChangeWorkspaceFolders((0, eventMockFactory_1.getWorkspaceFoldersChangeEvent)(true));
            chai_1.assert.equal(indexStub.calledOnce, true);
        }));
        it("should do nothing if extension configuration has not changed", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidChangeWorkspaceFolders.setupForDoingNothingWhenWorkspaceFoldersNotChanged();
            yield workspace_1.workspace.handleDidChangeWorkspaceFolders((0, eventMockFactory_1.getWorkspaceFoldersChangeEvent)(false));
            chai_1.assert.equal(registerActionStub.calledOnce, false);
        }));
    });
    describe("handleDidChangeTextDocument", () => {
        it("should registerAction method be invoked which register update action if text document has changed and exists in workspace", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidChangeTextDocument.setupForRegisteringUpdateActionWhenDocumentChangedAndExistsInWorkspace();
            const textDocumentChangeEvent = (0, eventMockFactory_1.getTextDocumentChangeEvent)(true);
            yield workspace_1.workspace.handleDidChangeTextDocument(textDocumentChangeEvent);
            chai_1.assert.equal(registerActionStub.calledTwice, true);
            chai_1.assert.equal(registerActionStub.args[0][0], types_1.ActionType.Remove);
            chai_1.assert.equal(registerActionStub.args[1][0], types_1.ActionType.Update);
        }));
        it("should do nothing if text document does not exist in workspace", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidChangeTextDocument.setupForDoingNothingWhenDocumentNotExistInWorkspace();
            const textDocumentChangeEvent = (0, eventMockFactory_1.getTextDocumentChangeEvent)(true);
            yield workspace_1.workspace.handleDidChangeTextDocument(textDocumentChangeEvent);
            chai_1.assert.equal(registerActionStub.calledOnce, false);
        }));
        it("should do nothing if text document has not changed", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidChangeTextDocument.setupForDoingNothingWhenDocumentNotChanged();
            const textDocumentChangeEvent = yield (0, eventMockFactory_1.getTextDocumentChangeEvent)();
            yield workspace_1.workspace.handleDidChangeTextDocument(textDocumentChangeEvent);
            chai_1.assert.equal(registerActionStub.calledOnce, false);
        }));
        it("should add uri to not saved array if text document has changed and exists in workspace", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.handleDidChangeTextDocument.setupForAddingUriToNotSavedArrayWhenDocumentChangedAndExistsInWorkspace();
            const textDocumentChangeEvent = (0, eventMockFactory_1.getTextDocumentChangeEvent)(true);
            yield workspace_1.workspace.handleDidChangeTextDocument(textDocumentChangeEvent);
            chai_1.assert.equal(workspace_1.workspace.getNotSavedUris().size, 1);
        }));
    });
    describe("handleDidRenameFiles", () => {
        it("should registerAction method be invoked twice to register remove and update actions for each renamed or moved file", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidRenameFiles.setupForRegisteringRemoveAndUpdateActionsForRenamedFiles();
            yield workspace_1.workspace.handleDidRenameFiles((0, eventMockFactory_1.getFileRenameEvent)());
            chai_1.assert.equal(registerActionStub.callCount, 4);
            chai_1.assert.equal(registerActionStub.args[0][0], types_1.ActionType.Update);
            chai_1.assert.equal(registerActionStub.args[1][0], types_1.ActionType.Remove);
            chai_1.assert.equal(registerActionStub.args[2][0], types_1.ActionType.Update);
            chai_1.assert.equal(registerActionStub.args[3][0], types_1.ActionType.Remove);
        }));
        it("should registerAction method be invoked once to register update action for renamed or moved directory", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidRenameFiles.setupForRegisteringUpdateActionForRenamedDirectory();
            yield workspace_1.workspace.handleDidRenameFiles((0, eventMockFactory_1.getFileRenameEvent)(true));
            chai_1.assert.equal(registerActionStub.calledOnce, true);
            chai_1.assert.equal(registerActionStub.args[0][0], types_1.ActionType.Update);
        }));
    });
    describe("handleDidCreateFiles", () => {
        it("should registerAction method be invoked which register update action when file is created", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidCreateFiles.setupForRegisteringUpdateActionWhenFileCreated();
            yield workspace_1.workspace.handleDidCreateFiles((0, eventMockFactory_1.getFileCreateEvent)());
            chai_1.assert.equal(registerActionStub.calledOnce, true);
            chai_1.assert.equal(registerActionStub.args[0][0], types_1.ActionType.Update);
        }));
        it("should registerAction method be invoked which register update action when directory is created", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidCreateFiles.setupForRegisteringUpdateActionWhenDirectoryCreated();
            yield workspace_1.workspace.handleDidCreateFiles((0, eventMockFactory_1.getFileCreateEvent)());
            chai_1.assert.equal(registerActionStub.calledOnce, true);
            chai_1.assert.equal(registerActionStub.args[0][0], types_1.ActionType.Update);
        }));
        it("should add uri to not saved array", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.handleDidCreateFiles.setupForAddingUriToNotSavedArray();
            yield workspace_1.workspace.handleDidCreateFiles((0, eventMockFactory_1.getFileCreateEvent)());
            chai_1.assert.equal(workspace_1.workspace.getNotSavedUris().size, 1);
        }));
    });
    describe("handleDidDeleteFiles", () => {
        it("should registerAction method be invoked which register remove action when file is deleted", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidDeleteFiles.setupForRegisteringRemoveActionWhenFileDeleted();
            yield workspace_1.workspace.handleDidDeleteFiles((0, eventMockFactory_1.getFileDeleteEvent)());
            chai_1.assert.equal(registerActionStub.calledOnce, true);
            chai_1.assert.equal(registerActionStub.args[0][0], types_1.ActionType.Remove);
        }));
        it("should registerAction method be invoked which register remove action when directory is deleted", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerActionStub] = setups.handleDidDeleteFiles.setupForRegisteringRemoveActionWhenDirectoryDeleted();
            yield workspace_1.workspace.handleDidDeleteFiles((0, eventMockFactory_1.getFileDeleteEvent)());
            chai_1.assert.equal(registerActionStub.calledOnce, true);
            chai_1.assert.equal(registerActionStub.args[0][0], types_1.ActionType.Remove);
        }));
    });
    describe("handleDidSaveTextDocument", () => {
        it("should remove uri from not saved array", () => __awaiter(void 0, void 0, void 0, function* () {
            setups.handleDidSaveTextDocument.setupForRemovingUriFromNotSavedArray();
            yield workspace_1.workspace.handleDidSaveTextDocument((0, stubFactory_1.getTextDocumentStub)(undefined, "/test/path2"));
            chai_1.assert.equal(workspace_1.workspace.getNotSavedUris().size, 2);
        }));
    });
    describe("handleWillActionProcessorProcessing", () => {
        it("should onWillProcessing event be emitted", () => {
            const eventEmitter = setups.handleWillActionProcessorProcessing.setupForEmittingOnWillProcessingEvent();
            workspace_1.workspace.handleWillActionProcessorProcessing();
            chai_1.assert.equal(eventEmitter.fire.calledOnce, true);
        });
    });
    describe("handleDidActionProcessorProcessing", () => {
        it("should onDidProcessing event be emitted", () => {
            const eventEmitter = setups.handleDidActionProcessorProcessing.setupForEmittingOnDidProcessingEvent();
            workspace_1.workspace.handleDidActionProcessorProcessing();
            chai_1.assert.equal(eventEmitter.fire.calledOnce, true);
        });
    });
    describe("handleWillActionProcessorExecuteAction", () => {
        it("should onWillExecuteAction event be emitted", () => {
            const eventEmitter = setups.handleWillActionProcessorExecuteAction.setupForEmittingOnWillExecuteActionEvent();
            workspace_1.workspace.handleWillActionProcessorExecuteAction((0, mockFactory_1.getAction)());
            chai_1.assert.equal(eventEmitter.fire.calledOnce, true);
        });
    });
});
//# sourceMappingURL=workspace.test.js.map