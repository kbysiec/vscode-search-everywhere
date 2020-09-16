import * as vscode from "vscode";
import * as sinon from "sinon";
import { appConfig } from "../../appConfig";
import Cache from "../../cache";
import { getExtensionContext } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";
import * as mock from "../mock/cache.mock";

export const getTestSetups = (
  cache: Cache,
  context: vscode.ExtensionContext
) => {
  const cacheAny: any = cache as any;
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

      return { cacheAny, updateStub };
    },
    getData1: () => {
      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: getQpItems(),
        },
      ]);
    },
    getData2: () => {
      stubMultiple([
        {
          object: context.workspaceState,
          method: "get",
          returns: undefined,
        },
      ]);
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
    clear: () => {
      return stubMultiple([
        {
          object: cacheAny,
          method: "clearData",
        },
        {
          object: cache,
          method: "clearConfig",
        },
      ]);
    },
  };
};
