import { assert } from "chai";
import { dataConverter } from "../../dataConverter";
import { getTestSetups } from "../testSetup/dataConverter.testSetup";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("DataConverter", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("reload", () => {
    it("1: should fetchConfig method be invoked", () => {
      const [fetchConfigStub] = setups.reload1();
      dataConverter.reload();

      assert.equal(fetchConfigStub.calledOnce, true);
    });
  });

  describe("cancel", () => {
    it("1: should setCancelled method be invoked with true parameter", () => {
      const [setCancelledStub] = setups.cancel1();
      dataConverter.cancel();

      assert.equal(setCancelledStub.calledOnce, true);
      assert.equal(setCancelledStub.calledWith(true), true);
    });
  });

  describe("convertToQpData", () => {
    it("1: should return quick pick data - without icons and filter phrases", () => {
      const { workspaceData, qpItems } = setups.convertToQpData1();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });

    it("2: should return quick pick data - with icons and filter phrases", () => {
      const { workspaceData, qpItems } = setups.convertToQpData2();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });

    it("3: should return empty array", () => {
      const { workspaceData, qpItems } = setups.convertToQpData3();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });

    it("4: should return empty array if isCancelled equal to true", () => {
      const { workspaceData, qpItems } = setups.convertToQpData4();
      assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
    });
  });

  describe("fetchConfig", () => {
    it("1: should fetch icons", () => {
      const icons = setups.fetchConfig1();
      dataConverter.fetchConfig();
      assert.equal(dataConverter.getIcons(), icons);
    });

    it("2: should fetch shouldUseItemsFilterPhrases flag", () => {
      const shouldUseItemsFilterPhrases = setups.fetchConfig2();
      dataConverter.fetchConfig();
      assert.equal(
        dataConverter.getShouldUseItemsFilterPhrases(),
        shouldUseItemsFilterPhrases
      );
    });

    it("3: should fetch items filter phrases", () => {
      const itemsFilterPhrases = setups.fetchConfig3();
      dataConverter.fetchConfig();
      assert.equal(dataConverter.getItemsFilterPhrases(), itemsFilterPhrases);
    });
  });
});
