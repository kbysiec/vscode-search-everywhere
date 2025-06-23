import * as sinon from "sinon";
import { appConfig } from "../../src/appConfig";
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

    getData: {
      setupForReturningCachedData: () => {
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

      setupForEmptyCache: () => {
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
    },

    updateData: {
      setupForUpdatingCache: () => {
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
    },

    getNotSavedUriPaths: {
      setupForReturningCachedPaths: () => {
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

      setupForEmptyCache: () => {
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
    },

    getConfigByKey: {
      setupForExistingConfigKey: () => {
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

      setupForNonExistentConfigKey: () => {
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
    },

    updateConfigByKey: {
      setupForExistingCacheObject: () => {
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

      setupForNonExistentCacheObject: () => {
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
    },

    clear: {
      setupForClearingDataAndConfig: () => {
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
    },

    clearConfig: {
      setupForClearingConfig: () => {
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
    },

    clearNotSavedUriPaths: {
      setupForClearingNotSavedUriPaths: () => {
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
    },
  };
};
