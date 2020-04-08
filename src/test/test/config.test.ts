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

  before(() => {
    cacheStub = getCacheStub();
    config = new Config(cacheStub);
  });

  beforeEach(() => {
    sinon.stub(vscode.workspace, "getConfiguration").returns({
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

  describe("getExclude", () => {
    it("should return array of exclude patterns from configuration if it does not exist in cache", async () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(config.getExclude(), mock.configuration[section][key]);
    });

    it("should return array of exclude patterns from cache if it exists there", async () => {
      const section = "searchEverywhere";
      const key = "exclude";
      const value = mock.configuration[section][key];
      sinon.stub(configAny.cache, "getConfigFromCacheByKey").returns(value);

      assert.equal(config.getExclude(), value);
    });
  });

  describe("getInclude", () => {
    it("should return array of include patterns from configuration if it does not exist in cache", async () => {
      const section = "searchEverywhere";
      const key = "include";

      assert.equal(config.getInclude(), mock.configuration[section][key]);
    });

    it("should return array of exclude patterns from cache if it exists there", async () => {
      const section = "searchEverywhere";
      const key = "include";
      const value = mock.configuration[section][key];
      sinon.stub(configAny.cache, "getConfigFromCacheByKey").returns(value);

      assert.equal(config.getInclude(), value);
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
