import { assert } from "chai";
import { dataService } from "../../dataService";
import { getTestSetups } from "../testSetup/dataService.testSetup";
import { getItem, getItems } from "../util/itemMockFactory";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("DataService", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("reload", () => {
    it("should fetchConfig method be invoked", () => {
      const [fetchConfigStub] = setups.reload.setupForFetchingConfig();
      dataService.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("cancel", () => {
    it("should setCancelled method be invoked with true parameter", () => {
      const [setCancelledStub] = setups.cancel.setupForSettingCancelledFlag();
      dataService.cancel();

      assert.equal(setCancelledStub.calledOnce, true);
      assert.equal(setCancelledStub.calledWith(true), true);
    });
  });

  describe("fetchData", () => {
    it("should return workspace data when exclude patterns array is empty", async () => {
      setups.fetchData.setupForReturningWorkspaceDataWithEmptyExcludePatterns();
      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });

    it("should return array of vscode.Uri or vscode.DocumentSymbol items with workspace data when exclude patterns array contains one element", async () => {
      setups.fetchData.setupForReturningWorkspaceDataWithSingleExcludePattern();
      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });

    it("should return array of vscode.Uri or vscode.DocumentSymbol items with workspace data when exclude patterns array contains more than one element", async () => {
      setups.fetchData.setupForReturningWorkspaceDataWithMultipleExcludePatterns();
      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });

    it("should utils.printErrorMessage method be invoked if error is thrown", async () => {
      const [printErrorMessageStub] =
        setups.fetchData.setupForPrintingErrorMessageWhenErrorThrown();
      await dataService.fetchData();

      assert.equal(printErrorMessageStub.calledOnce, true);
    });

    it("should return array of vscode.Uri items (given uris param is an array with items)", async () => {
      setups.fetchData.setupForReturningUriItemsWhenUrisParamProvided();
      const items = await dataService.fetchData(getItems());
      assert.equal(items.count, 4);
    });

    it("should repeat trial to get symbols for file if returned undefined", async () => {
      const [getSymbolsForUriStub] =
        setups.fetchData.setupForRetryingSymbolsFetchWhenUndefinedReturned();
      await dataService.fetchData();

      assert.equal(getSymbolsForUriStub.callCount, 10);
    });

    it("should return empty array of items with workspace data if fetching is canceled", async () => {
      setups.fetchData.setupForReturningEmptyArrayWhenFetchingCancelled();
      const items = await dataService.fetchData();

      assert.equal(items.count, 0);
    });

    it("should return array of items filtered by itemsFilter with defined allowed kinds", async () => {
      setups.fetchData.setupForFilteringItemsByAllowedKinds();
      const items = await dataService.fetchData();

      assert.equal(items.count, 1);
    });

    it("should return array of items filtered by itemsFilter with defined ignored kinds", async () => {
      setups.fetchData.setupForFilteringItemsByIgnoredKinds();
      const items = await dataService.fetchData();

      assert.equal(items.count, 1);
    });

    it("should return array of items filtered by itemsFilter with defined ignored names", async () => {
      setups.fetchData.setupForFilteringItemsByIgnoredNames();
      const items = await dataService.fetchData();

      assert.equal(items.count, 0);
    });

    it("should not include uri if already exists in elements", async () => {
      setups.fetchData.setupForExcludingExistingUrisFromElements();
      const items = await dataService.fetchData();

      assert.equal(items.count, 3);
    });
  });

  describe("isUriExistingInWorkspace", () => {
    it("should return true if uri exists in workspace", async () => {
      setups.isUriExistingInWorkspace.setupForReturningTrueWhenUriExists();

      const item = getItem();
      assert.equal(await dataService.isUriExistingInWorkspace(item), true);
    });

    it("should return false if uri does not exist in workspace", async () => {
      setups.isUriExistingInWorkspace.setupForReturningFalseWhenUriDoesNotExist();

      const item = getItem("./test/path/to/workspace");
      assert.equal(await dataService.isUriExistingInWorkspace(item), false);
    });
  });

  describe("getIsCancelled", () => {
    it("should return state of isCancelled flag", () => {
      dataService.setIsCancelled(true);
      assert.equal(dataService.getIsCancelled(), true);
    });
  });

  describe("fetchConfig", () => {
    it("should fetch items filter", () => {
      const itemsFilter = setups.fetchConfig.setupForFetchingItemsFilter();
      dataService.fetchConfig();
      assert.equal(dataService.getItemsFilter(), itemsFilter);
    });

    it("should patternProvider.fetchConfig method be invoked", () => {
      const [patternProviderFetchConfigStub] =
        setups.fetchConfig.setupForInvokingPatternProviderFetchConfig();
      dataService.fetchConfig();
      assert.equal(patternProviderFetchConfigStub.calledOnce, true);
    });
  });
});
