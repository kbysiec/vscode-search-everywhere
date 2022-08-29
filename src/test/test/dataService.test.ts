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
    it("1: should fetchConfig method be invoked", () => {
      const [fetchConfigStub] = setups.reload1();
      dataService.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("cancel", () => {
    it("1: should setCancelled method be invoked with true parameter", () => {
      const [setCancelledStub] = setups.cancel1();
      dataService.cancel();

      assert.equal(setCancelledStub.calledOnce, true);
      assert.equal(setCancelledStub.calledWith(true), true);
    });
  });

  describe("fetchData", () => {
    it(`1: should return workspace data when exclude patterns array is empty`, async () => {
      setups.fetchData1();
      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });

    it(`2: should return array of vscode.Uri or vscode.DocumentSymbol
      items with workspace data when exclude patterns array contains
      one element`, async () => {
      setups.fetchData2();
      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });

    it(`3: should return array of vscode.Uri or vscode.DocumentSymbol
      items with workspace data when exclude patterns array contains
      more than one element`, async () => {
      setups.fetchData3();
      const items = await dataService.fetchData();

      assert.equal(items.count, 4);
    });

    it("4: should utils.printErrorMessage method be invoked if error is thrown", async () => {
      const [printErrorMessageStub] = setups.fetchData4();
      await dataService.fetchData();

      assert.equal(printErrorMessageStub.calledOnce, true);
    });

    it("5: should return array of vscode.Uri items (given uris param is an array with items)", async () => {
      setups.fetchData5();
      const items = await dataService.fetchData(getItems());
      assert.equal(items.count, 4);
    });

    it(`6: should repeat trial to get symbols for file if returned undefined`, async () => {
      const [getSymbolsForUriStub] = setups.fetchData6();
      await dataService.fetchData();

      assert.equal(getSymbolsForUriStub.callCount, 10);
    });

    it(`7: should return empty array of items with workspace data if fetching is canceled`, async () => {
      setups.fetchData7();
      const items = await dataService.fetchData();

      assert.equal(items.count, 0);
    });

    it(`8: should return array of items filtered by itemsFilter with defined allowed kinds`, async () => {
      setups.fetchData8();
      const items = await dataService.fetchData();

      assert.equal(items.count, 1);
    });

    it(`9: should return array of items filtered by itemsFilter with defined ignored kinds`, async () => {
      setups.fetchData9();
      const items = await dataService.fetchData();

      assert.equal(items.count, 1);
    });

    it(`10: should return array of items filtered by itemsFilter with defined ignored names`, async () => {
      setups.fetchData10();
      const items = await dataService.fetchData();

      assert.equal(items.count, 0);
    });

    it(`11: should not include uri if already exists in elements`, async () => {
      setups.fetchData11();
      const items = await dataService.fetchData();

      assert.equal(items.count, 3);
    });
  });

  describe("isUriExistingInWorkspace", () => {
    it("1: should return true if uri exists in workspace", async () => {
      setups.isUriExistingInWorkspace1();

      const item = getItem();
      assert.equal(await dataService.isUriExistingInWorkspace(item), true);
    });

    it("2: should return false if uri does not exist in workspace", async () => {
      setups.isUriExistingInWorkspace2();

      const item = getItem("./test/path/to/workspace");
      assert.equal(await dataService.isUriExistingInWorkspace(item), false);
    });
  });

  describe("getIsCancelled", () => {
    it("1: should return state of isCancelled flag", () => {
      dataService.setIsCancelled(true);
      assert.equal(dataService.getIsCancelled(), true);
    });
  });

  describe("fetchConfig", () => {
    it("1: should fetch items filter", () => {
      const itemsFilter = setups.fetchConfig1();
      dataService.fetchConfig();
      assert.equal(dataService.getItemsFilter(), itemsFilter);
    });

    it("2: should patternProvider.fetchConfig method be invoked", () => {
      const [patternProviderFetchConfigStub] = setups.fetchConfig2();
      dataService.fetchConfig();
      assert.equal(patternProviderFetchConfigStub.calledOnce, true);
    });
  });
});
