import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import DataService from "../../dataService";
import * as mock from "../mock/dataService.mock";
import { getCacheStub } from "../util/mockFactory";
import Cache from "../../cache";

describe("DataService", () => {
  let dataService: DataService;
  let dataServiceAny: any;
  let cacheStub: Cache;

  before(() => {
    cacheStub = getCacheStub();
    dataService = new DataService(cacheStub);
  });

  beforeEach(() => {
    dataServiceAny = dataService as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should data service be initialized", () => {
      dataService = new DataService(cacheStub);

      assert.exists(dataService);
    });
  });

  describe("fetchData", () => {
    it("should return vscode.Uri[] containing workspace data", async () => {
      sinon
        .stub(vscode.workspace, "findFiles")
        .returns(Promise.resolve(mock.items));
      const items = await dataService.fetchData();

      assert.equal(items.length, 2);
    });
  });

  describe("getIncludePatterns", () => {
    it("should return string[] containing include patterns", () => {
      const patterns = ["**/*.{js}"];
      sinon.stub(dataServiceAny.config, "getInclude").returns(patterns);

      assert.equal(dataServiceAny.getIncludePatterns(), patterns);
    });
  });

  describe("getExcludePatterns", () => {
    it("should return string[] containing exclude patterns", () => {
      const patterns = ["**/node_modules/**"];
      sinon.stub(dataServiceAny.config, "getExclude").returns(patterns);

      assert.equal(dataServiceAny.getExcludePatterns(), patterns);
    });
  });

  describe("patternsAsString", () => {
    it("should return empty string if given array is empty", () => {
      const patterns: string[] = [];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`should return string with one pattern if given array
      contains one element`, () => {
      const patterns = ["**/node_modules/**"];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`should return string with patterns separated by comma surrounded
      with curly braces if given array contains more than one element`, () => {
      const patterns = [
        "**/node_modules/**",
        "**/bower_components/**",
        "**/yarn.lock",
      ];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        `{${patterns.join(",")}}`
      );
    });
  });
});
