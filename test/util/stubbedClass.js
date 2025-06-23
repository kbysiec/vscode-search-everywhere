"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStubInstance = void 0;
const sinon = require("sinon");
function createStubInstance(constructor, overrides) {
    const stub = sinon.createStubInstance(constructor, overrides);
    return stub;
}
exports.createStubInstance = createStubInstance;
//# sourceMappingURL=stubbedClass.js.map