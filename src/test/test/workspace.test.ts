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

  describe("onDidChangeConfiguration", () => {
    it(`1: should index method be invoked which register
        rebuild action if extension configuration has changed`, async () => {
      const [indexStub] = setups.onDidChangeConfiguration1();

      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it(`2: should index method be invoked which register
      rebuild action if isDebounceConfigurationToggled is true`, async () => {
      const eventEmitter = setups.onDidChangeConfiguration2();

      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("3: should do nothing if extension configuration has not changed", async () => {
      const [
        registerActionStub,
        onDidDebounceConfigToggleEventEmitterStub,
      ] = setups.onDidChangeConfiguration3();

      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
      assert.equal(onDidDebounceConfigToggleEventEmitterStub.calledOnce, false);
    });

    it("4: should cache.clearConfig method be invoked", async () => {
      const [clearConfigStub] = setups.onDidChangeConfiguration4();

      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(clearConfigStub.calledOnce, true);
    });
  });

  describe("onDidChangeWorkspaceFolders", () => {
    it(`1: should index method be invoked which register
        rebuild action if amount of opened folders in workspace has changed`, async () => {
      const [indexStub] = setups.onDidChangeWorkspaceFolders1();

      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it("2: should do nothing if extension configuration has not changed", async () => {
      const [registerActionStub] = setups.onDidChangeWorkspaceFolders2();
      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidChangeTextDocument", () => {
    it(`1: should registerAction method be invoked which register update
        action if text document has changed and exists in workspace`, async () => {
      const [registerActionStub] = setups.onDidChangeTextDocument1();
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`2: should do nothing if text document does not exist in workspace`, async () => {
      const [registerActionStub] = setups.onDidChangeTextDocument2();
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });

    it(`3: should do nothing if text document has not changed`, async () => {
      const [registerActionStub] = setups.onDidChangeTextDocument3();
      const textDocumentChangeEvent = await getTextDocumentChangeEvent();
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidRenameFiles", () => {
    it(`1: should registerAction method be invoked which register remove
        action if workspace contains more than one folder`, async () => {
      const [registerActionStub] = setups.onDidRenameFiles1();

      await workspaceAny.onDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });

    it("2: should do nothing if workspace contains either one folder or any", async () => {
      const [registerActionStub] = setups.onDidRenameFiles2();

      await workspaceAny.onDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidFileSave", () => {
    it(`1: should registerAction method be invoked which register
        update action if file or directory has been renamed and
        exists in workspace`, async () => {
      const [registerActionStub] = setups.onDidFileSave1();
      await workspaceAny.onDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`2: should do nothing if file or directory has been
        renamed but does not exist in workspace`, async () => {
      const [registerActionStub] = setups.onDidFileSave2();
      await workspaceAny.onDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidFileFolderCreate", () => {
    it("1: should registerAction method be invoked which register update action", async () => {
      const [registerActionStub] = setups.onDidFileFolderCreate1();
      await workspaceAny.onDidFileFolderCreate(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });
  });

  describe("onDidFileFolderDelete", () => {
    it("1: should registerAction method be invoked which register remove action", async () => {
      const [registerActionStub] = setups.onDidFileFolderDelete1();
      await workspaceAny.onDidFileFolderDelete(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });
  });

  describe("onWillActionProcessorProcessing", () => {
    it("1: should onWillProcessing event be emitted", () => {
      const eventEmitter = setups.onWillActionProcessorProcessing1();
      workspaceAny.onWillActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("onDidActionProcessorProcessing", () => {
    it("1: should onDidProcessing event be emitted", () => {
      const eventEmitter = setups.onDidActionProcessorProcessing1();
      workspaceAny.onDidActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("onWillActionProcessorExecuteAction", () => {
    it("1: should onWillExecuteAction event be emitted", () => {
      const eventEmitter = setups.onWillActionProcessorExecuteAction1();
      workspaceAny.onWillActionProcessorExecuteAction();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });
});
