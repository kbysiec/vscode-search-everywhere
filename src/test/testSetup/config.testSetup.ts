import * as sinon from "sinon";
import * as vscode from "vscode";
import * as cache from "../../cache";
import { getConfiguration, getVscodeConfiguration } from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const configuration = getConfiguration();
  const sandbox = sinon.createSandbox();
  let getConfigurationStub: sinon.SinonStub;

  return {
    before: () => {
      return configuration;
    },
    beforeEach: () => {
      [getConfigurationStub] = stubMultiple(
        [
          {
            object: vscode.workspace,
            method: "getConfiguration",
            returns: getVscodeConfiguration(configuration),
          },
        ],
        sandbox
      );
    },
    afterEach: () => {
      sandbox.restore();
    },
    getExclude2: (section: string, key: string) => {
      getConfigurationStub.restore();
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
