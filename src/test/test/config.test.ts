import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Config from "../../config";
import { getCacheStub, getConfiguration } from "../util/mockFactory";
import Cache from "../../cache";

describe("Config", () => {
  let config: Config;
  let configAny: any;
  let cacheStub: Cache;
  let getConfigurationStub: sinon.SinonStub;
  let configuration: { [key: string]: any };

  before(() => {
    cacheStub = getCacheStub();
    config = new Config(cacheStub);
    configuration = getConfiguration();
  });

  beforeEach(() => {
    getConfigurationStub = sinon
      .stub(vscode.workspace, "getConfiguration")
      .returns({
        get: (section: string) =>
          section.split(".").reduce((cfg, key) => cfg[key], configuration),
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve(),
      });

    configAny = config as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should config be initialized", () => {
      config = new Config(cacheStub);

      assert.exists(config);
    });
  });

  describe("shouldDisplayNotificationInStatusBar", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldDisplayNotificationInStatusBar";

      assert.equal(
        config.shouldDisplayNotificationInStatusBar(),
        configuration[section][key]
      );
    });
  });

  describe("shouldInitOnStartup", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldInitOnStartup";

      assert.equal(config.shouldInitOnStartup(), configuration[section][key]);
    });
  });

  describe("shouldHighlightSymbol", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldHighlightSymbol";

      assert.equal(config.shouldHighlightSymbol(), configuration[section][key]);
    });
  });

  describe("shouldUseDebounce", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseDebounce";

      assert.equal(config.shouldUseDebounce(), configuration[section][key]);
    });
  });

  describe("getIcons", () => {
    it("should return object containing icons from configuration", () => {
      const section = "searchEverywhere";
      const key = "icons";

      assert.equal(config.getIcons(), configuration[section][key]);
    });
  });

  describe("getItemsFilter", () => {
    it("should return object containing items filter from configuration", () => {
      const section = "searchEverywhere";
      const key = "itemsFilter";

      assert.equal(config.getItemsFilter(), configuration[section][key]);
    });
  });

  describe("shouldUseItemsFilterPhrases", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseItemsFilterPhrases";

      assert.equal(
        config.shouldUseItemsFilterPhrases(),
        configuration[section][key]
      );
    });
  });

  describe("getItemsFilterPhrases", () => {
    it("should return object containing items filter phrases from configuration", () => {
      const section = "searchEverywhere";
      const key = "itemsFilterPhrases";

      assert.equal(config.getItemsFilterPhrases(), configuration[section][key]);
    });
  });

  describe("getExclude", () => {
    it("should return array of exclude patterns from configuration", () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(config.getExclude(), configuration[section][key]);
    });
  });

  describe("getInclude", () => {
    it("should return array of include patterns from configuration", () => {
      const section = "searchEverywhere";
      const key = "include";

      assert.equal(config.getInclude(), configuration[section][key]);
    });
  });

  describe("shouldUseFilesAndSearchExclude", () => {
    it("should return boolean from configuration", () => {
      const section = "searchEverywhere";
      const key = "shouldUseFilesAndSearchExclude";

      assert.equal(
        config.shouldUseFilesAndSearchExclude(),
        configuration[section][key]
      );
    });
  });

  describe("getFilesAndSearchExclude", () => {
    it("should return array of exclude patterns from configuration", () => {
      assert.deepEqual(config.getFilesAndSearchExclude(), [
        "**/.git",
        "**/search_exclude/**",
      ]);
    });
  });

  describe("getFilesExclude", () => {
    it("should return array of exclude patterns from configuration", () => {
      const section = "files";
      const key = "exclude";

      assert.equal(configAny.getFilesExclude(), configuration[section][key]);
    });
  });

  describe("getSearchExclude", () => {
    it("should return array of exclude patterns from configuration", () => {
      const section = "search";
      const key = "exclude";

      assert.equal(configAny.getSearchExclude(), configuration[section][key]);
    });
  });

  describe("get", () => {
    it(`should return array of exclude patterns
      from configuration if cache is empty`, () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(configAny.get(key, []), configuration[section][key]);
    });

    it(`should return array of exclude patterns
      from cache if it is not empty`, () => {
      const section = "searchEverywhere";
      const key = "exclude";

      const getConfigByKeyStub = sinon
        .stub(configAny.cache, "getConfigByKey")
        .returns(configuration[section][key]);

      assert.equal(configAny.get(key, []), configuration[section][key]);
      assert.equal(getConfigByKeyStub.calledOnce, true);
      assert.equal(getConfigurationStub.calledOnce, false);
    });

    it("should get configuration from custom section", () => {
      const section = "customSection";
      const key = "exclude";

      assert.equal(
        configAny.get(key, [], section),
        configuration[section][key]
      );
    });
  });

  describe("getConfigurationByKey", () => {
    it("should return array of exclude patterns", () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(
        configAny.getConfigurationByKey(key, []),
        configuration[section][key]
      );
    });

    it("should get configuration from custom section", () => {
      const section = "customSection";
      const key = "exclude";

      assert.equal(
        configAny.getConfigurationByKey(key, [], section),
        configuration[section][key]
      );
    });
  });

  describe("getConfiguration", () => {
    it("should return array of exclude patterns", () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(
        configAny.getConfiguration(`${section}.${key}`, []),
        configuration[section][key]
      );
    });
  });
});
