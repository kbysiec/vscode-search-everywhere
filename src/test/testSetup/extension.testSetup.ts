import * as sinon from "sinon";
import * as vscode from "vscode";
import { controller } from "../../controller";
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
    activate1: () => {
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
    activate2: () => {
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
    activate3: () => {
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
    deactivate1: () => {
      return stubMultiple([{ object: console, method: "log" }], sandbox);
    },
    search1: () => {
      return stubMultiple([{ object: controller, method: "search" }], sandbox);
    },
    reload1: () => {
      return stubMultiple([{ object: controller, method: "reload" }], sandbox);
    },
  };
};
