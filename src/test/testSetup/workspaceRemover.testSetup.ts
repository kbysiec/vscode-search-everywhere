import * as sinon from "sinon";
import * as cache from "../../cache";
import { workspaceCommon as common } from "../../workspaceCommon";
import { getQpItems } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },
    removeFromCacheByPath1: () => {
      return stubMultiple(
        [
          {
            object: cache,
            method: "updateData",
          },
          {
            object: common,
            method: "getData",
            returns: getQpItems(),
          },
        ],
        sandbox
      );
    },
    removeFromCacheByPath2: () => {
      return stubMultiple(
        [
          {
            object: cache,
            method: "updateData",
          },
          {
            object: common,
            method: "getData",
            returns: getQpItems(),
          },
        ],
        sandbox
      );
    },
    removeFromCacheByPath3: () => {
      return stubMultiple(
        [
          {
            object: cache,
            method: "updateData",
          },
          {
            object: common,
            method: "getData",
            returns: getQpItems(),
          },
        ],
        sandbox
      );
    },
    removeFromCacheByPath4: () => {
      return stubMultiple(
        [
          {
            object: cache,
            method: "updateData",
          },
          {
            object: common,
            method: "getData",
            returns: getQpItems(),
          },
        ],
        sandbox
      );
    },
    removeFromCacheByPath5: () => {
      return stubMultiple(
        [
          {
            object: cache,
            method: "updateData",
          },
          {
            object: common,
            method: "getData",
            returns: getQpItems(),
          },
        ],
        sandbox
      );
    },
    removeFromCacheByPath6: () => {
      return stubMultiple(
        [
          {
            object: cache,
            method: "updateData",
          },
          {
            object: common,
            method: "getData",
            returns: getQpItems(),
          },
        ],
        sandbox
      );
    },
  };
};
