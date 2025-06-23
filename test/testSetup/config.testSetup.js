"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const cache = require("../../src/cache");
const mockFactory_1 = require("../util/mockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const configuration = (0, mockFactory_1.getConfiguration)();
    const sandbox = sinon.createSandbox();
    return {
        before: () => {
            return configuration;
        },
        beforeEach: () => {
            (0, stubHelpers_1.stubMultiple)([
                {
                    object: vscode.workspace,
                    method: "getConfiguration",
                    returns: (0, mockFactory_1.getVscodeConfiguration)(configuration),
                },
                {
                    object: cache,
                    method: "getConfigByKey",
                },
                {
                    object: cache,
                    method: "updateConfigByKey",
                },
            ], sandbox);
        },
        afterEach: () => {
            sandbox.restore();
        },
        fetchExclude: {
            setupForReturningFromCache: (section, key) => {
                sandbox.restore();
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.workspace,
                        method: "getConfiguration",
                        returns: (0, mockFactory_1.getVscodeConfiguration)(configuration),
                    },
                    {
                        object: cache,
                        method: "getConfigByKey",
                        returns: configuration[section][key],
                    },
                ], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=config.testSetup.js.map