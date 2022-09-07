import * as sinon from "sinon";
import { appConfig } from "../../appConfig";
import * as mock from "../mock/cache.mock";
import { getItems } from "../util/itemMockFactory";
import { getExtensionContext } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const context = getExtensionContext();
  const sandbox = sinon.createSandbox();

  return {
    before: () => {
      stubMultiple(
        [
          {
            object: appConfig,
            method: "dataCacheKey",
            returns: "data",
            isNotMethod: true,
          },
          {
            object: appConfig,
            method: "configCacheKey",
            returns: "config",
            isNotMethod: true,
          },
        ],
        sandbox
      );

      return context;
    },
    afterEach: () => {
      sandbox.restore();
    },
    getData1: () => {
      const qpItems = getQpItems();
      stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "get",
            returns: qpItems,
          },
        ],
        sandbox
      );

      return qpItems;
    },
    getData2: () => {
      stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "get",
            returns: undefined,
          },
        ],
        sandbox
      );

      return [];
    },
    updateData1: () => {
      const stubs = stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "update",
          },
        ],
        sandbox
      );

      return {
        stubs,
        qpItems: getQpItems(),
      };
    },
    getNotSavedUriPaths1: () => {
      const items = getItems();
      const paths = items.map((item) => item.path);

      stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "get",
            returns: paths,
          },
        ],
        sandbox
      );

      return paths;
    },
    getNotSavedUriPaths2: () => {
      stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "get",
            returns: undefined,
          },
        ],
        sandbox
      );

      return [];
    },
    getConfigByKey1: () => {
      const key = "searchEverywhere.exclude";
      stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "get",
            returns: { [key]: mock.configuration[key] },
          },
        ],
        sandbox
      );

      return key;
    },
    getConfigByKey2: () => {
      const key = "searchEverywhere.exclude";
      stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "get",
            returns: undefined,
          },
        ],
        sandbox
      );

      return key;
    },
    updateConfigByKey1: () => {
      const key = "searchEverywhere.exclude";
      const newConfig = {
        ...mock.configuration,
        ...{ [key]: mock.newExcludePatterns },
      };

      const stubs = stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "update",
          },
          {
            object: context.workspaceState,
            method: "get",
            returns: mock.configuration,
          },
        ],
        sandbox
      );

      return { stubs, key, newConfig };
    },
    updateConfigByKey2: () => {
      const key = "searchEverywhere.exclude";

      const stubs = stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "update",
          },
          {
            object: context.workspaceState,
            method: "get",
            returns: undefined,
          },
        ],
        sandbox
      );

      return { stubs, key };
    },
    clear1: () => {
      return stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "update",
          },
        ],
        sandbox
      );
    },
    clearConfig1: () => {
      return stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "update",
          },
        ],
        sandbox
      );
    },
    clearNotSavedUriPaths1: () => {
      return stubMultiple(
        [
          {
            object: context.workspaceState,
            method: "update",
          },
        ],
        sandbox
      );
    },
  };
};
