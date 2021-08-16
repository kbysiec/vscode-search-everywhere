import { assert } from "chai";
import Cache from "../../cache";
import Config from "../../config";
import ActionTrigger from "../../enum/actionTrigger";
import ActionType from "../../enum/actionType";
import Utils from "../../utils";
import Workspace from "../../workspace";
import { getTestSetups } from "../testSetup/workspace.testSetup";
import {
  getConfigurationChangeEvent,
  getFileCreateEvent,
  getFileDeleteEvent,
  getFileRenameEvent,
  getTextDocumentChangeEvent,
  getWorkspaceFoldersChangeEvent,
} from "../util/eventMockFactory";
import { getCacheStub, getConfigStub, getUtilsStub } from "../util/stubFactory";

describe("Workspace", () => {
  let cacheStub: Cache = getCacheStub();
  let utilsStub: Utils = getUtilsStub();
  let configStub: Config = getConfigStub();
  let workspace: Workspace = new Workspace(cacheStub, utilsStub, configStub);
  let workspaceAny: any;
  let setups = getTestSetups(workspace);

  beforeEach(() => {
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    configStub = getConfigStub();
    workspace = new Workspace(cacheStub, utilsStub, configStub);
    workspaceAny = workspace as any;
    setups = getTestSetups(workspace);
  });

  describe("index", () => {
    it("1: should common.index method be invoked", async () => {
      const [indexStub] = setups.index1();
      await workspace.index(ActionTrigger.Search);

      assert.equal(indexStub.calledOnce, true);
    });
  });

  describe("registerEventListeners", () => {
    it("1: should register workspace event listeners", () => {
      const [
        onDidChangeConfigurationStub,
        onDidChangeWorkspaceFoldersStub,
        onDidChangeTextDocumentStub,
        onWillProcessingStub,
        onDidProcessingStub,
        onWillExecuteActionStub,
      ] = setups.registerEventListeners1();

      workspace.registerEventListeners();

      assert.equal(onDidChangeConfigurationStub.calledOnce, true);
      assert.equal(onDidChangeWorkspaceFoldersStub.calledOnce, true);
      assert.equal(onDidChangeTextDocumentStub.calledOnce, true);
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

  describe("handleDidChangeConfiguration", () => {
    it(`1: should index method be invoked which register
        rebuild action if extension configuration has changed`, async () => {
      const [indexStub] = setups.handleDidChangeConfiguration1();

      await workspaceAny.handleDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it(`2: should index method be invoked which register
      rebuild action if isDebounceConfigurationToggled is true`, async () => {
      const eventEmitter = setups.handleDidChangeConfiguration2();

      await workspaceAny.handleDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("3: should do nothing if extension configuration has not changed", async () => {
      const [registerActionStub, onDidDebounceConfigToggleEventEmitterStub] =
        setups.handleDidChangeConfiguration3();

      await workspaceAny.handleDidChangeConfiguration(
        getConfigurationChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
      assert.equal(onDidDebounceConfigToggleEventEmitterStub.calledOnce, false);
    });

    it("4: should cache.clearConfig method be invoked", async () => {
      const [clearConfigStub] = setups.handleDidChangeConfiguration4();

      await workspaceAny.handleDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(clearConfigStub.calledOnce, true);
    });
  });

  describe("handleDidChangeWorkspaceFolders", () => {
    it(`1: should index method be invoked which register
        rebuild action if amount of opened folders in workspace has changed`, async () => {
      const [indexStub] = setups.handleDidChangeWorkspaceFolders1();

      await workspaceAny.handleDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it("2: should do nothing if extension configuration has not changed", async () => {
      const [registerActionStub] = setups.handleDidChangeWorkspaceFolders2();
      await workspaceAny.handleDidChangeWorkspaceFolders(
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
      await workspaceAny.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledTwice, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
      assert.equal(registerActionStub.args[1][0], ActionType.Update);
    });

    it(`2: should do nothing if text document does not exist in workspace`, async () => {
      const [registerActionStub] = setups.handleDidChangeTextDocument2();
      const textDocumentChangeEvent = getTextDocumentChangeEvent(true);
      await workspaceAny.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });

    it(`3: should do nothing if text document has not changed`, async () => {
      const [registerActionStub] = setups.handleDidChangeTextDocument3();
      const textDocumentChangeEvent = await getTextDocumentChangeEvent();
      await workspaceAny.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("handleDidRenameFiles", () => {
    it(`1: should registerAction method be invoked twice to register remove and update
        actions for each renamed or moved file`, async () => {
      const [registerActionStub] = setups.handleDidRenameFiles1();

      await workspaceAny.handleDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.callCount, 4);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
      assert.equal(registerActionStub.args[1][0], ActionType.Remove);
      assert.equal(registerActionStub.args[2][0], ActionType.Update);
      assert.equal(registerActionStub.args[3][0], ActionType.Remove);
    });

    it(`2: should registerAction method be invoked once to register update
        action for renamed or moved directory`, async () => {
      const [registerActionStub] = setups.handleDidRenameFiles2();

      await workspaceAny.handleDidRenameFiles(getFileRenameEvent(true));

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });
  });

  describe("handleDidCreateFiles", () => {
    it(`1: should registerAction method be invoked which register update action
      when file is created`, async () => {
      const [registerActionStub] = setups.handleDidCreateFiles1();
      await workspaceAny.handleDidCreateFiles(getFileCreateEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`2: should registerAction method be invoked which register update action
      when directory is created`, async () => {
      const [registerActionStub] = setups.handleDidCreateFiles2();
      await workspaceAny.handleDidCreateFiles(getFileCreateEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });
  });

  describe("handleDidDeleteFiles", () => {
    it(`1: should registerAction method be invoked which register remove action
      when file is deleted`, async () => {
      const [registerActionStub] = setups.handleDidDeleteFiles1();
      await workspaceAny.handleDidDeleteFiles(getFileDeleteEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });

    it(`2: should registerAction method be invoked which register remove action
      when directory is deleted`, async () => {
      const [registerActionStub] = setups.handleDidDeleteFiles2();
      await workspaceAny.handleDidDeleteFiles(getFileDeleteEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });
  });

  describe("handleWillActionProcessorProcessing", () => {
    it("1: should onWillProcessing event be emitted", () => {
      const eventEmitter = setups.handleWillActionProcessorProcessing1();
      workspaceAny.handleWillActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("handleDidActionProcessorProcessing", () => {
    it("1: should onDidProcessing event be emitted", () => {
      const eventEmitter = setups.handleDidActionProcessorProcessing1();
      workspaceAny.handleDidActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("handleWillActionProcessorExecuteAction", () => {
    it("1: should onWillExecuteAction event be emitted", () => {
      const eventEmitter = setups.handleWillActionProcessorExecuteAction1();
      workspaceAny.handleWillActionProcessorExecuteAction();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });
});
