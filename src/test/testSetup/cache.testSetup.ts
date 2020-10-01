import * as vscode from "vscode";
import * as sinon from "sinon";
import { appConfig } from "../../appConfig";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";
import * as mock from "../mock/cache.mock";

export const getTestSetups = (context: vscode.ExtensionContext) => {
  let updateStub: sinon.SinonStub;

  return {
    beforeEach: () => {
      stubMultiple([
        {
          object: appConfig,
          method: "dataCacheKey",
          returns: "cache",
          isNotMethod: true,
        },
        {
          object: appConfig,
          method: "configCacheKey",
          returns: "config",
          isNotMethod: true,
        },
      ]);

      updateStub = sinon.stub();
      context.workspaceState.update = updateStub;

      return updateStub;
    },
    getData1: () => {
      const qpItems = getQpItems();
      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: qpItems,
        },
      ]);

      return qpItems;
    },
    getData2: () => {
      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: undefined,
        },
      ]);

      return [];
    },
    updateData1: () => {
      return getQpItems();
    },
    getConfigByKey1: () => {
      const key = "searchEverywhere.exclude";
      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: { [key]: mock.configuration[key] },
        },
      ]);

      return key;
    },
    getConfigByKey2: () => {
      const key = "searchEverywhere.exclude";
      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: undefined,
        },
      ]);

      return key;
    },
    updateConfigByKey1: () => {
      const key = "searchEverywhere.exclude";
      const newConfig = {
        ...mock.configuration,
        ...{ [key]: mock.newExcludePatterns },
      };

      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: mock.configuration,
        },
      ]);

      return { key, newConfig };
    },
    updateConfigByKey2: () => {
      const key = "searchEverywhere.exclude";

      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: undefined,
        },
      ]);

      return key;
    },
  };
};
