import * as vscode from "vscode";
import { assert, expect } from "chai";
import * as sinon from "sinon";
import Utils from "../../utils";
import {
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
  getWorkspaceData,
  getAction,
} from "../util/mockFactory";
import ActionType from "../../enum/actionType";
import Action from "../../interface/action";

describe("Utils", () => {
  let utils: Utils;

  before(() => {
    utils = new Utils();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("hasWorkspaceAnyFolder", () => {
    it("should return true if workspace contains at least one folder", () => {
      sinon.stub(vscode.workspace, "workspaceFolders").value(["/#"]);

      assert.equal(utils.hasWorkspaceAnyFolder(), true);
    });

    it("should return false if workspace does not contain any folder", () => {
      sinon.stub(vscode.workspace, "workspaceFolders").value([]);

      assert.equal(utils.hasWorkspaceAnyFolder(), false);
    });
  });

  describe("hasWorkspaceMoreThanOneFolder", () => {
    it("should return true if workspace contains more than one folder", () => {
      sinon.stub(vscode.workspace, "workspaceFolders").value(["/#", "/test/#"]);

      assert.equal(utils.hasWorkspaceMoreThanOneFolder(), true);
    });

    it("should return false if workspace contains either one folder or any", () => {
      sinon.stub(vscode.workspace, "workspaceFolders").value(["/#"]);

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

  describe("shouldReindexOnConfigurationChange", () => {
    it(`should return true if extension configuration has changed
      and is not excluded from refreshing`, () => {
      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(true)
        ),
        true
      );
    });

    it(`should return false if extension configuration has changed
      but is excluded from refreshing`, () => {
      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(true, true)
        ),
        false
      );
    });

    it("should return false if extension configuration has not changed", () => {
      assert.equal(
        utils.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(false)
        ),
        false
      );
    });
  });

  describe("printNoFolderOpenedMessage", () => {
    it("should display notification", async () => {
      const showInformationMessageStub = sinon.stub(
        vscode.window,
        "showInformationMessage"
      );
      utils.printNoFolderOpenedMessage();

      assert.equal(showInformationMessageStub.calledOnce, true);
    });
  });

  describe("createWorkspaceData", () => {
    it("should create workspaceData object", () => {
      assert.deepEqual(utils.createWorkspaceData(), getWorkspaceData());
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

      // let event loop cycle
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

  describe("getSplitter", () => {
    it("should return splitter string", () => {
      assert.equal(utils.getSplitter(), "§&§");
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
});
