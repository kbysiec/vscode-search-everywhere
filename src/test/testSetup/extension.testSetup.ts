import * as vscode from "vscode";
import ExtensionController from "../../extensionController";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (extensionController: ExtensionController) => {
  return {
    activate1: () => {
      return stubMultiple([
        { object: vscode.commands, method: "registerCommand" },
      ]);
    },
    deactivate1: () => {
      return stubMultiple([{ object: console, method: "log" }]);
    },
    search1: () => {
      return stubMultiple([{ object: extensionController, method: "search" }]);
    },
    reload1: () => {
      return stubMultiple([{ object: extensionController, method: "reload" }]);
    },
  };
};
