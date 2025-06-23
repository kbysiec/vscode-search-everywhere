import { assert, expect } from "chai";
import * as sinon from "sinon";
import { Action, ActionType } from "../../src/types";
import { utils } from "../../src/utils";
import { getTestSetups } from "../testSetup/utils.testSetup";
import {
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
} from "../util/eventMockFactory";
import { getDirectory, getItem, getItems } from "../util/itemMockFactory";
import {
  getAction,
  getIndexStats,
  getWorkspaceData,
} from "../util/mockFactory";
import { getQpItem, getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("Utils", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("hasWorkspaceAnyFolder", () => {
    it("should return true if workspace contains at least one folder", () => {
      setups.hasWorkspaceAnyFolder.setupForReturningTrueWhenWorkspaceHasFolders();
      assert.equal(utils.hasWorkspaceAnyFolder(), true);
    });

    it("should return false if workspace does not contain any folder", () => {
      setups.hasWorkspaceAnyFolder.setupForReturningFalseWhenWorkspaceHasNoFolders();
      assert.equal(utils.hasWorkspaceAnyFolder(), false);
    });
  });

  describe("hasWorkspaceMoreThanOneFolder", () => {
    it("should return true if workspace contains more than one folder", () => {
      setups.hasWorkspaceMoreThanOneFolder.setupForReturningTrueWhenWorkspaceHasMultipleFolders();
      assert.equal(utils.hasWorkspaceMoreThanOneFolder(), true);
    });

    it("should return false if workspace contains either one folder or any", () => {
      setups.hasWorkspaceMoreThanOneFolder.setupForReturningFalseWhenWorkspaceHasOneOrNoFolders();
      assert.equal(utils.hasWorkspaceMoreThanOneFolder(), false);
    });
  });

  describe("hasWorkspaceChanged", () => {
    it("should return true if amount of opened folders in workspace has changed", () => {
      assert.equal(
        utils.hasWorkspaceChanged(getWorkspaceFoldersChangeEvent(true)),
        true
      );
    });

    it("should return false if amount of opened folders in workspace has not changed", () => {
      assert.equal(
        utils.hasWorkspaceChanged(getWorkspaceFoldersChangeEvent(false)),
        false
      );
    });
  });

  describe("isDebounceConfigurationToggled", () => {
    it("should return true if extension configuration related to debounce setting has changed", () => {
      assert.equal(
        utils.isDebounceConfigurationToggled(
          getConfigurationChangeEvent(true, false)
        ),
        true
      );
    });

    it("should return false if extension configuration related to debounce setting has not changed", () => {
      assert.equal(
        utils.isDebounceConfigurationToggled(
          getConfigurationChangeEvent(false)
        ),
        false
      );
    });
  });

  describe("isSortingConfigurationToggled", () => {
    it("should return true if extension configuration related to sorting setting has changed", () => {
      assert.equal(
        utils.isSortingConfigurationToggled(
          getConfigurationChangeEvent(true, false)
        ),
        true
      );
    });

    it("should return false if extension configuration related to debounce setting has not changed", () => {
      assert.equal(
        utils.isSortingConfigurationToggled(getConfigurationChangeEvent(false)),
        false
      );
    });
  });

  describe("printNoFolderOpenedMessage", () => {
    it("should display notification", async () => {
      const [showInformationMessageStub] =
        setups.printNoFolderOpenedMessage.setupForDisplayingNotification();
      utils.printNoFolderOpenedMessage();

      assert.equal(showInformationMessageStub.calledOnce, true);
    });
  });

  describe("printErrorMessage", () => {
    it("should display notification", async () => {
      const [showInformationMessageStub] =
        setups.printErrorMessage.setupForDisplayingNotification();
      utils.printErrorMessage(new Error("test error message"));

      assert.equal(showInformationMessageStub.calledOnce, true);
    });
  });

  describe("printStatsMessage", () => {
    it("should display notification with scan stats", async () => {
      const [showInformationMessageStub] =
        setups.printStatsMessage.setupForDisplayingStatsNotification();
      const indexStats = getIndexStats();
      utils.printStatsMessage(indexStats);

      const calledWith = (
        showInformationMessageStub.args[0][0] as string
      ).replaceAll(" ", "");
      const expected = `Elapsed time: ${indexStats.ElapsedTimeInSeconds}s
      Scanned files: ${indexStats.ScannedUrisCount}
      Indexed items: ${indexStats.IndexedItemsCount}`.replaceAll(" ", "");

      assert.equal(calledWith, expected);
    });
  });

  describe("createWorkspaceData", () => {
    it("should create workspaceData object", () => {
      assert.deepEqual(utils.createWorkspaceData(), getWorkspaceData());
    });
  });

  describe("clearWorkspaceData", () => {
    it("should clear workspaceData object", () => {
      const workspaceData =
        setups.clearWorkspaceData.setupForClearingWorkspaceDataObject();

      utils.clearWorkspaceData(workspaceData);
      assert.equal(workspaceData.count, 0);
      assert.equal(workspaceData.items.size, 0);
    });
  });

  describe("getSplitter", () => {
    it("should return splitter string", () => {
      assert.equal(utils.getSplitter(), "§&§");
    });
  });

  describe("getUrisForDirectoryPathUpdate", () => {
    it("should return uris containing renamed directory name and file symbol kind", async () => {
      const qpItems = getQpItems();
      qpItems[1] = getQpItem("./test/fake-files/", 2);
      assert.deepEqual(
        await utils.getUrisForDirectoryPathUpdate(
          qpItems,
          getDirectory("./fake/"),
          0
        ),
        getItems(1, undefined, undefined, true)
      );
    });
  });

  describe("sleep", () => {
    it("should be fulfilled", async () => {
      const clock = sinon.useFakeTimers();
      let fulfilled = false;
      const sleepPromise = utils.sleep(1000);

      sleepPromise.then(() => {
        fulfilled = true;
      });

      // https://stackoverflow.com/questions/51526312/testing-setinterval-with-sinon-faketimers-not-working
      await Promise.resolve();
      clock.tick(999);
      expect(fulfilled).to.be.false;
      clock.tick(2);
      await Promise.resolve();
      expect(fulfilled).to.be.true;

      clock.restore();
    });
  });

  describe("sleepAndExecute", () => {
    it("should given fn be invoked after give", async () => {
      const stub = setups.sleepAndExecute.setupForInvokingFunctionAfterDelay();
      const clock = sinon.useFakeTimers();
      let fulfilled = false;
      utils.sleepAndExecute(1000, stub);

      // https://stackoverflow.com/questions/51526312/testing-setinterval-with-sinon-faketimers-not-working
      await Promise.resolve();
      clock.tick(999);
      assert.equal(stub.calledOnce, false);
      clock.tick(2);
      assert.equal(stub.calledOnce, true);

      clock.restore();
    });
  });

  describe("countWordInstances", () => {
    it("should count word instances in given text", () => {
      const instances = utils.countWordInstances(
        "test string with xxxtestxxx value",
        "test"
      );
      assert.equal(instances, 2);
    });
  });

  describe("getNthIndex", () => {
    it("should return index of second occurrence of word in given text", () => {
      const index = utils.getNthIndex(
        "test string with xxxtestxxx value",
        "test",
        2
      );
      assert.equal(index, 20);
    });

    it("should return -1 if word does not occur in given text", () => {
      const index = utils.getNthIndex("string with value", "test", 2);
      assert.equal(index, -1);
    });
  });

  describe("getLastFromArray", () => {
    it("should return last element from array fulfilling given predicate", () => {
      const lastAction = getAction(ActionType.Rebuild, "test action 3", 3);
      const actual = utils.getLastFromArray(
        [
          getAction(ActionType.Rebuild, "test action 1", 1),
          getAction(ActionType.Remove, "test action 2", 2),
          lastAction,
        ],
        (action: Action) => action.type === ActionType.Rebuild
      );

      assert.deepEqual(actual, lastAction);
    });

    it("should return undefined if given predicated is not fulfilled", () => {
      const last = utils.getLastFromArray(
        [
          getAction(ActionType.Rebuild, "test action 1", 1),
          getAction(ActionType.Remove, "test action 2", 2),
          getAction(ActionType.Rebuild, "test action 3", 3),
        ],
        (action: Action) => action.type === ActionType.Update
      );

      assert.equal(last, undefined);
    });
  });

  describe("groupBy", () => {
    it("should return map containing grouped array", () => {
      const actions = [
        getAction(ActionType.Rebuild, "test action 1", 1),
        getAction(ActionType.Remove, "test action 2", 2),
        getAction(ActionType.Rebuild, "test action 3", 3),
      ];

      const actual = utils.groupBy(actions, (action: Action) => action.type);

      const expected = new Map<string, Action[]>();
      expected.set(ActionType.Rebuild, [actions[0], actions[2]]);
      expected.set(ActionType.Remove, [actions[1]]);

      assert.deepEqual(actual, expected);
    });
  });

  describe("getNameFromUri", () => {});

  describe("updateQpItemsWithNewDirectoryPath", () => {
    it("should update qpItems with new directory path", () => {
      setups.updateQpItemsWithNewDirectoryPath.setupForUpdatingItemsWithNewDirectoryPath();
      assert.deepEqual(
        utils.updateQpItemsWithNewDirectoryPath(
          getQpItems(),
          getDirectory("./fake/"),
          getDirectory("./fake-new/")
        ),
        getQpItems(undefined, "./fake-new/")
      );
    });

    it("should return unchanged qpItems if item does not contain old directory path", () => {
      setups.updateQpItemsWithNewDirectoryPath.setupForReturningUnchangedItemsWhenDirectoryNotFound();
      assert.deepEqual(
        utils.updateQpItemsWithNewDirectoryPath(
          getQpItems(),
          getDirectory("./fake-not-existing/"),
          getDirectory("./fake-new/")
        ),
        getQpItems()
      );
    });
  });

  describe("normalizeUriPath", () => {
    it("should return uri path without workspace part if workspace has more than one folder", () => {
      const { item, qpItem } =
        setups.normalizeUriPath.setupForRemovingWorkspacePartWhenMultipleFolders();
      assert.equal(utils.normalizeUriPath(item.path), qpItem.uri.path);
    });

    it("should return uri path without workspace part if workspace has only one folder", () => {
      const { item, qpItem } =
        setups.normalizeUriPath.setupForRemovingWorkspacePartWhenSingleFolder();
      assert.equal(utils.normalizeUriPath(item.path), qpItem.uri.path);
    });

    it("should return uri path with workspace part if workspace doesn't have any folder", () => {
      const { item, qpItem } =
        setups.normalizeUriPath.setupForKeepingWorkspacePartWhenNoFolders();
      assert.equal(utils.normalizeUriPath(item.path), qpItem.uri.path);
    });
  });

  describe("isDirectory", () => {
    it("should return true if passed uri is a directory", () => {
      assert.equal(utils.isDirectory(getDirectory("./fake/")), true);
    });
    it("should return false if passed uri is a file", () => {
      assert.equal(utils.isDirectory(getItem()), false);
    });
  });

  describe("convertMsToSec", () => {
    it("should get value in ms and convert it to seconds", () => {
      assert.equal(utils.convertMsToSec(2000), 2);
    });
  });

  describe("getStructure", () => {
    it("should return tree structure based on workspace data", () => {
      const workspaceData =
        setups.getStructure.setupForReturningTreeStructureFromWorkspaceData();
      assert.equal(
        utils.getStructure(workspaceData),
        `{
  "fake": {
    "fake-1.ts": "4 items"
  },
  "fake-other": {
    "fake-2.ts": "1 item"
  },
  "fake-another": {
    "fake-3.ts": "0 items"
  }
}`
      );
    });
  });

  describe("setWorkspaceFoldersCommonPath", () => {
    it("should do nothing if workspace has only one folder", () => {
      setups.setWorkspaceFoldersCommonPath.setupForDoingNothingWhenSingleFolder();
      utils.setWorkspaceFoldersCommonPath();
      assert.equal(utils.getWorkspaceFoldersCommonPathProp(), "");
    });

    it("should do nothing if workspace doesn't have any folder", () => {
      setups.setWorkspaceFoldersCommonPath.setupForDoingNothingWhenNoFolders();
      utils.setWorkspaceFoldersCommonPath();
      assert.equal(utils.getWorkspaceFoldersCommonPathProp(), "");
    });

    it("should extract common path if workspace has more than one folder", () => {
      setups.setWorkspaceFoldersCommonPath.setupForExtractingCommonPathWhenMultipleFolders();
      utils.setWorkspaceFoldersCommonPath();
      assert.equal(utils.getWorkspaceFoldersCommonPathProp(), "/common/path");
    });
  });
});
