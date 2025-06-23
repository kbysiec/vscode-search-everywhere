import { assert } from "chai";
import * as config from "../../src/config";
import { getTestSetups } from "../testSetup/config.testSetup";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("Config", () => {
  let configuration: { [key: string]: any };
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
    configuration = setups.before();
  });
  beforeEach(() => setups.beforeEach());
  afterEach(() => setups.afterEach());

  describe("fetchShouldDisplayNotificationInStatusBar", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldDisplayNotificationInStatusBar";

      assert.equal(
        config.fetchShouldDisplayNotificationInStatusBar(),
        configuration[section][key]
      );
    });
  });

  describe("fetchShouldInitOnStartup", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldInitOnStartup";

      assert.equal(
        config.fetchShouldInitOnStartup(),
        configuration[section][key]
      );
    });
  });

  describe("fetchShouldHighlightSymbol", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldHighlightSymbol";

      assert.equal(
        config.fetchShouldHighlightSymbol(),
        configuration[section][key]
      );
    });
  });

  describe("fetchShouldUseDebounce", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseDebounce";

      assert.equal(
        config.fetchShouldUseDebounce(),
        configuration[section][key]
      );
    });
  });

  describe("fetchIcons", () => {
    it("should return object containing icons from configuration", () => {
      const section = "searchEverywhere";
      const key = "icons";

      assert.equal(config.fetchIcons(), configuration[section][key]);
    });
  });

  describe("fetchItemsFilter", () => {
    it("should return object containing items filter from configuration", () => {
      const section = "searchEverywhere";
      const key = "itemsFilter";

      assert.equal(config.fetchItemsFilter(), configuration[section][key]);
    });
  });

  describe("fetchShouldUseItemsFilterPhrases", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseItemsFilterPhrases";

      assert.equal(
        config.fetchShouldUseItemsFilterPhrases(),
        configuration[section][key]
      );
    });
  });

  describe("fetchItemsFilterPhrases", () => {
    it("should return object containing items filter phrases from configuration", () => {
      const section = "searchEverywhere";
      const key = "itemsFilterPhrases";

      assert.equal(
        config.fetchItemsFilterPhrases(),
        configuration[section][key]
      );
    });
  });

  describe("fetchHelpPhrase", () => {
    it("should return help phrase from configuration", () => {
      const section = "searchEverywhere";
      const key = "helpPhrase";

      assert.equal(config.fetchHelpPhrase(), configuration[section][key]);
    });
  });

  describe("fetchShouldItemsBeSorted", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldItemsBeSorted";

      assert.equal(
        config.fetchShouldItemsBeSorted(),
        configuration[section][key]
      );
    });
  });

  describe("fetchShouldSearchSelection", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldSearchSelection";

      assert.equal(
        config.fetchShouldSearchSelection(),
        configuration[section][key]
      );
    });
  });

  describe("fetchExclude", () => {
    it("should return array of exclude patterns from configuration", () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(config.fetchExclude(), configuration[section][key]);
    });

    it("should return array of exclude patterns from cache if it is not empty", () => {
      const section = "searchEverywhere";
      const key = "exclude";
      const [getConfigurationStub] =
        setups.fetchExclude.setupForReturningFromCache(section, key);

      assert.deepEqual(config.fetchExclude(), configuration[section][key]);
      assert.equal(getConfigurationStub.calledOnce, false);
    });
  });

  describe("fetchInclude", () => {
    it("should return array of include pattern from configuration", () => {
      const section = "searchEverywhere";
      const key = "include";

      assert.equal(config.fetchInclude(), configuration[section][key]);
    });
  });

  describe("fetchFilesAndSearchExclude", () => {
    it("should return array of exclude patterns from configuration", () => {
      assert.deepEqual(config.fetchFilesAndSearchExclude(), [
        "**/.git",
        "**/search_exclude/**",
      ]);
    });
  });

  describe("fetchExcludeMode", () => {
    it("should return exclude mode from configuration", () => {
      const section = "searchEverywhere";
      const key = "excludeMode";

      assert.equal(config.fetchExcludeMode(), configuration[section][key]);
    });
  });

  describe("fetchShouldWorkspaceDataBeCached", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldWorkspaceDataBeCached";

      assert.equal(
        config.fetchShouldWorkspaceDataBeCached(),
        configuration[section][key]
      );
    });
  });

  describe("fetchShouldSearchSelection", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldSearchSelection";

      assert.equal(
        config.fetchShouldSearchSelection(),
        configuration[section][key]
      );
    });
  });
});
