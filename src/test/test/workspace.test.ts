import { assert } from "chai";
import { ActionTrigger, ActionType, ExcludeMode } from "../../types";
import { workspace } from "../../workspace";
import { getTestSetups } from "../testSetup/workspace.testSetup";
import {
  getConfigurationChangeEvent,
  getFileCreateEvent,
  getFileDeleteEvent,
  getFileRenameEvent,
  getTextDocumentChangeEvent,
  getWorkspaceFoldersChangeEvent,
} from "../util/eventMockFactory";
import { getAction } from "../util/mockFactory";
import { getTextDocumentStub } from "../util/stubFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("Workspace", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("init", () => {
    it("1: should utils.setWorkspaceFoldersCommonPath method be invoked", async () => {
      const [setWorkspaceFoldersCommonPathStub] = setups.init1();
      await workspace.init();

      assert.equal(setWorkspaceFoldersCommonPathStub.calledOnce, true);
    });

    it("2: should dataService.fetchConfig method be invoked", async () => {
      const [fetchConfigStub] = setups.init2();
      await workspace.init();

      assert.equal(fetchConfigStub.calledOnce, true);
    });

    it("3: should dataConverter.fetchConfig method be invoked", async () => {
      const [fetchConfigStub] = setups.init3();
      await workspace.init();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("index", () => {
    it("1: should common.index method be invoked", async () => {
      const [indexStub] = setups.index1();
      await workspace.index(ActionTrigger.Search);

      assert.equal(indexStub.calledOnce, true);
    });

    it("1: should cache.clear method be invoked", async () => {
      const [clearStub] = setups.index2();
      await workspace.index(ActionTrigger.Search);

      assert.equal(clearStub.calledOnce, true);
    });
  });

  describe("removeDataForUnsavedUris", () => {
    it("1: should common.registerAction be invoked twice for each unsaved uri", async () => {
      const [registerActionStub] = setups.removeDataForUnsavedUris1();
      await workspace.removeDataForUnsavedUris();

      assert.equal(registerActionStub.callCount, 4);
    });

    it("2: should clear array of unsaved uris", async () => {
      setups.removeDataForUnsavedUris2();
      await workspace.removeDataForUnsavedUris();

      assert.equal(workspace.getNotSavedUris().size, 0);
    });
  });

  describe("registerEventListeners", () => {
    it("1: should register workspace event listeners", () => {
      const [
        onDidChangeConfigurationStub,
        onDidChangeWorkspaceFoldersStub,
        onDidChangeTextDocumentStub,
        onDidSaveTextDocumentStub,
        onWillProcessingStub,
        onDidProcessingStub,
        onWillExecuteActionStub,
      ] = setups.registerEventListeners1();

      workspace.registerEventListeners();

      assert.equal(onDidChangeConfigurationStub.calledOnce, true);
      assert.equal(onDidChangeWorkspaceFoldersStub.calledOnce, true);
      assert.equal(onDidChangeTextDocumentStub.calledOnce, true);
      assert.equal(onDidSaveTextDocumentStub.calledOnce, true);
      assert.equal(onWillProcessingStub.calledOnce, true);
      assert.equal(onDidProcessingStub.calledOnce, true);
      assert.equal(onWillExecuteActionStub.calledOnce, true);
    });
  });

  describe("getData", () => {
    it("1: should common.getData method be invoked", () => {
      const [getDataStub] = setups.getData1();

      workspace.getData();
      assert.equal(getDataStub.calledOnce, true);
    });
  });

  describe("shouldReindexOnConfigurationChange", () => {
    it(`1: should return true if extension configuration has changed
      and is not excluded from refreshing`, () => {
      setups.shouldReindexOnConfigurationChange1();

      assert.equal(
        workspace.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(true, true, false)
        ),
        true
      );
    });

    it(`2: should return false if extension configuration has changed
      but is excluded from refreshing`, () => {
      setups.shouldReindexOnConfigurationChange2();

      assert.equal(
        workspace.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(false)
        ),
        false
      );
    });

    it("3: should return false if extension configuration has not changed", () => {
      setups.shouldReindexOnConfigurationChange3();

      assert.equal(
        workspace.shouldReindexOnConfigurationChange(
          getConfigurationChangeEvent(false)
        ),
        false
      );
    });

    it(`4: should return true if exclude mode is set to 'files and search',
      configuration has changed and files.exclude has changed`, () => {
      setups.shouldReindexOnConfigurationChange4();

      assert.equal(
        workspace.shouldReindexOnConfigurationChange(
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
        workspace.shouldReindexOnConfigurationChange(
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

  describe("handleDidChangeConfiguration", () => {
    it(`1: should index method be invoked which register
        rebuild action if extension configuration has changed`, async () => {
      const [indexStub] = setups.handleDidChangeConfiguration1();

      await workspace.handleDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it(`2: should onDidDebounceConfigToggle event be emitted
      if isDebounceConfigurationToggled is true`, async () => {
      const eventEmitter = setups.handleDidChangeConfiguration2();

      await workspace.handleDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it(`3: should onDidSortingConfigToggle event be emitted
      if isSortingConfigurationToggled is true`, async () => {
      const eventEmitter = setups.handleDidChangeConfiguration3();

      await workspace.handleDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("4: should do nothing if extension configuration has not changed", async () => {
      const [registerActionStub, onDidDebounceConfigToggleEventEmitterStub] =
        setups.handleDidChangeConfiguration4();

      await workspace.handleDidChangeConfiguration(
        getConfigurationChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
      assert.equal(onDidDebounceConfigToggleEventEmitterStub.calledOnce, false);
    });

    it("5: should cache.clearConfig method be invoked", async () => {
      const [clearConfigStub] = setups.handleDidChangeConfiguration5();

      await workspace.handleDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(clearConfigStub.calledOnce, true);
    });
  });

  describe("handleDidChangeWorkspaceFolders", () => {
    it(`1: should index method be invoked which register
        rebuild action if amount of opened folders in workspace has changed`, async () => {
      const [indexStub] = setups.handleDidChangeWorkspaceFolders1();

      await workspace.handleDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it("2: should do nothing if extension configuration has not changed", async () => {
      const [registerActionStub] = setups.handleDidChangeWorkspaceFolders2();
      await workspace.handleDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("handleDidChangeTextDocument", () => {
    it(`1: should registerAction method be invoked which register update
        action if text document has changed and exists in workspace`, async () => {
      const [registerActionStub] = setups.handleDidChangeTextDocument1();
      const textDocumentChangeEvent = getTextDocumentChangeEvent(true);
      await workspace.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledTwice, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
      assert.equal(registerActionStub.args[1][0], ActionType.Update);
    });

    it(`2: should do nothing if text document does not exist in workspace`, async () => {
      const [registerActionStub] = setups.handleDidChangeTextDocument2();
      const textDocumentChangeEvent = getTextDocumentChangeEvent(true);
      await workspace.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });

    it(`3: should do nothing if text document has not changed`, async () => {
      const [registerActionStub] = setups.handleDidChangeTextDocument3();
      const textDocumentChangeEvent = await getTextDocumentChangeEvent();
      await workspace.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });

    it(`4: should add uri to not saved array if text document has changed and exists in workspace`, async () => {
      setups.handleDidChangeTextDocument4();
      const textDocumentChangeEvent = getTextDocumentChangeEvent(true);
      await workspace.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(workspace.getNotSavedUris().size, 1);
    });
  });

  describe("handleDidRenameFiles", () => {
    it(`1: should registerAction method be invoked twice to register remove and update
        actions for each renamed or moved file`, async () => {
      const [registerActionStub] = setups.handleDidRenameFiles1();

      await workspace.handleDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.callCount, 4);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
      assert.equal(registerActionStub.args[1][0], ActionType.Remove);
      assert.equal(registerActionStub.args[2][0], ActionType.Update);
      assert.equal(registerActionStub.args[3][0], ActionType.Remove);
    });

    it(`2: should registerAction method be invoked once to register update
        action for renamed or moved directory`, async () => {
      const [registerActionStub] = setups.handleDidRenameFiles2();

      await workspace.handleDidRenameFiles(getFileRenameEvent(true));

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });
  });

  describe("handleDidCreateFiles", () => {
    it(`1: should registerAction method be invoked which register update action
      when file is created`, async () => {
      const [registerActionStub] = setups.handleDidCreateFiles1();
      await workspace.handleDidCreateFiles(getFileCreateEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`2: should registerAction method be invoked which register update action
      when directory is created`, async () => {
      const [registerActionStub] = setups.handleDidCreateFiles2();
      await workspace.handleDidCreateFiles(getFileCreateEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`4: should add uri to not saved array`, async () => {
      setups.handleDidCreateFiles3();
      await workspace.handleDidCreateFiles(getFileCreateEvent());

      assert.equal(workspace.getNotSavedUris().size, 1);
    });
  });

  describe("handleDidDeleteFiles", () => {
    it(`1: should registerAction method be invoked which register remove action
      when file is deleted`, async () => {
      const [registerActionStub] = setups.handleDidDeleteFiles1();
      await workspace.handleDidDeleteFiles(getFileDeleteEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });

    it(`2: should registerAction method be invoked which register remove action
      when directory is deleted`, async () => {
      const [registerActionStub] = setups.handleDidDeleteFiles2();
      await workspace.handleDidDeleteFiles(getFileDeleteEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });
  });

  describe("handleDidSaveTextDocument", () => {
    it(`should remove uri from not saved array`, async () => {
      setups.handleDidSaveTextDocument1();
      await workspace.handleDidSaveTextDocument(
        getTextDocumentStub(undefined, "/test/path2")
      );

      assert.equal(workspace.getNotSavedUris().size, 2);
    });
  });

  describe("handleWillActionProcessorProcessing", () => {
    it("1: should onWillProcessing event be emitted", () => {
      const eventEmitter = setups.handleWillActionProcessorProcessing1();
      workspace.handleWillActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("handleDidActionProcessorProcessing", () => {
    it("1: should onDidProcessing event be emitted", () => {
      const eventEmitter = setups.handleDidActionProcessorProcessing1();
      workspace.handleDidActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("handleWillActionProcessorExecuteAction", () => {
    it("1: should onWillExecuteAction event be emitted", () => {
      const eventEmitter = setups.handleWillActionProcessorExecuteAction1();
      workspace.handleWillActionProcessorExecuteAction(getAction());

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });
});
