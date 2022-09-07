import * as sinon from "sinon";
import * as vscode from "vscode";
import * as cache from "../../cache";
import { getConfiguration, getVscodeConfiguration } from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const configuration = getConfiguration();
  const sandbox = sinon.createSandbox();

  return {
    before: () => {
      return configuration;
    },
    beforeEach: () => {
      stubMultiple(
        [
          {
            object: vscode.workspace,
            method: "getConfiguration",
            returns: getVscodeConfiguration(configuration),
          },
          {
            object: cache,
            method: "getConfigByKey",
          },
          {
            object: cache,
            method: "updateConfigByKey",
          },
        ],
        sandbox
      );
    },
    afterEach: () => {
      sandbox.restore();
    },
    getExclude2: (section: string, key: string) => {
      sandbox.restore();
      return stubMultiple(
        [
          {
            object: vscode.workspace,
            method: "getConfiguration",
            returns: getVscodeConfiguration(configuration),
          },
          {
            object: cache,
            method: "getConfigByKey",
            returns: configuration[section][key],
          },
        ],
        sandbox
      );
    },
  };
};
