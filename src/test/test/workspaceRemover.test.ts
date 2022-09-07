import { assert } from "chai";
import { DetailedActionType } from "../../types";
import * as workspaceRemover from "../../workspaceRemover";
import { getTestSetups } from "../testSetup/workspaceRemover.testSetup";
import { getDirectory, getItem } from "../util/itemMockFactory";
import { getQpItems } from "../util/qpItemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("WorkspaceRemover", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("removeFromCacheByPath", () => {
    it("1: should remove given uri from stored data when file is removed ", () => {
      const [updateDataStub] = setups.removeFromCacheByPath1();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.RemoveFile
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it("2: should remove given uri from stored data when file is renamed or moved", () => {
      const [updateDataStub] = setups.removeFromCacheByPath2();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.RenameOrMoveFile
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it("3: should remove given uri from stored data when text in file is changed", () => {
      const [updateDataStub] = setups.removeFromCacheByPath3();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.TextChange
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it("4: should remove all uris for given folder uri when directory is removed", () => {
      const [updateDataStub] = setups.removeFromCacheByPath4();

      workspaceRemover.removeFromCacheByPath(
        getDirectory("./fake/"),
        DetailedActionType.RemoveDirectory
      );
      assert.equal(updateDataStub.calledWith([]), true);
    });

    it("5: should remove all uris for given folder uri when directory is renamed", () => {
      const [updateDataStub] = setups.removeFromCacheByPath5();

      workspaceRemover.removeFromCacheByPath(
        getDirectory("./fake/"),
        DetailedActionType.RenameOrMoveDirectory
      );
      assert.equal(updateDataStub.calledWith([]), true);
    });

    it("6: should remove given uri when file is reloaded if it is unsaved", () => {
      const [updateDataStub] = setups.removeFromCacheByPath6();

      workspaceRemover.removeFromCacheByPath(
        getItem(),
        DetailedActionType.ReloadUnsavedUri
      );
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });
  });
});
