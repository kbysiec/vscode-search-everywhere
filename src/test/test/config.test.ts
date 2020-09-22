import * as vscode from "vscode";
import * as sinon from "sinon";
import { assert } from "chai";
import { getCacheStub } from "../util/stubFactory";
import Config from "../../config";
import Cache from "../../cache";
import { getTestSetups } from "../testSetup/config.testSetup";

describe("Config", () => {
  let configuration: { [key: string]: any };
  let getConfigurationStub: sinon.SinonStub;
  let cacheStub: Cache = getCacheStub();
  let config: Config = new Config(cacheStub);
  let configAny: any;
  let setups = getTestSetups(config);

  beforeEach(() => {
    ({
      configuration,
      stubs: [getConfigurationStub],
    } = setups.beforeEach());
    cacheStub = getCacheStub();
    config = new Config(cacheStub);
    configAny = config as any;
    setups = getTestSetups(config);
  });

  afterEach(() => {
    (vscode.workspace.getConfiguration as sinon.SinonStub).restore();
  });

  describe("shouldDisplayNotificationInStatusBar", () => {
    it("1: should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldDisplayNotificationInStatusBar";

      assert.equal(
        config.shouldDisplayNotificationInStatusBar(),
        configuration[section][key]
      );
    });
  });

  describe("shouldInitOnStartup", () => {
    it("1: should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldInitOnStartup";

      assert.equal(config.shouldInitOnStartup(), configuration[section][key]);
    });
  });

  describe("shouldHighlightSymbol", () => {
    it("1: should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldHighlightSymbol";

      assert.equal(config.shouldHighlightSymbol(), configuration[section][key]);
    });
  });

  describe("shouldUseDebounce", () => {
    it("1: should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseDebounce";

      assert.equal(config.shouldUseDebounce(), configuration[section][key]);
    });
  });

  describe("getIcons", () => {
    it("1: should return object containing icons from configuration", () => {
      const section = "searchEverywhere";
      const key = "icons";

      assert.equal(config.getIcons(), configuration[section][key]);
    });
  });

  describe("getItemsFilter", () => {
    it("1: should return object containing items filter from configuration", () => {
      const section = "searchEverywhere";
      const key = "itemsFilter";

      assert.equal(config.getItemsFilter(), configuration[section][key]);
    });
  });

  describe("shouldUseItemsFilterPhrases", () => {
    it("1: should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseItemsFilterPhrases";

      assert.equal(
        config.shouldUseItemsFilterPhrases(),
        configuration[section][key]
      );
    });
  });

  describe("getItemsFilterPhrases", () => {
    it("1: should return object containing items filter phrases from configuration", () => {
      const section = "searchEverywhere";
      const key = "itemsFilterPhrases";

      assert.equal(config.getItemsFilterPhrases(), configuration[section][key]);
    });
  });

  describe("getExclude", () => {
    it("1: should return array of exclude patterns from configuration", () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(config.getExclude(), configuration[section][key]);
    });
  });

  describe("getInclude", () => {
    it("1: should return array of include pattern from configuration", () => {
      const section = "searchEverywhere";
      const key = "include";

      assert.equal(config.getInclude(), configuration[section][key]);
    });
  });

  describe("shouldUseFilesAndSearchExclude", () => {
    it("1: should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseFilesAndSearchExclude";

      assert.equal(
        config.shouldUseFilesAndSearchExclude(),
        configuration[section][key]
      );
    });
  });

  describe("getFilesAndSearchExclude", () => {
    it("1: should return array of exclude patterns from configuration", () => {
      assert.deepEqual(config.getFilesAndSearchExclude(), [
        "**/.git",
        "**/search_exclude/**",
      ]);
    });
  });

  describe("getFilesExclude", () => {
    it("1: should return array of exclude patterns from configuration", () => {
      const section = "files";
      const key = "exclude";

      assert.equal(configAny.getFilesExclude(), configuration[section][key]);
    });
  });

  describe("getSearchExclude", () => {
    it("1: should return array of exclude patterns from configuration", () => {
      const section = "search";
      const key = "exclude";

      assert.equal(configAny.getSearchExclude(), configuration[section][key]);
    });
  });

  describe("get", () => {
    it(`1: should return array of exclude patterns
      from configuration if cache is empty`, () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(configAny.get(key, []), configuration[section][key]);
    });

    it(`2: should return array of exclude patterns
      from cache if it is not empty`, () => {
      const section = "searchEverywhere";
      const key = "exclude";
      const [getConfigByKeyStub] = setups.get2(section, key);

      assert.deepEqual(configAny.get(key, []), configuration[section][key]);
      assert.equal(getConfigByKeyStub.calledOnce, true);
      assert.equal(getConfigurationStub.calledOnce, false);
    });

    it("3: should get configuration from custom section", () => {
      const section = "customSection";
      const key = "exclude";

      assert.equal(
        configAny.get(key, [], section),
        configuration[section][key]
      );
    });
  });

  describe("getConfigurationByKey", () => {
    it("1: should return array of exclude patterns", () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(
        configAny.getConfigurationByKey(key, []),
        configuration[section][key]
      );
    });

    it("2: should get configuration from custom section", () => {
      const section = "customSection";
      const key = "exclude";

      assert.equal(
        configAny.getConfigurationByKey(key, [], section),
        configuration[section][key]
      );
    });
  });

  describe("getConfiguration", () => {
    it("1: should return array of exclude patterns", () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(
        configAny.getConfiguration(`${section}.${key}`, []),
        configuration[section][key]
      );
    });
  });
});
