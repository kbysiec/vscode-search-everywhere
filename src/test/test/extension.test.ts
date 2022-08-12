import { assert } from "chai";
import * as sinon from "sinon";
import * as vscode from "vscode";
import * as extension from "../../extension";
import { getTestSetups } from "../testSetup/extension.testSetup";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("extension", () => {
  let setups: SetupsType;
  let context: vscode.ExtensionContext;

  before(() => {
    setups = getTestSetups();
    context = setups.before();
  });
  afterEach(() => setups.afterEach());

  describe("activate", () => {
    it("1: should register two commands", async () => {
      const [registerCommandStub] = setups.activate1();
      await extension.activate(context);

      assert.equal(registerCommandStub.calledTwice, true);
    });

    it("2: should controller.init method be invoked", async () => {
      const [initStub] = setups.activate2();
      await extension.activate(context);

      assert.equal(initStub.calledOnce, true);
    });

    it("3: should controller.startup method be invoked", async () => {
      const [startupStub] = setups.activate2();
      await extension.activate(context);

      assert.equal(startupStub.calledOnce, true);
    });
  });

  describe("deactivate", () => {
    it("1: should function exist", () => {
      const logStub = sinon.spy(console, "log", ["get"]);
      extension.deactivate();

      assert.equal(logStub.get.calledOnce, true);
    });
  });

  describe("search", () => {
    it("1: should controller.search method be invoked", () => {
      const [searchStub] = setups.search1();
      extension.search();

      assert.equal(searchStub.calledOnce, true);
    });
  });

  describe("reload", () => {
    it("1: should controller.reload method be invoked", () => {
      const [reloadStub] = setups.reload1();
      extension.reload();

      assert.equal(reloadStub.calledOnce, true);
    });
  });
});
