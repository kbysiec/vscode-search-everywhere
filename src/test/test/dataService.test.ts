import * as vscode from "vscode";
import { assert } from "chai";
import * as sinon from "sinon";
import DataService from "../../dataService";
import * as mock from "../mock/dataService.mock";

describe("DataService", () => {
  let dataService: DataService;

  before(() => {
    dataService = new DataService();
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
});
