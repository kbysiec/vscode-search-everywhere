import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Config from "../../config";
import * as mock from "../mock/config.mock";
import { getCacheStub } from "../util/mockFactory";
import Cache from "../../cache";

describe("Config", () => {
  let config: Config;
  let configAny: any;
  let cacheStub: Cache;
  let getConfigurationStub: sinon.SinonStub;

  before(() => {
    cacheStub = getCacheStub();
    config = new Config(cacheStub);
  });

  beforeEach(() => {
    getConfigurationStub = sinon
      .stub(vscode.workspace, "getConfiguration")
      .returns({
        get: (section: string) =>
          section.split(".").reduce((cfg, key) => cfg[key], mock.configuration),
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
    it("should return boolean from configuration", async () => {
      const section = "searchEverywhere";
      const key = "shouldDisplayNotificationInStatusBar";

      assert.equal(
        config.shouldDisplayNotificationInStatusBar(),
        mock.configuration[section][key]
      );
    });
  });

  describe("shouldInitOnStartup", () => {
    it("should return boolean from configuration", async () => {
      const section = "searchEverywhere";
      const key = "shouldInitOnStartup";

      assert.equal(
        config.shouldInitOnStartup(),
        mock.configuration[section][key]
      );
    });
  });

  describe("shouldHighlightSymbol", () => {
    it("should return boolean from configuration", async () => {
      const section = "searchEverywhere";
      const key = "shouldHighlightSymbol";

      assert.equal(
        config.shouldHighlightSymbol(),
        mock.configuration[section][key]
      );
    });
  });

  describe("getExclude", () => {
    it("should return array of exclude patterns from configuration", async () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(config.getExclude(), mock.configuration[section][key]);
    });
  });

  describe("getInclude", () => {
    it("should return array of include patterns from configuration", async () => {
      const section = "searchEverywhere";
      const key = "include";

      assert.equal(config.getInclude(), mock.configuration[section][key]);
    });
  });

  describe("get", () => {
    it(`should return array of exclude patterns
      from configuration if cache is empty`, async () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(configAny.get(key, []), mock.configuration[section][key]);
    });

    it(`should return array of exclude patterns
      from cache if it is not empty`, async () => {
      const section = "searchEverywhere";
      const key = "exclude";

      const getConfigByKeyStub = sinon
        .stub(configAny.cache, "getConfigByKey")
        .returns(mock.configuration[section][key]);

      assert.equal(configAny.get(key, []), mock.configuration[section][key]);
      assert.equal(getConfigByKeyStub.calledOnce, true);
      assert.equal(getConfigurationStub.calledOnce, false);
    });

    it("should get configuration from custom section", async () => {
      const section = "customSection";
      const key = "exclude";

      assert.equal(
        configAny.get(key, [], section),
        mock.configuration[section][key]
      );
    });
  });

  describe("getConfigurationByKey", () => {
    it("should return array of exclude patterns", async () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(
        configAny.getConfigurationByKey(key, []),
        mock.configuration[section][key]
      );
    });

    it("should get configuration from custom section", async () => {
      const section = "customSection";
      const key = "exclude";

      assert.equal(
        configAny.getConfigurationByKey(key, [], section),
        mock.configuration[section][key]
      );
    });
  });

  describe("getConfiguration", () => {
    it("should return array of exclude patterns", async () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(
        configAny.getConfiguration(`${section}.${key}`, []),
        mock.configuration[section][key]
      );
    });
  });
});
