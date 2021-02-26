import { assert } from "chai";
import {
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
  getTextDocumentChangeEvent,
  getFileRenameEvent,
} from "../util/eventMockFactory";
import { getItem } from "../util/itemMockFactory";
import { getCacheStub, getUtilsStub, getConfigStub } from "../util/stubFactory";
import ActionType from "../../enum/actionType";
import Cache from "../../cache";
import Utils from "../../utils";
import Config from "../../config";
import Workspace from "../../workspace";
import { getTestSetups } from "../testSetup/workspace.testSetup";

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
      await workspace.index("test comment");

      assert.equal(indexStub.calledOnce, true);
    });
  });

  describe("registerEventListeners", () => {
    it("1: should register workspace event listeners", () => {
      const { fileWatcherStub, stubs } = setups.registerEventListeners1();
      const [
        onDidChangeConfigurationStub,
        onDidChangeWorkspaceFoldersStub,
        onDidChangeTextDocumentStub,
        createFileSystemWatcherStub,
        onWillProcessingStub,
        onDidProcessingStub,
        onWillExecuteActionStub,
      ] = stubs;

      workspace.registerEventListeners();

      assert.equal(onDidChangeConfigurationStub.calledOnce, true);
      assert.equal(onDidChangeWorkspaceFoldersStub.calledOnce, true);
      assert.equal(onDidChangeTextDocumentStub.calledOnce, true);
      assert.equal(createFileSystemWatcherStub.calledOnce, true);
      assert.equal(fileWatcherStub.onDidChange.calledOnce, true);
      assert.equal(fileWatcherStub.onDidCreate.calledOnce, true);
      assert.equal(fileWatcherStub.onDidDelete.calledOnce, true);
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
      const [
        registerActionStub,
        onDidDebounceConfigToggleEventEmitterStub,
      ] = setups.handleDidChangeConfiguration3();

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
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.handleDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`2: should do nothing if text document does not exist in workspace`, async () => {
      const [registerActionStub] = setups.handleDidChangeTextDocument2();
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
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
    it(`1: should registerAction method be invoked which register remove
        action if workspace contains more than one folder`, async () => {
      const [registerActionStub] = setups.handleDidRenameFiles1();

      await workspaceAny.handleDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });

    it("2: should do nothing if workspace contains either one folder or any", async () => {
      const [registerActionStub] = setups.handleDidRenameFiles2();

      await workspaceAny.handleDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("handleDidFileSave", () => {
    it(`1: should registerAction method be invoked which register
        update action if file or directory has been renamed and
        exists in workspace`, async () => {
      const [registerActionStub] = setups.handleDidFileSave1();
      await workspaceAny.handleDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`2: should do nothing if file or directory has been
        renamed but does not exist in workspace`, async () => {
      const [registerActionStub] = setups.handleDidFileSave2();
      await workspaceAny.handleDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("handleDidFileFolderCreate", () => {
    it("1: should registerAction method be invoked which register update action", async () => {
      const [registerActionStub] = setups.handleDidFileFolderCreate1();
      await workspaceAny.handleDidFileFolderCreate(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });
  });

  describe("handleDidFileFolderDelete", () => {
    it("1: should registerAction method be invoked which register remove action", async () => {
      const [registerActionStub] = setups.handleDidFileFolderDelete1();
      await workspaceAny.handleDidFileFolderDelete(getItem());

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
