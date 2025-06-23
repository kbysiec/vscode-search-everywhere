import { assert } from "chai";
import { dataConverter } from "../../src/dataConverter";
import { getTestSetups } from "../testSetup/dataConverter.testSetup";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("DataConverter", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("reload", () => {
    it("should fetchConfig method be invoked", () => {
      const [fetchConfigStub] = setups.reload.setupForFetchingConfig();
      dataConverter.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("cancel", () => {
    it("should setCancelled method be invoked with true parameter", () => {
      const [setCancelledStub] = setups.cancel.setupForSettingCancelledFlag();
      dataConverter.cancel();

      assert.equal(setCancelledStub.calledOnce, true);
      assert.equal(setCancelledStub.calledWith(true), true);
    });
  });

  describe("convertToQpData", () => {
    it("should return quick pick data - without icons and filter phrases", () => {
      const { workspaceData, qpItems } =
        setups.convertToQpData.setupForConvertingWithoutIconsAndFilterPhrases();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });

    it("should return quick pick data - with icons and filter phrases", () => {
      const { workspaceData, qpItems } =
        setups.convertToQpData.setupForConvertingWithIconsAndFilterPhrases();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });

    it("should return empty array", () => {
      const { workspaceData, qpItems } =
        setups.convertToQpData.setupForReturningEmptyArray();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });

    it("should return empty array if isCancelled equal to true", () => {
      const { workspaceData, qpItems } =
        setups.convertToQpData.setupForReturningEmptyArrayWhenCancelled();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });
  });

  describe("fetchConfig", () => {
    it("should fetch icons", () => {
      const icons = setups.fetchConfig.setupForFetchingIcons();
      dataConverter.fetchConfig();
      assert.equal(dataConverter.getIcons(), icons);
    });

    it("should fetch shouldUseItemsFilterPhrases flag", () => {
      const shouldUseItemsFilterPhrases =
        setups.fetchConfig.setupForFetchingShouldUseItemsFilterPhrasesFlag();
      dataConverter.fetchConfig();
      assert.equal(
        dataConverter.getShouldUseItemsFilterPhrases(),
        shouldUseItemsFilterPhrases
      );
    });

    it("should fetch items filter phrases", () => {
      const itemsFilterPhrases =
        setups.fetchConfig.setupForFetchingItemsFilterPhrases();
      dataConverter.fetchConfig();
      assert.equal(dataConverter.getItemsFilterPhrases(), itemsFilterPhrases);
    });
  });
});
