import * as vscode from "vscode";
import Config from "../../config";
import { getConfiguration, getVscodeConfiguration } from "../util/mockFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";

export const getTestSetups = (config: Config) => {
  const configAny = config as any;
  const configuration = getConfiguration();

  return {
    beforeEach: () => {
      return {
        configuration,
        stubs: stubMultiple([
          {
            object: vscode.workspace,
            method: "getConfiguration",
            returns: getVscodeConfiguration(configuration),
          },
        ]),
      };
    },
    getExclude2: (section: string, key: string) => {
      restoreStubbedMultiple([
        { object: configAny.cache, method: "getConfigByKey" },
      ]);

      return stubMultiple([
        {
          object: configAny.cache,
          method: "getConfigByKey",
          returns: configuration[section][key],
        },
      ]);
    },
  };
};
