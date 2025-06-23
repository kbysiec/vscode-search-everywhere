"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const extension = require("../../src/extension");
const extension_testSetup_1 = require("../testSetup/extension.testSetup");
describe("extension", () => {
    let setups;
    let context;
    before(() => {
        setups = (0, extension_testSetup_1.getTestSetups)();
        context = setups.before();
    });
    afterEach(() => setups.afterEach());
    describe("activate", () => {
        it("should register two commands", () => __awaiter(void 0, void 0, void 0, function* () {
            const [registerCommandStub] = setups.activate.setupForRegisteringCommands();
            yield extension.activate(context);
            chai_1.assert.equal(registerCommandStub.calledTwice, true);
        }));
        it("should controller.init method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [initStub] = setups.activate.setupForControllerInit();
            yield extension.activate(context);
            chai_1.assert.equal(initStub.calledOnce, true);
        }));
        it("should controller.startup method be invoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const [startupStub] = setups.activate.setupForControllerStartup();
            yield extension.activate(context);
            chai_1.assert.equal(startupStub.calledOnce, true);
        }));
    });
    describe("deactivate", () => {
        it("should function exist", () => {
            const logStub = sinon.spy(console, "log", ["get"]);
            extension.deactivate();
            chai_1.assert.equal(logStub.get.calledOnce, true);
        });
    });
    describe("search", () => {
        it("should controller.search method be invoked", () => {
            const [searchStub] = setups.search.setupForControllerSearch();
            extension.search();
            chai_1.assert.equal(searchStub.calledOnce, true);
        });
    });
    describe("reload", () => {
        it("should controller.reload method be invoked", () => {
            const [reloadStub] = setups.reload.setupForControllerReload();
            extension.reload();
            chai_1.assert.equal(reloadStub.calledOnce, true);
        });
    });
});
//# sourceMappingURL=extension.test.js.map