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
const actionProcessor_1 = require("../../src/actionProcessor");
const actionProcessor_testSetup_1 = require("../testSetup/actionProcessor.testSetup");
const mockFactory_1 = require("../util/mockFactory");
describe("ActionProcessor", () => {
    let setups;
    before(() => {
        setups = (0, actionProcessor_testSetup_1.getTestSetups)();
    });
    afterEach(() => setups.afterEach());
    describe("register", () => {
        it("should add action to queue when register is called", () => __awaiter(void 0, void 0, void 0, function* () {
            const [addStub] = setups.register.setupForAddingActionToQueue();
            yield actionProcessor_1.actionProcessor.register((0, mockFactory_1.getAction)());
            chai_1.assert.equal(addStub.calledOnce, true);
        }));
        it("should process action when action processor is not busy", () => __awaiter(void 0, void 0, void 0, function* () {
            const [processStub] = setups.register.setupForProcessingWhenNotBusy();
            yield actionProcessor_1.actionProcessor.register((0, mockFactory_1.getAction)());
            chai_1.assert.equal(processStub.calledOnce, true);
        }));
        it("should not process action when action processor is busy", () => __awaiter(void 0, void 0, void 0, function* () {
            const [processStub] = setups.register.setupForProcessingWhenBusy();
            yield actionProcessor_1.actionProcessor.register((0, mockFactory_1.getAction)());
            chai_1.assert.equal(processStub.calledOnce, false);
        }));
        it("should take actions from queue, reduce, and invoke its functions in appropriate order - with rebuild queued", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, queue } = setups.register.setupForQueueProcessingWithRebuildQueued();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(queue[0].fn.calledOnce, false);
            chai_1.assert.equal(queue[1].fn.calledOnce, false);
            chai_1.assert.equal(queue[2].fn.calledOnce, false);
            chai_1.assert.equal(queue[3].fn.calledOnce, false);
            chai_1.assert.equal(action.fn.calledOnce, true);
        }));
        it("should take actions from queue, reduce, and invoke its functions in appropriate order - without rebuild queued", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, queue } = setups.register.setupForQueueProcessingWithoutRebuildQueued();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(queue[0].fn.calledOnce, false);
            chai_1.assert.equal(queue[1].fn.calledOnce, true);
            chai_1.assert.equal(queue[2].fn.calledOnce, true);
            chai_1.assert.equal(action.fn.calledOnce, true);
        }));
        it("should emit onWillProcessing event at the beginning of processing", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, eventEmitter } = setups.register.setupForWillProcessingEventEmission();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(eventEmitter.fire.calledOnce, true);
        }));
        it("should emit onDidProcessing event at the end of processing", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, eventEmitter } = setups.register.setupForDidProcessingEventEmission();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(eventEmitter.fire.calledOnce, true);
        }));
        it("should emit onWillExecuteAction event before execution of each action function", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, eventEmitter } = setups.register.setupForWillExecuteActionEventEmission();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(eventEmitter.fire.calledTwice, true);
        }));
        it("should reduce rebuild actions and return array with last rebuild action if previous action is different type than rebuild", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, queue } = setups.register.setupForRebuildActionReductionWithDifferentPreviousAction();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(queue[0].fn.calledOnce, false);
            chai_1.assert.equal(queue[1].fn.calledOnce, false);
            chai_1.assert.equal(action.fn.calledOnce, true);
        }));
        it("should reduce rebuild actions and return empty array if previous action is rebuild type", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, queue } = setups.register.setupForRebuildActionReductionWithRebuildPreviousAction();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(queue[0].fn.calledOnce, false);
            chai_1.assert.equal(queue[1].fn.calledOnce, false);
            chai_1.assert.equal(action.fn.calledOnce, false);
        }));
        it("should reduce actions with other type than rebuild", () => __awaiter(void 0, void 0, void 0, function* () {
            const { action, queue } = setups.register.setupForNonRebuildActionReduction();
            yield actionProcessor_1.actionProcessor.register(action);
            chai_1.assert.equal(queue[0].fn.calledOnce, false);
            chai_1.assert.equal(queue[1].fn.calledOnce, true);
            chai_1.assert.equal(action.fn.calledOnce, true);
        }));
    });
});
//# sourceMappingURL=actionProcessor.test.js.map