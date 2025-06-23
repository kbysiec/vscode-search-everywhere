import { assert } from "chai";
import * as sinon from "sinon";
import * as vscode from "vscode";
import * as extension from "../../src/extension";
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
    it("should register two commands", async () => {
      const [registerCommandStub] =
        setups.activate.setupForRegisteringCommands();
      await extension.activate(context);

      assert.equal(registerCommandStub.calledTwice, true);
    });

    it("should controller.init method be invoked", async () => {
      const [initStub] = setups.activate.setupForControllerInit();
      await extension.activate(context);

      assert.equal(initStub.calledOnce, true);
    });

    it("should controller.startup method be invoked", async () => {
      const [startupStub] = setups.activate.setupForControllerStartup();
      await extension.activate(context);

      assert.equal(startupStub.calledOnce, true);
    });
  });

  describe("deactivate", () => {
    it("should function exist", () => {
      const logStub = sinon.spy(console, "log", ["get"]);
      extension.deactivate();

      assert.equal(logStub.get.calledOnce, true);
    });
  });

  describe("search", () => {
    it("should controller.search method be invoked", () => {
      const [searchStub] = setups.search.setupForControllerSearch();
      extension.search();

      assert.equal(searchStub.calledOnce, true);
    });
  });

  describe("reload", () => {
    it("should controller.reload method be invoked", () => {
      const [reloadStub] = setups.reload.setupForControllerReload();
      extension.reload();

      assert.equal(reloadStub.calledOnce, true);
    });
  });
});
