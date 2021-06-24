import { assert, expect } from "chai";
import * as sinon from "sinon";
import * as vscode from "vscode";
import Config from "../../config";
import ActionType from "../../enum/actionType";
import ExcludeMode from "../../enum/excludeMode";
import Action from "../../interface/action";
import Utils from "../../utils";
import { getTestSetups } from "../testSetup/utils.testSetup";
import {
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
} from "../util/eventMockFactory";
import { getDirectory, getItem, getItems } from "../util/itemMockFactory";
import { getAction, getWorkspaceData } from "../util/mockFactory";
import { getQpItem, getQpItems } from "../util/qpItemMockFactory";
import { getConfigStub } from "../util/stubFactory";

describe("Utils", () => {
  let configStub: Config = getConfigStub();
  let utils: Utils = new Utils(configStub);
  let setups = getTestSetups(utils);

  beforeEach(() => {
    configStub = getConfigStub();
    utils = new Utils(configStub);
    setups = getTestSetups(utils);
  });

  describe("hasWorkspaceAnyFolder", () => {
    it("1: should return true if workspace contains at least one folder", () => {
      setups.hasWorkspaceAnyFolder1();
      assert.equal(utils.hasWorkspaceAnyFolder(), true);
    });

    it("2: should return false if workspace does not contain any folder", () => {
      setups.hasWorkspaceAnyFolder2();
      assert.equal(utils.hasWorkspaceAnyFolder(), false);
    });
  });

  describe("hasWorkspaceMoreThanOneFolder", () => {
    it("1: should return true if workspace contains more than one folder", () => {
      setups.hasWorkspaceMoreThanOneFolder1();
      assert.equal(utils.hasWorkspaceMoreThanOneFolder(), true);
    });

    it("2: should return false if workspace contains either one folder or any", () => {
      setups.hasWorkspaceMoreThanOneFolder2();
      assert.equal(utils.hasWorkspaceMoreThanOneFolder(), false);
    });
  });

  describe("hasWorkspaceChanged", () => {
    it("1: should return true if amount of opened folders in workspace has changed", () => {
      assert.equal(
        utils.hasWorkspaceChanged(getWorkspaceFoldersChangeEvent(true)),
        true
      );
    });

    it("2: should return false if amount of opened folders in workspace has not changed", () => {
      assert.equal(
        utils.hasWorkspaceChanged(getWorkspaceFoldersChangeEvent(false)),
        false
      );
    });
  });

  describe("shouldReindexOnConfigurationChange", () => {
    it(`1: should return true if extension configuration has changed
      and is not excluded from refreshing`, () => {
      setups.shouldReindexOnConfigurationChange1();

      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(true, true, false)
        ),
        true
      );
    });

    it(`2: should return false if extension configuration has changed
      but is excluded from refreshing`, () => {
      setups.shouldReindexOnConfigurationChange2();

      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(false)
        ),
        false
      );
    });

    it("3: should return false if extension configuration has not changed", () => {
      setups.shouldReindexOnConfigurationChange3();

      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(false)
        ),
        false
      );
    });

    it(`4: should return true if exclude mode is set to 'files and search',
      configuration has changed and files.exclude has changed`, () => {
      setups.shouldReindexOnConfigurationChange4();

      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(
            false,
            false,
            true,
            ExcludeMode.FilesAndSearch,
            true
          )
        ),
        true
      );
    });

    it(`5: should return true if exclude mode is set to 'files and search',
      configuration has changed and search.exclude has changed`, () => {
      setups.shouldReindexOnConfigurationChange5();

      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(
            false,
            false,
            true,
            ExcludeMode.FilesAndSearch,
            false,
            true
          )
        ),
        true
      );
    });
  });

  describe("isDebounceConfigurationToggled", () => {
    it(`1: should return true if extension configuration
      related to debounce setting has changed`, () => {
      assert.equal(
        utils.isDebounceConfigurationToggled(
          getConfigurationChangeEvent(true, false)
        ),
        true
      );
    });

    it(`2: should return false if extension configuration
      related to debounce setting has not changed`, () => {
      assert.equal(
        utils.isDebounceConfigurationToggled(
          getConfigurationChangeEvent(false)
        ),
        false
      );
    });
  });

  describe("printNoFolderOpenedMessage", () => {
    it("1: should display notification", async () => {
      const [showInformationMessageStub] = setups.printNoFolderOpenedMessage1();
      utils.printNoFolderOpenedMessage();

      assert.equal(showInformationMessageStub.calledOnce, true);
    });
  });

  describe("printErrorMessage", () => {
    it("1: should display notification", async () => {
      const [showInformationMessageStub] = setups.printNoFolderOpenedMessage2();
      utils.printErrorMessage(new Error("test error message"));

      assert.equal(showInformationMessageStub.calledOnce, true);
    });
  });

  describe("createWorkspaceData", () => {
    it("1: should create workspaceData object", () => {
      assert.deepEqual(utils.createWorkspaceData(), getWorkspaceData());
    });
  });

  describe("clearWorkspaceData", () => {
    it("1: should clear workspaceData object", () => {
      const workspaceData = setups.clearWorkspaceData1();

      utils.clearWorkspaceData(workspaceData);
      assert.equal(workspaceData.count, 0);
      assert.equal(workspaceData.items.size, 0);
    });
  });

  describe("getSplitter", () => {
    it("1: should return splitter string", () => {
      assert.equal(utils.getSplitter(), "§&§");
    });
  });

  describe("getUrisForDirectoryPathUpdate", () => {
    it(`1: should return uris containing renamed directory
      name and file symbol kind`, async () => {
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

  describe("getNotificationLocation", () => {
    it(`1: should return vscode.ProgressLocation.Window
      if shouldDisplayNotificationInStatusBar is true`, () => {
      setups.getNotificationLocation1();

      assert.equal(
        utils.getNotificationLocation(),
        vscode.ProgressLocation.Window
      );
    });

    it(`2: should return vscode.ProgressLocation.Window
      if shouldDisplayNotificationInStatusBar is false`, () => {
      setups.getNotificationLocation2();

      assert.equal(
        utils.getNotificationLocation(),
        vscode.ProgressLocation.Notification
      );
    });
  });

  describe("getNotificationTitle", () => {
    it(`1: should return string 'Indexing...'
      if shouldDisplayNotificationInStatusBar is true`, () => {
      setups.getNotificationTitle1();
      assert.equal(utils.getNotificationTitle(), "Indexing...");
    });

    it(`2: should return string 'Indexing workspace files and symbols...'
      if shouldDisplayNotificationInStatusBar is false`, () => {
      setups.getNotificationTitle2();

      assert.equal(
        utils.getNotificationTitle(),
        "Indexing workspace files and symbols..."
      );
    });
  });

  describe("sleep", () => {
    it("1: should be fulfilled", async () => {
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

  describe("countWordInstances", () => {
    it("1: should count word instances in given text", () => {
      const instances = utils.countWordInstances(
        "test string with xxxtestxxx value",
        "test"
      );
      assert.equal(instances, 2);
    });
  });

  describe("getNthIndex", () => {
    it("1: should return index of second occurrence of word in given text", () => {
      const index = utils.getNthIndex(
        "test string with xxxtestxxx value",
        "test",
        2
      );
      assert.equal(index, 20);
    });

    it("2: should return -1 if word does not occur in given text", () => {
      const index = utils.getNthIndex("string with value", "test", 2);
      assert.equal(index, -1);
    });
  });

  describe("getLastFromArray", () => {
    it("1: should return last element from array fulfilling given predicate", () => {
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

    it("2: should return undefined if given predicated is not fulfilled", () => {
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
    it("1: should return map containing grouped array", () => {
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

  describe("updateQpItemsWithNewDirectoryPath", () => {
    it("1: should update qpItems with new directory path", () => {
      setups.updateQpItemsWithNewDirectoryPath1();
      assert.deepEqual(
        utils.updateQpItemsWithNewDirectoryPath(
          getQpItems(),
          getDirectory("./fake/"),
          getDirectory("./fake-new/")
        ),
        getQpItems(undefined, "./fake-new/")
      );
    });

    it(`2: should return unchanged qpItems if item
      does not contain old directory path`, () => {
      setups.updateQpItemsWithNewDirectoryPath2();
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
    it("1: should return uri path without workspace part", () => {
      setups.normalizeUriPath1();

      assert.equal(
        utils.normalizeUriPath(getItem().fsPath),
        getQpItem().uri!.fsPath
      );
    });
  });
});
