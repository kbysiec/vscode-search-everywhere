import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import DataService from "../../dataService";
import * as mock from "../mock/dataService.mock";

describe("DataService", () => {
  let dataService: DataService;
  let dataServiceAny: any;

  before(() => {
    dataService = new DataService();
  });

  beforeEach(() => {
    dataServiceAny = dataService as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should data service be initialized", () => {
      dataService = new DataService();

      assert.exists(dataService);
    });
  });

  describe("getData", () => {
    it("should return vscode.Uri[] containing workspace data", async () => {
      sinon
        .stub(vscode.workspace, "findFiles")
        .returns(Promise.resolve(mock.items));
      const items = await dataService.getData();

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
    it("should return empty string if passed array is empty", () => {
      const patterns: string[] = [];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`should return string with one pattern if passed array
      contains one element`, () => {
      const patterns = ["**/node_modules/**"];

      assert.equal(
        dataServiceAny.patternsAsString(patterns),
        patterns.join(",")
      );
    });

    it(`should return string with patterns separated by comma surrounded
      with curly braces if passed array contains more than one element`, () => {
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
