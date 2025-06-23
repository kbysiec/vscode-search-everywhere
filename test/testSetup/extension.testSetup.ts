import * as sinon from "sinon";
import * as vscode from "vscode";
import { controller } from "../../src/controller";
import { getExtensionContext } from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();
  const context = getExtensionContext();

  return {
    before: () => {
      return context;
    },
    afterEach: () => {
      sandbox.restore();
    },

    activate: {
      setupForRegisteringCommands: () => {
        return stubMultiple(
          [
            {
              object: vscode.commands,
              method: "registerCommand",
            },
            {
              object: controller,
              method: "init",
            },
            {
              object: controller,
              method: "startup",
            },
          ],
          sandbox
        );
      },

      setupForControllerInit: () => {
        return stubMultiple(
          [
            {
              object: controller,
              method: "init",
            },
            {
              object: vscode.commands,
              method: "registerCommand",
            },
            {
              object: controller,
              method: "startup",
            },
          ],
          sandbox
        );
      },

      setupForControllerStartup: () => {
        return stubMultiple(
          [
            {
              object: controller,
              method: "startup",
            },
            {
              object: controller,
              method: "init",
            },
            {
              object: vscode.commands,
              method: "registerCommand",
            },
          ],
          sandbox
        );
      },
    },

    deactivate: {
      setupForLogging: () => {
        return stubMultiple([{ object: console, method: "log" }], sandbox);
      },
    },

    search: {
      setupForControllerSearch: () => {
        return stubMultiple(
          [{ object: controller, method: "search" }],
          sandbox
        );
      },
    },

    reload: {
      setupForControllerReload: () => {
        return stubMultiple(
          [{ object: controller, method: "reload" }],
          sandbox
        );
      },
    },
  };
};
