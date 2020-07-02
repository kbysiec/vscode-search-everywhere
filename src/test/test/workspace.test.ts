import * as vscode from "vscode";
import * as sinon from "sinon";
import { assert } from "chai";
import {
  getWorkspaceData,
  getSubscription,
  getProgress,
  getEventEmitter,
  getConfiguration,
} from "../util/mockFactory";
import {
  getFileWatcherStub,
  getConfigurationChangeEvent,
  getWorkspaceFoldersChangeEvent,
  getTextDocumentChangeEvent,
  getFileRenameEvent,
} from "../util/eventMockFactory";
import {
  getQpItems,
  getQpItemsSymbolAndUri,
  getQpItemsSymbolAndUriExt,
  getQpItem,
} from "../util/qpItemMockFactory";
import { getItems, getItem, getDirectory } from "../util/itemMockFactory";
import { getCacheStub, getUtilsStub, getConfigStub } from "../util/stubFactory";
import ActionType from "../../enum/actionType";
import Cache from "../../cache";
import Utils from "../../utils";
import Config from "../../config";
import Workspace from "../../workspace";

describe("Workspace", () => {
  let workspace: Workspace;
  let workspaceAny: any;
  let cacheStub: Cache;
  let utilsStub: Utils;
  let configStub: Config;

  let stubDataServiceConfig = () => {
    const configuration = getConfiguration().searchEverywhere;
    sinon
      .stub(workspaceAny.dataService, "includePatterns")
      .value(configuration.include);
    sinon
      .stub(workspaceAny.dataService, "excludePatterns")
      .value(configuration.exclude);
  };

  before(() => {
    cacheStub = getCacheStub();
    utilsStub = getUtilsStub();
    configStub = getConfigStub();
    workspace = new Workspace(cacheStub, utilsStub, configStub);
  });

  beforeEach(() => {
    workspaceAny = workspace as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("index", () => {
    it(`should registerAction method be invoked
      which register rebuild action`, async () => {
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.index();

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Rebuild);
    });
  });

  describe("registerEventListeners", () => {
    it("should register workspace event listeners", () => {
      const onDidChangeConfigurationStub = sinon.stub(
        vscode.workspace,
        "onDidChangeConfiguration"
      );
      const onDidChangeWorkspaceFoldersStub = sinon.stub(
        vscode.workspace,
        "onDidChangeWorkspaceFolders"
      );
      const onDidChangeTextDocumentStub = sinon.stub(
        vscode.workspace,
        "onDidChangeTextDocument"
      );
      const fileWatcherStub = getFileWatcherStub();
      const createFileSystemWatcherStub = sinon
        .stub(vscode.workspace, "createFileSystemWatcher")
        .returns(fileWatcherStub);

      const onWillProcessingStub = sinon.stub(
        workspaceAny.actionProcessor,
        "onWillProcessing"
      );

      const onDidProcessingStub = sinon.stub(
        workspaceAny.actionProcessor,
        "onDidProcessing"
      );

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
    it("should cache.getData method be invoked", () => {
      const getDataStub = sinon
        .stub(workspaceAny.cache, "getData")
        .returns(Promise.resolve(getItems()));

      workspace.getData();

      assert.equal(getDataStub.calledOnce, true);
    });
  });

  describe("indexWithProgress", () => {
    it(`should vscode.window.withProgress method be invoked
      if workspace has opened at least one folder`, async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceAnyFolder").returns(true);
      const withProgressStub = sinon.stub(vscode.window, "withProgress");
      await workspaceAny.indexWithProgress();
      assert.equal(withProgressStub.calledOnce, true);
    });

    it(`should printNoFolderOpenedMessage method be invoked
      if workspace does not has opened at least one folder`, async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceAnyFolder").returns(false);
      const printNoFolderOpenedMessageStub = sinon.stub(
        workspaceAny.utils,
        "printNoFolderOpenedMessage"
      );
      await workspaceAny.indexWithProgress();
      assert.equal(printNoFolderOpenedMessageStub.calledOnce, true);
    });
  });

  describe("indexWithProgressTask", () => {
    it(`should index, resetProgress and utils.sleep methods be invoked`, async () => {
      const subscription = getSubscription();
      const onDidItemIndexedStub = sinon
        .stub(workspaceAny.dataService, "onDidItemIndexed")
        .returns(subscription);
      const indexWorkspaceStub = sinon.stub(workspaceAny, "indexWorkspace");
      const sleepStub = sinon.stub(workspaceAny.utils, "sleep");
      await workspaceAny.indexWithProgressTask();
      assert.equal(onDidItemIndexedStub.calledOnce, true);
      assert.equal(subscription.dispose.calledOnce, true);
      assert.equal(indexWorkspaceStub.calledOnce, true);
      assert.equal(sleepStub.calledOnce, true);
    });
  });

  describe("indexWorkspace", () => {
    it("should reset cache to initial empty state", async () => {
      stubDataServiceConfig();
      const clearStub = sinon.stub(workspaceAny.cache, "clear");
      await workspaceAny.indexWorkspace();

      assert.equal(clearStub.calledOnce, true);
    });

    it("should index all workspace files", async () => {
      const downloadDataStub = sinon.stub(workspaceAny, "downloadData");
      await workspaceAny.indexWorkspace();

      assert.equal(downloadDataStub.calledOnce, true);
    });

    it("should update cache with indexed workspace files", async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "downloadData").returns(getQpItems());
      await workspaceAny.indexWorkspace();

      assert.equal(updateDataStub.calledWith(getQpItems()), true);
    });
  });

  describe("downloadData", () => {
    it("should return data for quick pick", async () => {
      sinon.stub(workspaceAny.dataConverter, "icons").value({});
      sinon.stub(workspaceAny.dataConverter, "itemsFilterPhrases").value({});
      const items = getItems();
      sinon
        .stub(workspaceAny.dataService, "fetchData")
        .returns(Promise.resolve(getWorkspaceData(items)));

      assert.deepEqual(await workspaceAny.downloadData(), getQpItems());
    });
  });

  describe("updateCacheByPath", () => {
    it(`should remove old data for given uri and get
      new data if exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      sinon
        .stub(workspaceAny, "downloadData")
        .returns(Promise.resolve(getQpItemsSymbolAndUri()));
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      const getDataStub = sinon.stub(workspaceAny, "getData");
      getDataStub.onFirstCall().returns(getQpItems());
      getDataStub.onSecondCall().returns(getQpItems(1));

      await workspaceAny.updateCacheByPath(getItem());

      assert.equal(updateDataStub.calledTwice, true);
      assert.deepEqual(updateDataStub.args[1][0], getQpItemsSymbolAndUriExt());
    });

    it(`should find items with old uris, replace the path
      with new uri after directory renaming`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));

      workspaceAny.urisForDirectoryPathUpdate = getItems(1);
      workspaceAny.directoryUriBeforePathUpdate = getDirectory("./fake/");

      const downloadDataStub = sinon
        .stub(workspaceAny, "downloadData")
        .returns(Promise.resolve(getQpItemsSymbolAndUri("./test/fake-files/")));
      sinon.stub(workspaceAny, "getData").returns(getQpItems(1));
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");

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

    it(`should do nothing if for given directory uri
      there is not any item for replace the path`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");

      await workspaceAny.updateCacheByPath(getDirectory("./test/fake-files/"));

      assert.equal(updateDataStub.called, false);
    });

    it(`should index method be invoked which
      register rebuild action if error is thrown`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      sinon.stub(workspaceAny, "removeFromCacheByPath").throws("test error");
      const indexStub = sinon.stub(workspaceAny, "index");

      await workspaceAny.updateCacheByPath(getItem());

      assert.equal(indexStub.calledOnce, true);
    });
  });

  describe("removeFromCacheByPath", () => {
    it("should do nothing if getData method returns undefined", async () => {
      stubDataServiceConfig();
      sinon.stub(workspaceAny, "getData").returns(undefined);
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");

      await workspaceAny.removeFromCacheByPath(getItem());

      assert.equal(updateDataStub.called, false);
    });

    it("should remove given item from stored data", async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "getData").returns(getQpItems());
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));

      await workspaceAny.removeFromCacheByPath(getItem());

      assert.equal(
        updateDataStub.calledWith(getQpItems(1, undefined, 1)),
        true
      );
    });

    it(`should remove items from stored data for
      given renamed directory uri`, async () => {
      const updateDataStub = sinon.stub(workspaceAny.cache, "updateData");
      sinon.stub(workspaceAny, "getData").returns(getQpItems());
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));

      await workspaceAny.removeFromCacheByPath(getDirectory("./fake/"));

      assert.equal(updateDataStub.calledWith([]), true);
    });
  });

  describe("getUrisForDirectoryPathUpdate", () => {
    it(`should return uris containing renamed directory
      name and file symbol kind`, async () => {
      const qpItems = getQpItems();
      qpItems[1] = getQpItem("./test/fake-files/", 2);
      assert.deepEqual(
        await workspaceAny.getUrisForDirectoryPathUpdate(
          qpItems,
          getDirectory("./fake/")
        ),
        getItems(1, undefined, undefined, true)
      );
    });
  });

  describe("mergeWithDataFromCache", () => {
    it("should return QuickPickItem[] containing merged cached and given data", () => {
      sinon.stub(workspaceAny, "getData").returns(getQpItems());
      assert.deepEqual(
        workspaceAny.mergeWithDataFromCache(getQpItems(1, undefined, 2)),
        getQpItems(3)
      );
    });

    it("should return QuickPickItem[] containing given data if cache is empty", () => {
      sinon.stub(workspaceAny, "getData").returns(undefined);
      assert.deepEqual(
        workspaceAny.mergeWithDataFromCache(getQpItems(1)),
        getQpItems(1)
      );
    });
  });

  describe("updateUrisWithNewDirectoryName", () => {
    it("should return vscode.Uri[] with updated directory path", () => {
      assert.deepEqual(
        workspaceAny.updateUrisWithNewDirectoryName(
          getItems(),
          getDirectory("./fake/"),
          getDirectory("./test/fake-files/")
        ),
        getItems(2, "./test/fake-files/")
      );
    });

    it(`should return unchanged vscode.Uri[]
      if old directory path does not exist in workspace`, () => {
      assert.deepEqual(
        workspaceAny.updateUrisWithNewDirectoryName(
          getItems(),
          getDirectory("./fake/not-exist/"),
          getDirectory("./test/fake-files/")
        ),
        getItems(2, "./fake/")
      );
    });
  });

  describe("cleanDirectoryRenamingData", () => {
    it("should variables values related to directory renaming be set to undefined", () => {
      sinon
        .stub(workspaceAny, "directoryUriBeforePathUpdate")
        .value(getDirectory("#"));
      sinon.stub(workspaceAny, "urisForDirectoryPathUpdate").value(getItems());

      workspaceAny.cleanDirectoryRenamingData();

      assert.equal(workspaceAny.directoryUriBeforePathUpdate, undefined);
      assert.equal(workspaceAny.urisForDirectoryPathUpdate, undefined);
    });
  });

  describe("registerAction", () => {
    it("should actionProcessor.register method be invoked", async () => {
      const registerStub = sinon.stub(workspaceAny.actionProcessor, "register");

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
    it("should variables values related to indexing progress be set to 0", () => {
      sinon.stub(workspaceAny, "progressStep").value(15);
      sinon.stub(workspaceAny, "currentProgressValue").value(70);

      workspaceAny.resetProgress();

      assert.equal(workspaceAny.progressStep, 0);
      assert.equal(workspaceAny.currentProgressValue, 0);
    });
  });

  describe("getNotificationLocation", () => {
    it(`should return vscode.ProgressLocation.Window
      if shouldDisplayNotificationInStatusBar is true`, () => {
      sinon
        .stub(workspaceAny.config, "shouldDisplayNotificationInStatusBar")
        .returns(true);

      assert.equal(
        workspaceAny.getNotificationLocation(),
        vscode.ProgressLocation.Window
      );
    });

    it(`should return vscode.ProgressLocation.Window
      if shouldDisplayNotificationInStatusBar is false`, () => {
      sinon
        .stub(workspaceAny.config, "shouldDisplayNotificationInStatusBar")
        .returns(false);

      assert.equal(
        workspaceAny.getNotificationLocation(),
        vscode.ProgressLocation.Notification
      );
    });
  });

  describe("getNotificationTitle", () => {
    it(`should return string 'Indexing...'
      if shouldDisplayNotificationInStatusBar is true`, () => {
      sinon
        .stub(workspaceAny.config, "shouldDisplayNotificationInStatusBar")
        .returns(true);

      assert.equal(workspaceAny.getNotificationTitle(), "Indexing...");
    });

    it(`should return string 'Indexing workspace files and symbols...'
      if shouldDisplayNotificationInStatusBar is false`, () => {
      sinon
        .stub(workspaceAny.config, "shouldDisplayNotificationInStatusBar")
        .returns(false);

      assert.equal(
        workspaceAny.getNotificationTitle(),
        "Indexing workspace files and symbols..."
      );
    });
  });

  describe("initComponents", () => {
    it("should init components", async () => {
      workspaceAny.initComponents();

      assert.equal(typeof workspaceAny.dataService, "object");
      assert.equal(typeof workspaceAny.dataConverter, "object");
      assert.equal(typeof workspaceAny.actionProcessor, "object");
    });
  });

  describe("reloadComponents", () => {
    it("should components reload methods be invoked", async () => {
      const dataConverterReloadStub = sinon.stub(
        workspaceAny.dataConverter,
        "reload"
      );
      const dataServiceReloadStub = sinon.stub(
        workspaceAny.dataService,
        "reload"
      );
      workspaceAny.reloadComponents();

      assert.equal(dataConverterReloadStub.calledOnce, true);
      assert.equal(dataServiceReloadStub.calledOnce, true);
    });
  });

  describe("onDidChangeConfiguration", () => {
    it(`should index method be invoked which register
      rebuild action if extension configuration has changed`, async () => {
      sinon
        .stub(workspaceAny.utils, "shouldReindexOnConfigurationChange")
        .returns(true);
      const indexStub = sinon.stub(workspaceAny, "index");
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it(`should index method be invoked which register
    rebuild action if isDebounceConfigurationToggled is true`, async () => {
      sinon
        .stub(workspaceAny.utils, "shouldReindexOnConfigurationChange")
        .returns(false);
      sinon
        .stub(workspaceAny.utils, "isDebounceConfigurationToggled")
        .returns(true);
      const eventEmitter = getEventEmitter();
      sinon
        .stub(workspaceAny, "onDidDebounceConfigToggleEventEmitter")
        .value(eventEmitter);
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(eventEmitter.fire.calledOnce, true);
    });

    it("should do nothing if extension configuration has not changed", async () => {
      sinon
        .stub(workspaceAny.utils, "shouldReindexOnConfigurationChange")
        .returns(false);
      sinon
        .stub(workspaceAny.utils, "isDebounceConfigurationToggled")
        .returns(false);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      const onDidDebounceConfigToggleEventEmitterStub = sinon.stub(
        workspaceAny,
        "onDidDebounceConfigToggleEventEmitter"
      );
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
      assert.equal(onDidDebounceConfigToggleEventEmitterStub.calledOnce, false);
    });

    it("should cache.clearConfig method be invoked", async () => {
      const clearConfigStub = sinon.stub(workspaceAny.cache, "clearConfig");
      await workspaceAny.onDidChangeConfiguration(
        getConfigurationChangeEvent(true)
      );

      assert.equal(clearConfigStub.calledOnce, true);
    });
  });

  describe("onDidChangeWorkspaceFolders", () => {
    it(`should index method be invoked which register
      rebuild action if amount of opened folders in workspace has changed`, async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceChanged").returns(true);
      const indexStub = sinon.stub(workspaceAny, "index");
      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(true)
      );

      assert.equal(indexStub.calledOnce, true);
    });

    it("should do nothing if extension configuration has not changed", async () => {
      sinon.stub(workspaceAny.utils, "hasWorkspaceChanged").returns(false);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidChangeWorkspaceFolders(
        getWorkspaceFoldersChangeEvent(false)
      );

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidChangeTextDocument", () => {
    it(`should registerAction method be invoked which register update
      action if text document has changed and exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`should do nothing if text document does not exist in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent(true);
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });

    it(`should do nothing if text document has not changed`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      const textDocumentChangeEvent = await getTextDocumentChangeEvent();
      await workspaceAny.onDidChangeTextDocument(textDocumentChangeEvent);

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidRenameFiles", () => {
    it(`should registerAction method be invoked which register remove
      action if workspace contains more than one folder`, async () => {
      sinon
        .stub(workspaceAny.utils, "hasWorkspaceMoreThanOneFolder")
        .returns(true);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });

    it("should do nothing if workspace contains either one folder or any", async () => {
      sinon
        .stub(workspaceAny.utils, "hasWorkspaceMoreThanOneFolder")
        .returns(false);
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidRenameFiles(getFileRenameEvent());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidFileSave", () => {
    it(`should registerAction method be invoked which register
      update action if file or directory has been renamed and
      exists in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(true));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });

    it(`should do nothing if file or directory has been
      renamed but does not exist in workspace`, async () => {
      sinon
        .stub(workspaceAny.dataService, "isUriExistingInWorkspace")
        .returns(Promise.resolve(false));
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileSave(getItem());

      assert.equal(registerActionStub.calledOnce, false);
    });
  });

  describe("onDidFileFolderCreate", () => {
    it("should registerAction method be invoked which register update action", async () => {
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileFolderCreate(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Update);
    });
  });

  describe("onDidFileFolderDelete", () => {
    it("should registerAction method be invoked which register remove action", async () => {
      const registerActionStub = sinon.stub(workspaceAny, "registerAction");
      await workspaceAny.onDidFileFolderDelete(getItem());

      assert.equal(registerActionStub.calledOnce, true);
      assert.equal(registerActionStub.args[0][0], ActionType.Remove);
    });
  });

  describe("onDidItemIndexed", () => {
    it("should increase progress with message", () => {
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

    it("should increase progress with empty message", () => {
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

    it("should calculate and set progress step if is empty", () => {
      const progress = getProgress();

      workspaceAny.onDidItemIndexed(progress, 20);

      assert.equal(workspaceAny.progressStep, 5);
    });

    it("should omit calculating progress step if is already done", () => {
      sinon.stub(workspaceAny, "progressStep").value(1);
      const progress = getProgress();

      workspaceAny.onDidItemIndexed(progress, 20);

      assert.equal(workspaceAny.progressStep, 1);
    });
  });

  describe("onWillActionProcessorProcessing", () => {
    it("should onWillProcessing event be emitted", () => {
      const eventEmitter = getEventEmitter();
      sinon
        .stub(workspaceAny, "onWillProcessingEventEmitter")
        .value(eventEmitter);
      workspaceAny.onWillActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("onDidActionProcessorProcessing", () => {
    it("should onDidProcessing event be emitted", () => {
      const eventEmitter = getEventEmitter();
      sinon
        .stub(workspaceAny, "onDidProcessingEventEmitter")
        .value(eventEmitter);
      workspaceAny.onDidActionProcessorProcessing();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });

  describe("onWillActionProcessorExecuteAction", () => {
    it("should onWillExecuteAction event be emitted", () => {
      const eventEmitter = getEventEmitter();
      sinon
        .stub(workspaceAny, "onWillExecuteActionEventEmitter")
        .value(eventEmitter);
      workspaceAny.onWillActionProcessorExecuteAction();

      assert.equal(eventEmitter.fire.calledOnce, true);
    });
  });
});
