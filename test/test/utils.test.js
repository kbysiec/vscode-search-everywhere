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
const sinon = require("sinon");
const types_1 = require("../../src/types");
const utils_1 = require("../../src/utils");
const utils_testSetup_1 = require("../testSetup/utils.testSetup");
const eventMockFactory_1 = require("../util/eventMockFactory");
const itemMockFactory_1 = require("../util/itemMockFactory");
const mockFactory_1 = require("../util/mockFactory");
const qpItemMockFactory_1 = require("../util/qpItemMockFactory");
describe("Utils", () => {
    let setups;
    before(() => {
        setups = (0, utils_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("hasWorkspaceAnyFolder", () => {
        it("should return true if workspace contains at least one folder", () => {
            setups.hasWorkspaceAnyFolder.setupForReturningTrueWhenWorkspaceHasFolders();
            chai_1.assert.equal(utils_1.utils.hasWorkspaceAnyFolder(), true);
        });
        it("should return false if workspace does not contain any folder", () => {
            setups.hasWorkspaceAnyFolder.setupForReturningFalseWhenWorkspaceHasNoFolders();
            chai_1.assert.equal(utils_1.utils.hasWorkspaceAnyFolder(), false);
        });
    });
    describe("hasWorkspaceMoreThanOneFolder", () => {
        it("should return true if workspace contains more than one folder", () => {
            setups.hasWorkspaceMoreThanOneFolder.setupForReturningTrueWhenWorkspaceHasMultipleFolders();
            chai_1.assert.equal(utils_1.utils.hasWorkspaceMoreThanOneFolder(), true);
        });
        it("should return false if workspace contains either one folder or any", () => {
            setups.hasWorkspaceMoreThanOneFolder.setupForReturningFalseWhenWorkspaceHasOneOrNoFolders();
            chai_1.assert.equal(utils_1.utils.hasWorkspaceMoreThanOneFolder(), false);
        });
    });
    describe("hasWorkspaceChanged", () => {
        it("should return true if amount of opened folders in workspace has changed", () => {
            chai_1.assert.equal(utils_1.utils.hasWorkspaceChanged((0, eventMockFactory_1.getWorkspaceFoldersChangeEvent)(true)), true);
        });
        it("should return false if amount of opened folders in workspace has not changed", () => {
            chai_1.assert.equal(utils_1.utils.hasWorkspaceChanged((0, eventMockFactory_1.getWorkspaceFoldersChangeEvent)(false)), false);
        });
    });
    describe("isDebounceConfigurationToggled", () => {
        it("should return true if extension configuration related to debounce setting has changed", () => {
            chai_1.assert.equal(utils_1.utils.isDebounceConfigurationToggled((0, eventMockFactory_1.getConfigurationChangeEvent)(true, false)), true);
        });
        it("should return false if extension configuration related to debounce setting has not changed", () => {
            chai_1.assert.equal(utils_1.utils.isDebounceConfigurationToggled((0, eventMockFactory_1.getConfigurationChangeEvent)(false)), false);
        });
    });
    describe("isSortingConfigurationToggled", () => {
        it("should return true if extension configuration related to sorting setting has changed", () => {
            chai_1.assert.equal(utils_1.utils.isSortingConfigurationToggled((0, eventMockFactory_1.getConfigurationChangeEvent)(true, false)), true);
        });
        it("should return false if extension configuration related to debounce setting has not changed", () => {
            chai_1.assert.equal(utils_1.utils.isSortingConfigurationToggled((0, eventMockFactory_1.getConfigurationChangeEvent)(false)), false);
        });
    });
    describe("printNoFolderOpenedMessage", () => {
        it("should display notification", () => __awaiter(void 0, void 0, void 0, function* () {
            const [showInformationMessageStub] = setups.printNoFolderOpenedMessage.setupForDisplayingNotification();
            utils_1.utils.printNoFolderOpenedMessage();
            chai_1.assert.equal(showInformationMessageStub.calledOnce, true);
        }));
    });
    describe("printErrorMessage", () => {
        it("should display notification", () => __awaiter(void 0, void 0, void 0, function* () {
            const [showInformationMessageStub] = setups.printErrorMessage.setupForDisplayingNotification();
            utils_1.utils.printErrorMessage(new Error("test error message"));
            chai_1.assert.equal(showInformationMessageStub.calledOnce, true);
        }));
    });
    describe("printStatsMessage", () => {
        it("should display notification with scan stats", () => __awaiter(void 0, void 0, void 0, function* () {
            const [showInformationMessageStub] = setups.printStatsMessage.setupForDisplayingStatsNotification();
            const indexStats = (0, mockFactory_1.getIndexStats)();
            utils_1.utils.printStatsMessage(indexStats);
            const calledWith = showInformationMessageStub.args[0][0].replaceAll(" ", "");
            const expected = `Elapsed time: ${indexStats.ElapsedTimeInSeconds}s
      Scanned files: ${indexStats.ScannedUrisCount}
      Indexed items: ${indexStats.IndexedItemsCount}`.replaceAll(" ", "");
            chai_1.assert.equal(calledWith, expected);
        }));
    });
    describe("createWorkspaceData", () => {
        it("should create workspaceData object", () => {
            chai_1.assert.deepEqual(utils_1.utils.createWorkspaceData(), (0, mockFactory_1.getWorkspaceData)());
        });
    });
    describe("clearWorkspaceData", () => {
        it("should clear workspaceData object", () => {
            const workspaceData = setups.clearWorkspaceData.setupForClearingWorkspaceDataObject();
            utils_1.utils.clearWorkspaceData(workspaceData);
            chai_1.assert.equal(workspaceData.count, 0);
            chai_1.assert.equal(workspaceData.items.size, 0);
        });
    });
    describe("getSplitter", () => {
        it("should return splitter string", () => {
            chai_1.assert.equal(utils_1.utils.getSplitter(), "§&§");
        });
    });
    describe("getUrisForDirectoryPathUpdate", () => {
        it("should return uris containing renamed directory name and file symbol kind", () => __awaiter(void 0, void 0, void 0, function* () {
            const qpItems = (0, qpItemMockFactory_1.getQpItems)();
            qpItems[1] = (0, qpItemMockFactory_1.getQpItem)("./test/fake-files/", 2);
            chai_1.assert.deepEqual(yield utils_1.utils.getUrisForDirectoryPathUpdate(qpItems, (0, itemMockFactory_1.getDirectory)("./fake/"), 0), (0, itemMockFactory_1.getItems)(1, undefined, undefined, true));
        }));
    });
    describe("sleep", () => {
        it("should be fulfilled", () => __awaiter(void 0, void 0, void 0, function* () {
            const clock = sinon.useFakeTimers();
            let fulfilled = false;
            const sleepPromise = utils_1.utils.sleep(1000);
            sleepPromise.then(() => {
                fulfilled = true;
            });
            // https://stackoverflow.com/questions/51526312/testing-setinterval-with-sinon-faketimers-not-working
            yield Promise.resolve();
            clock.tick(999);
            (0, chai_1.expect)(fulfilled).to.be.false;
            clock.tick(2);
            yield Promise.resolve();
            (0, chai_1.expect)(fulfilled).to.be.true;
            clock.restore();
        }));
    });
    describe("sleepAndExecute", () => {
        it("should given fn be invoked after give", () => __awaiter(void 0, void 0, void 0, function* () {
            const stub = setups.sleepAndExecute.setupForInvokingFunctionAfterDelay();
            const clock = sinon.useFakeTimers();
            let fulfilled = false;
            utils_1.utils.sleepAndExecute(1000, stub);
            // https://stackoverflow.com/questions/51526312/testing-setinterval-with-sinon-faketimers-not-working
            yield Promise.resolve();
            clock.tick(999);
            chai_1.assert.equal(stub.calledOnce, false);
            clock.tick(2);
            chai_1.assert.equal(stub.calledOnce, true);
            clock.restore();
        }));
    });
    describe("countWordInstances", () => {
        it("should count word instances in given text", () => {
            const instances = utils_1.utils.countWordInstances("test string with xxxtestxxx value", "test");
            chai_1.assert.equal(instances, 2);
        });
    });
    describe("getNthIndex", () => {
        it("should return index of second occurrence of word in given text", () => {
            const index = utils_1.utils.getNthIndex("test string with xxxtestxxx value", "test", 2);
            chai_1.assert.equal(index, 20);
        });
        it("should return -1 if word does not occur in given text", () => {
            const index = utils_1.utils.getNthIndex("string with value", "test", 2);
            chai_1.assert.equal(index, -1);
        });
    });
    describe("getLastFromArray", () => {
        it("should return last element from array fulfilling given predicate", () => {
            const lastAction = (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 3", 3);
            const actual = utils_1.utils.getLastFromArray([
                (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 1", 1),
                (0, mockFactory_1.getAction)(types_1.ActionType.Remove, "test action 2", 2),
                lastAction,
            ], (action) => action.type === types_1.ActionType.Rebuild);
            chai_1.assert.deepEqual(actual, lastAction);
        });
        it("should return undefined if given predicated is not fulfilled", () => {
            const last = utils_1.utils.getLastFromArray([
                (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 1", 1),
                (0, mockFactory_1.getAction)(types_1.ActionType.Remove, "test action 2", 2),
                (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 3", 3),
            ], (action) => action.type === types_1.ActionType.Update);
            chai_1.assert.equal(last, undefined);
        });
    });
    describe("groupBy", () => {
        it("should return map containing grouped array", () => {
            const actions = [
                (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 1", 1),
                (0, mockFactory_1.getAction)(types_1.ActionType.Remove, "test action 2", 2),
                (0, mockFactory_1.getAction)(types_1.ActionType.Rebuild, "test action 3", 3),
            ];
            const actual = utils_1.utils.groupBy(actions, (action) => action.type);
            const expected = new Map();
            expected.set(types_1.ActionType.Rebuild, [actions[0], actions[2]]);
            expected.set(types_1.ActionType.Remove, [actions[1]]);
            chai_1.assert.deepEqual(actual, expected);
        });
    });
    describe("getNameFromUri", () => { });
    describe("updateQpItemsWithNewDirectoryPath", () => {
        it("should update qpItems with new directory path", () => {
            setups.updateQpItemsWithNewDirectoryPath.setupForUpdatingItemsWithNewDirectoryPath();
            chai_1.assert.deepEqual(utils_1.utils.updateQpItemsWithNewDirectoryPath((0, qpItemMockFactory_1.getQpItems)(), (0, itemMockFactory_1.getDirectory)("./fake/"), (0, itemMockFactory_1.getDirectory)("./fake-new/")), (0, qpItemMockFactory_1.getQpItems)(undefined, "./fake-new/"));
        });
        it("should return unchanged qpItems if item does not contain old directory path", () => {
            setups.updateQpItemsWithNewDirectoryPath.setupForReturningUnchangedItemsWhenDirectoryNotFound();
            chai_1.assert.deepEqual(utils_1.utils.updateQpItemsWithNewDirectoryPath((0, qpItemMockFactory_1.getQpItems)(), (0, itemMockFactory_1.getDirectory)("./fake-not-existing/"), (0, itemMockFactory_1.getDirectory)("./fake-new/")), (0, qpItemMockFactory_1.getQpItems)());
        });
    });
    describe("normalizeUriPath", () => {
        it("should return uri path without workspace part if workspace has more than one folder", () => {
            const { item, qpItem } = setups.normalizeUriPath.setupForRemovingWorkspacePartWhenMultipleFolders();
            chai_1.assert.equal(utils_1.utils.normalizeUriPath(item.path), qpItem.uri.path);
        });
        it("should return uri path without workspace part if workspace has only one folder", () => {
            const { item, qpItem } = setups.normalizeUriPath.setupForRemovingWorkspacePartWhenSingleFolder();
            chai_1.assert.equal(utils_1.utils.normalizeUriPath(item.path), qpItem.uri.path);
        });
        it("should return uri path with workspace part if workspace doesn't have any folder", () => {
            const { item, qpItem } = setups.normalizeUriPath.setupForKeepingWorkspacePartWhenNoFolders();
            chai_1.assert.equal(utils_1.utils.normalizeUriPath(item.path), qpItem.uri.path);
        });
    });
    describe("isDirectory", () => {
        it("should return true if passed uri is a directory", () => {
            chai_1.assert.equal(utils_1.utils.isDirectory((0, itemMockFactory_1.getDirectory)("./fake/")), true);
        });
        it("should return false if passed uri is a file", () => {
            chai_1.assert.equal(utils_1.utils.isDirectory((0, itemMockFactory_1.getItem)()), false);
        });
    });
    describe("convertMsToSec", () => {
        it("should get value in ms and convert it to seconds", () => {
            chai_1.assert.equal(utils_1.utils.convertMsToSec(2000), 2);
        });
    });
    describe("getStructure", () => {
        it("should return tree structure based on workspace data", () => {
            const workspaceData = setups.getStructure.setupForReturningTreeStructureFromWorkspaceData();
            chai_1.assert.equal(utils_1.utils.getStructure(workspaceData), `{
  "fake": {
    "fake-1.ts": "4 items"
  },
  "fake-other": {
    "fake-2.ts": "1 item"
  },
  "fake-another": {
    "fake-3.ts": "0 items"
  }
}`);
        });
    });
    describe("setWorkspaceFoldersCommonPath", () => {
        it("should do nothing if workspace has only one folder", () => {
            setups.setWorkspaceFoldersCommonPath.setupForDoingNothingWhenSingleFolder();
            utils_1.utils.setWorkspaceFoldersCommonPath();
            chai_1.assert.equal(utils_1.utils.getWorkspaceFoldersCommonPathProp(), "");
        });
        it("should do nothing if workspace doesn't have any folder", () => {
            setups.setWorkspaceFoldersCommonPath.setupForDoingNothingWhenNoFolders();
            utils_1.utils.setWorkspaceFoldersCommonPath();
            chai_1.assert.equal(utils_1.utils.getWorkspaceFoldersCommonPathProp(), "");
        });
        it("should extract common path if workspace has more than one folder", () => {
            setups.setWorkspaceFoldersCommonPath.setupForExtractingCommonPathWhenMultipleFolders();
            utils_1.utils.setWorkspaceFoldersCommonPath();
            chai_1.assert.equal(utils_1.utils.getWorkspaceFoldersCommonPathProp(), "/common/path");
        });
    });
});
//# sourceMappingURL=utils.test.js.map