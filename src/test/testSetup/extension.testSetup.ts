import * as sinon from "sinon";
import * as vscode from "vscode";
import { extensionController } from "../../extensionController";
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
            object: extensionController,
            method: "init",
          },
          {
            object: extensionController,
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
            object: extensionController,
            method: "init",
          },
          {
            object: vscode.commands,
            method: "registerCommand",
          },
          {
            object: extensionController,
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
            object: extensionController,
            method: "startup",
          },
          {
            object: extensionController,
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
      return stubMultiple(
        [{ object: extensionController, method: "search" }],
        sandbox
      );
    },
    reload1: () => {
      return stubMultiple(
        [{ object: extensionController, method: "reload" }],
        sandbox
      );
    },
  };
};
