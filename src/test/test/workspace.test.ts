import * as vscode from "vscode";
import { assert } from "chai";
import { getProgress } from "../util/mockFactory";
import {
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
  getTextDocumentChangeEvent,
  getFileRenameEvent,
} from "../util/eventMockFactory";
import {
  getQpItems,
  getQpItemsSymbolAndUriExt,
} from "../util/qpItemMockFactory";
import { getItems, getItem, getDirectory } from "../util/itemMockFactory";
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
    it(`1: should registerAction method be invoked
      which register rebuild action`, async () => {
      const [registerStub] = setups.index1();
      await workspaceAny.index();

      assert.equal(registerStub.calledOnce, true);
      assert.equal(registerStub.args[0][0].type, ActionType.Rebuild);
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
    });
  });

  describe("getData", () => {
    it("1: should cache.getData method be invoked", () => {
      const [getDataStub] = setups.getData1();

      workspace.getData();
      assert.equal(getDataStub.calledOnce, true);
    });
  });

  describe("indexWithProgress", () => {
    it(`1: should vscode.window.withProgress method be invoked
      if workspace has opened at least one folder`, async () => {
      const [withProgressStub] = setups.indexWithProgress1();

      await workspaceAny.indexWithProgress();
      assert.equal(withProgressStub.calledOnce, true);
    });

    it(`2: should printNoFolderOpenedMessage method be invoked
      if workspace does not has opened at least one folder`, async () => {
      const [printNoFolderOpenedMessageStub] = setups.indexWithProgress2();

      await workspaceAny.indexWithProgress();
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });
  });

  describe("indexWithProgressTask", () => {
    it(`1: should existing onDidItemIndexed subscription be disposed`, async () => {
      const {
        onDidItemIndexedSubscription,
        stubs,
      } = setups.indexWithProgressTask1();
      const [onDidItemIndexedStub] = stubs;
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceAny.indexWithProgressTask(
        undefined,
        cancellationTokenSource.token
      );

      assert.equal(onDidItemIndexedStub.calledOnce, true);
      assert.equal(onDidItemIndexedSubscription.dispose.calledOnce, true);
    });

    it(`2: should utils.sleep method be invoked`, async () => {
      const [sleepStub] = setups.indexWithProgressTask2();
      const cancellationTokenSource = new vscode.CancellationTokenSource();

      await workspaceAny.indexWithProgressTask(
        undefined,
        cancellationTokenSource.token
      );

      assert.equal(sleepStub.calledOnce, true);
    });
  });

  describe("indexWorkspace", () => {
    it("1: should reset cache to initial empty state", async () => {
      const [clearStub] = setups.indexWorkspace1();

      await workspaceAny.indexWorkspace();
      assert.equal(clearStub.calledOnce, true);
    });

    it("2: should index all workspace files", async () => {
      const [downloadDataStub] = setups.indexWorkspace2();

      await workspaceAny.indexWorkspace();
      assert.equal(downloadDataStub.calledOnce, true);
    });

    it("3: should update cache with indexed workspace files", async () => {
      const [updateDataStub] = setups.indexWorkspace3();

      await workspaceAny.indexWorkspace();
      assert.equal(updateDataStub.calledWith(getQpItems()), true);
    });
  });

  describe("downloadData", () => {
    it("1: should return data for quick pick", async () => {
      setups.downloadData1();

      assert.deepEqual(await workspaceAny.downloadData(), getQpItems());
    });
  });

  describe("updateCacheByPath", () => {
    it(`1: should remove old data for given uri and get
      new data if exists in workspace`, async () => {
      const [updateDataStub] = setups.updateCacheByPath1();

      await workspaceAny.updateCacheByPath(getItem());

      assert.equal(updateDataStub.calledTwice, true);
      assert.deepEqual(updateDataStub.args[1][0], getQpItemsSymbolAndUriExt());
    });

    it(`2: should find items with old uris, replace the path
      with new uri after directory renaming`, async () => {
      const [downloadDataStub, updateDataStub] = setups.updateCacheByPath2();

      await workspaceAny.updateCacheByPath(getDirectory("./test/fake-files/"));

      assert.equal(
        downloadDataStub.calledWith(getItems(1, "./test/fake-files/")),
        true
      );
      assert.equal(updateDataStub.calledOnce, true);
      assert.equal(
        updateDataStub.calledWith(
          getQpItemsSymbolAndUriExt("./test/fake-files/")
        ),
        true
      );
    });

    it(`3: should do nothing if for given directory uri
      there is not any item for replace the path`, async () => {
      const [updateDataStub] = setups.updateCacheByPath3();

      await workspaceAny.updateCacheByPath(getDirectory("./test/fake-files/"));
      assert.equal(updateDataStub.called, false);
    });

    it(`4: should index method be invoked which
      register rebuild action if error is thrown`, async () => {
      const [indexStub] = setups.updateCacheByPath4();

      await workspaceAny.updateCacheByPath(getItem());
      assert.equal(indexStub.calledOnce, true);
    });
  });

  describe("removeFromCacheByPath", () => {
    it("1: should do nothing if getData method returns undefined", async () => {
      const [updateDataStub] = setups.removeFromCacheByPath1();

      await workspaceAny.removeFromCacheByPath(getItem());
      assert.equal(updateDataStub.called, false);
    });

    it("2: should remove given item from stored data", async () => {
      const [updateDataStub] = setups.removeFromCacheByPath2();

      await workspaceAny.removeFromCacheByPath(getItem());
      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it(`3: should remove items from stored data for
      given renamed directory uri`, async () => {
      const [updateDataStub] = setups.removeFromCacheByPath3();

      await workspaceAny.removeFromCacheByPath(getDirectory("./fake/"));
      assert.equal(updateDataStub.calledWith([]), true);
    });
  });

  describe("mergeWithDataFromCache", () => {
    it("1: should return QuickPickItem[] containing merged cached and given data", () => {
      setups.mergeWithDataFromCache1();

      assert.deepEqual(
        workspaceAny.mergeWithDataFromCache(getQpItems(1, undefined, 2)),
        getQpItems(3)
      );
    });

    it("2: should return QuickPickItem[] containing given data if cache is empty", () => {
      setups.mergeWithDataFromCache2();

      assert.deepEqual(
        workspaceAny.mergeWithDataFromCache(getQpItems(1)),
        getQpItems(1)
      );
    });
  });

  describe("cleanDirectoryRenamingData", () => {
    it("1: should variables values related to directory renaming be set to undefined", () => {
      setups.cleanDirectoryRenamingData1();
      workspaceAny.cleanDirectoryRenamingData();

      assert.equal(workspaceAny.directoryUriBeforePathUpdate, undefined);
      assert.equal(workspaceAny.urisForDirectoryPathUpdate, undefined);
    });
  });

  describe("registerAction", () => {
    it("1: should actionProcessor.register method be invoked", async () => {
      const [registerStub] = setups.registerAction1();

      await workspaceAny.registerAction(
        ActionType.Rebuild,
        () => {},
        "test comment"
      );

      assert.equal(registerStub.calledOnce, true);
      assert.equal(registerStub.args[0][0].type, ActionType.Rebuild);
    });
  });

  describe("resetProgress", () => {
    it("1: should variables values related to indexing progress be set to 0", () => {
      setups.resetProgress1();
      workspaceAny.resetProgress();

      assert.equal(workspaceAny.progressStep, 0);
      assert.equal(workspaceAny.currentProgressValue, 0);
    });
  });

  describe("initComponents", () => {
    it("1: should init components", async () => {
      workspaceAny.initComponents();

      assert.equal(typeof workspaceAny.dataService, "object");
      assert.equal(typeof workspaceAny.dataConverter, "object");
      assert.equal(typeof workspaceAny.actionProcessor, "object");
    });
  });

  describe("reloadComponents", () => {
    it("1: should components reload methods be invoked", async () => {
      const [
        dataConverterReloadStub,
        dataServiceReloadStub,
      ] = setups.reloadComponents1();
      workspaceAny.reloadComponents();

      assert.equal(dataConverterReloadStub.calledOnce, true);
      assert.equal(dataServiceReloadStub.calledOnce, true);
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

  describe("onCancellationRequested", () => {
    it(`1: should dataService.cancel, dataConverter.cancel methods be invoked`, async () => {
      const [
        dataServiceCancelStub,
        dataConverterCancelStub,
      ] = setups.onCancellationRequested1();
      await workspaceAny.onCancellationRequested();

      assert.equal(dataServiceCancelStub.calledOnce, true);
      assert.equal(dataConverterCancelStub.calledOnce, true);
    });
  });

  describe("onDidItemIndexed", () => {
    it("1: should increase progress with message", () => {
      const progress = getProgress(1);
      workspaceAny.onDidItemIndexed(progress, 20);

      assert.equal(
        progress.report.calledWith({
          increment: 5,
          message: " 5%",
        }),
        true
      );
    });

    it("2: should increase progress with empty message", () => {
      const progress = getProgress();
      workspaceAny.onDidItemIndexed(progress, 20);

      assert.equal(
        progress.report.calledWith({
          increment: 5,
          message: " ",
        }),
        true
      );
    });

    it("3: should calculate and set progress step if is empty", () => {
      const progress = getProgress();
      workspaceAny.onDidItemIndexed(progress, 20);

      assert.equal(workspaceAny.progressStep, 5);
    });

    it("4: should omit calculating progress step if is already done", () => {
      setups.onDidItemIndexed4();
      const progress = getProgress();
      workspaceAny.onDidItemIndexed(progress, 20);

      assert.equal(workspaceAny.progressStep, 1);
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
