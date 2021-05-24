import WorkspaceRemover from "../../workspaceRemover";
import { getItem } from "../util/itemMockFactory";
import { getConfiguration } from "../util/mockFactory";
import { getQpItems } from "../util/qpItemMockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (workspaceRemover: WorkspaceRemover) => {
  const workspaceRemoverAny = workspaceRemover as any;

  const stubDataServiceConfig = () => {
    const configuration = getConfiguration().searchEverywhere;
    restoreStubbedMultiple([
      {
        object: workspaceRemoverAny.dataService.config,
        method: "getInclude",
      },
      {
        object: workspaceRemoverAny.dataService.config,
        method: "getExclude",
      },
    ]);

    stubMultiple([
      {
        object: workspaceRemoverAny.dataService.config,
        method: "getInclude",
        returns: configuration.include,
      },
      {
        object: workspaceRemoverAny.dataService.config,
        method: "getExclude",
        returns: configuration.exclude,
      },
    ]);
  };

  return {
    removeFromCacheByPath1: () => {
      restoreStubbedMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
        },
      ]);
      stubDataServiceConfig();

      return stubMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
          returns: undefined,
        },
      ]);
    },
    removeFromCacheByPath2: () => {
      restoreStubbedMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
        },
        {
          object: workspaceRemoverAny.dataService,
          method: "isUriExistingInWorkspace",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
          returns: getQpItems(),
        },
        {
          object: workspaceRemoverAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(true),
        },
      ]);
    },
    removeFromCacheByPath3: () => {
      restoreStubbedMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.utils,
          method: "getNameFromUri",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
        },
        {
          object: workspaceRemoverAny.dataService,
          method: "isUriExistingInWorkspace",
        },
        {
          object: workspaceRemoverAny.common,
          method: "wasDirectoryRenamed",
        },
        {
          object: workspaceRemoverAny.common,
          method: "isDirectory",
        },
      ]);

      const qpItems = getQpItems();
      const stubs = stubMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
          returns: qpItems,
        },
        {
          object: workspaceRemoverAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
        {
          object: workspaceRemoverAny.common,
          method: "isDirectory",
          returns: true,
        },
        {
          object: workspaceRemoverAny.common,
          method: "directoryUriAfterPathUpdate",
          returns: getItem(),
          isNotMethod: true,
        },
      ]);

      return {
        qpItems,
        stubs,
      };
    },
    removeFromCacheByPath4: () => {
      restoreStubbedMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
        },
        {
          object: workspaceRemoverAny.dataService,
          method: "isUriExistingInWorkspace",
        },
        {
          object: workspaceRemoverAny.common,
          method: "isDirectory",
        },
      ]);

      return stubMultiple([
        {
          object: workspaceRemoverAny.cache,
          method: "updateData",
        },
        {
          object: workspaceRemoverAny.common,
          method: "getData",
          returns: getQpItems(),
        },
        {
          object: workspaceRemoverAny.dataService,
          method: "isUriExistingInWorkspace",
          returns: Promise.resolve(false),
        },
        {
          object: workspaceRemoverAny.common,
          method: "isDirectory",
          returns: false,
        },
      ]);
    },
  };
};
