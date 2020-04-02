import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import Config from "../../config";
import * as mock from "../mock/config.mock";

describe("Config", () => {
  let config: Config;
  let configAny: any;

  before(() => {
    config = new Config();
  });

  beforeEach(() => {
    sinon.stub(vscode.workspace, "getConfiguration").returns({
      get: (section: string) =>
        section.split(".").reduce((cfg, key) => cfg[key], mock.configuration),
      has: () => true,
      inspect: () => undefined,
      update: () => Promise.resolve()
    });

    configAny = config as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getExclude", () => {
    it("should return array of exclude patterns", async () => {
      const section = "searchEverywhere";
      const key = "exclude";

      assert.equal(config.getExclude(), mock.configuration[section][key]);
    });
  });

  describe("getInclude", () => {
    it("should return array of include patterns", async () => {
      const section = "searchEverywhere";
      const key = "include";

      assert.equal(config.getInclude(), mock.configuration[section][key]);
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
