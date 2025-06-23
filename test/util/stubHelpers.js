"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreStubbedMultiple = exports.stubMultiple = void 0;
const sinon = require("sinon");
const stubMultiple = (configList, overridenSandox) => {
    const sandbox = overridenSandox || sinon;
    const stubs = [];
    configList.forEach((config) => {
        let stub = sandbox.stub(config.object, config.method);
        if (config.callsFake) {
            !config.isNotMethod && stub.returns(config.returns);
        }
        else if (config.customReturns) {
            config.returns &&
                config.returns.length &&
                config.returns.forEach(stubOnSpecificCall.bind(null, config, stub));
        }
        else if (config.returnsIsUndefined) {
            config.isNotMethod ? stub.value(undefined) : stub.returns(undefined);
        }
        else {
            config.returns && config.isNotMethod
                ? stub.value(config.returns)
                : stub.returns(config.returns);
        }
        config.throws && stub.throws(config.throws);
        config.callsFake && !config.isNotMethod && stub.callsFake(config.callsFake);
        stubs.push(stub);
    });
    return stubs;
};
exports.stubMultiple = stubMultiple;
const restoreStubbedMultiple = (configList) => {
    configList.forEach((config) => {
        config.object[config.method].restore();
    });
};
exports.restoreStubbedMultiple = restoreStubbedMultiple;
function stubOnSpecificCall(config, stub, customReturn) {
    let onCallStub;
    if (customReturn.onCall !== undefined) {
        onCallStub = stub.onCall(customReturn.onCall);
        if (customReturn.throws) {
            onCallStub.throws(customReturn.throws);
        }
        else {
            onCallStub = customReturn.withArgs
                ? onCallStub.withArgs(customReturn.withArgs)
                : onCallStub;
            onCallStub = config.isNotMethod
                ? onCallStub.value(customReturn.returns)
                : onCallStub.returns(customReturn.returns);
        }
    }
}
//# sourceMappingURL=stubHelpers.js.map