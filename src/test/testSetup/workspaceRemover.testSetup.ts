import WorkspaceRemover from "../../workspaceRemover";
import { getQpItems } from "../util/qpItemMockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (workspaceRemover: WorkspaceRemover) => {
  const workspaceRemoverAny = workspaceRemover as any;

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
      ]);
    },
    removeFromCacheByPath3: () => {
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
      ]);
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
      ]);
    },
    removeFromCacheByPath5: () => {
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
      ]);
    },
  };
};
