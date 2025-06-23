"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestSetups = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const controller_1 = require("../../src/controller");
const mockFactory_1 = require("../util/mockFactory");
const stubHelpers_1 = require("../util/stubHelpers");
const getTestSetups = () => {
    const sandbox = sinon.createSandbox();
    const context = (0, mockFactory_1.getExtensionContext)();
    return {
        before: () => {
            return context;
        },
        afterEach: () => {
            sandbox.restore();
        },
        activate: {
            setupForRegisteringCommands: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: vscode.commands,
                        method: "registerCommand",
                    },
                    {
                        object: controller_1.controller,
                        method: "init",
                    },
                    {
                        object: controller_1.controller,
                        method: "startup",
                    },
                ], sandbox);
            },
            setupForControllerInit: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "init",
                    },
                    {
                        object: vscode.commands,
                        method: "registerCommand",
                    },
                    {
                        object: controller_1.controller,
                        method: "startup",
                    },
                ], sandbox);
            },
            setupForControllerStartup: () => {
                return (0, stubHelpers_1.stubMultiple)([
                    {
                        object: controller_1.controller,
                        method: "startup",
                    },
                    {
                        object: controller_1.controller,
                        method: "init",
                    },
                    {
                        object: vscode.commands,
                        method: "registerCommand",
                    },
                ], sandbox);
            },
        },
        deactivate: {
            setupForLogging: () => {
                return (0, stubHelpers_1.stubMultiple)([{ object: console, method: "log" }], sandbox);
            },
        },
        search: {
            setupForControllerSearch: () => {
                return (0, stubHelpers_1.stubMultiple)([{ object: controller_1.controller, method: "search" }], sandbox);
            },
        },
        reload: {
            setupForControllerReload: () => {
                return (0, stubHelpers_1.stubMultiple)([{ object: controller_1.controller, method: "reload" }], sandbox);
            },
        },
    };
};
exports.getTestSetups = getTestSetups;
//# sourceMappingURL=extension.testSetup.js.map