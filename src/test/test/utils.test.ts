import * as vscode from "vscode";
import * as sinon from "sinon";
import { assert, expect } from "chai";
import { getWorkspaceData, getAction } from "../util/mockFactory";
import {
  getWorkspaceFoldersChangeEvent,
  getConfigurationChangeEvent,
} from "../util/eventMockFactory";
import { getConfigStub } from "../util/stubFactory";
import Action from "../../interface/action";
import ActionType from "../../enum/actionType";
import Utils from "../../utils";
import Config from "../../config";
import { getQpItems, getQpItem } from "../util/qpItemMockFactory";
import { getDirectory, getItems } from "../util/itemMockFactory";
import { getTestSetups } from "../testSetup/utils.testSetup";

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

    it(`4: should return true if shouldUseFilesAndSearchExclude is true
      configuration has changed and files.exclude has changed`, () => {
      setups.shouldReindexOnConfigurationChange4();

      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(false, false, true, true, true)
        ),
        true
      );
    });

    it(`5: should return true if shouldUseFilesAndSearchExclude is true
      configuration has changed and search.exclude has changed`, () => {
      setups.shouldReindexOnConfigurationChange5();

      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(false, false, true, true, false, true)
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

  describe("getUrisWithNewDirectoryName", () => {
    it("1: should return vscode.Uri[] with updated directory path", () => {
      assert.deepEqual(
        utils.getUrisWithNewDirectoryName(
          getItems(),
          getDirectory("./fake/"),
          getDirectory("./test/fake-files/")
        ),
        getItems(2, "./test/fake-files/")
      );
    });

    it(`2: should return unchanged vscode.Uri[]
      if old directory path does not exist in workspace`, () => {
      assert.deepEqual(
        utils.getUrisWithNewDirectoryName(
          getItems(),
          getDirectory("./fake/not-exist/"),
          getDirectory("./test/fake-files/")
        ),
        getItems(2, "./fake/")
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
});
