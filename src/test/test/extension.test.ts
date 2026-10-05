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
    it("should register six commands", async () => {
      const [registerCommandStub] =
        setups.activate.setupForRegisteringCommands();
      await extension.activate(context);

      assert.equal(registerCommandStub.callCount, 6);
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

  describe("searchCurrentFile", () => {
    it("should controller.searchCurrentFile method be invoked", () => {
      const [stub] =
        setups.searchCurrentFile.setupForControllerSearchCurrentFile();
      extension.searchCurrentFile();

      assert.equal(stub.calledOnce, true);
    });
  });

  describe("navigateIntoFile", () => {
    it("should controller.navigateIntoFile method be invoked", () => {
      const [stub] =
        setups.navigateIntoFile.setupForControllerNavigateIntoFile();
      extension.navigateIntoFile();

      assert.equal(stub.calledOnce, true);
    });
  });

  describe("navigateBack", () => {
    it("should controller.navigateBack method be invoked", () => {
      const [stub] = setups.navigateBack.setupForControllerNavigateBack();
      extension.navigateBack();

      assert.equal(stub.calledOnce, true);
    });
  });
});
