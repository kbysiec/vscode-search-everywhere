import * as sinon from "sinon";
import * as vscode from "vscode";
import * as config from "../../config";
import { dataConverter } from "../../dataConverter";
import { Icons, ItemsFilterPhrases } from "../../types";
import { utils } from "../../utils";
import { mocks } from "../mock/dataConverter.mock";
import { getConfiguration, getWorkspaceData } from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

const stubConfig = (
  sandbox: sinon.SinonSandbox,
  icons: Icons = {},
  shouldUseItemsFilterPhrases: boolean = false,
  itemsFilterPhrases: ItemsFilterPhrases = {},
  workspaceFolders: vscode.WorkspaceFolder[] | null = mocks.workspaceFolders
) => {
  stubMultiple(
    [
      {
        object: dataConverter,
        method: "getIcons",
        returns: icons,
      },
      {
        object: dataConverter,
        method: "getShouldUseItemsFilterPhrases",
        returns: shouldUseItemsFilterPhrases,
      },
      {
        object: dataConverter,
        method: "getItemsFilterPhrases",
        returns: itemsFilterPhrases,
      },
      {
        object: vscode.workspace,
        method: "workspaceFolders",
        returns: workspaceFolders,
        isNotMethod: true,
        returnsIsUndefined: !!workspaceFolders,
      },
    ],
    sandbox
  );
};

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  return {
    afterEach: () => {
      sandbox.restore();
    },
    reload1: () => {
      return stubMultiple(
        [{ object: dataConverter, method: "fetchConfig" }],
        sandbox
      );
    },
    cancel1: () => {
      return stubMultiple(
        [{ object: dataConverter, method: "setCancelled" }],
        sandbox
      );
    },
    convertToQpData1: () => {
      stubConfig(sandbox);
      stubMultiple(
        [
          {
            object: utils,
            method: "getNameFromUri",
            returns: "fake-1.ts",
          },
          {
            object: utils,
            method: "normalizeUriPath",
            returns: "/./fake/fake-1.ts",
          },
          {
            object: utils,
            method: "getSplitter",
            returns: "§&§",
          },
        ],
        sandbox
      );

      const { workspaceData, qpItems } = mocks.convertToQpData1();

      return {
        workspaceData,
        qpItems,
      };
    },
    convertToQpData2: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(
        sandbox,
        configuration.icons,
        true,
        configuration.itemsFilterPhrases,
        null
      );
      stubMultiple(
        [
          {
            object: utils,
            method: "getNameFromUri",
            returns: "fake-1.ts",
          },
          {
            object: utils,
            method: "normalizeUriPath",
            returns: "/./fake/fake-1.ts",
          },
          {
            object: utils,
            method: "getSplitter",
            returns: "§&§",
          },
        ],
        sandbox
      );

      const { workspaceData, qpItems } = mocks.convertToQpData2();

      return {
        workspaceData,
        qpItems,
      };
    },
    convertToQpData3: () => {
      return {
        workspaceData: getWorkspaceData(),
        qpItems: [],
      };
    },
    convertToQpData4: () => {
      stubMultiple(
        [
          {
            object: dataConverter,
            method: "getIsCancelled",
            returns: true,
          },
        ],
        sandbox
      );

      const { workspaceData } = mocks.convertToQpData4();

      return {
        workspaceData,
        qpItems: [],
      };
    },
    fetchConfig1: () => {
      const configuration = getConfiguration().searchEverywhere;
      const expected = configuration.icons;
      stubMultiple(
        [
          {
            object: config,
            method: "fetchIcons",
            returns: expected,
          },
          {
            object: config,
            method: "fetchShouldUseItemsFilterPhrases",
          },
          {
            object: config,
            method: "fetchItemsFilterPhrases",
          },
        ],
        sandbox
      );
      return expected;
    },
    fetchConfig2: () => {
      const configuration = getConfiguration().searchEverywhere;
      const expected = configuration.shouldUseItemsFilterPhrases;
      stubMultiple(
        [
          {
            object: config,
            method: "fetchShouldUseItemsFilterPhrases",
            returns: expected,
          },
          {
            object: config,
            method: "fetchIcons",
          },
          {
            object: config,
            method: "fetchItemsFilterPhrases",
          },
        ],
        sandbox
      );
      return expected;
    },
    fetchConfig3: () => {
      const configuration = getConfiguration().searchEverywhere;
      const expected = configuration.itemsFilterPhrases;
      stubMultiple(
        [
          {
            object: config,
            method: "fetchItemsFilterPhrases",
            returns: expected,
          },
          {
            object: config,
            method: "fetchShouldUseItemsFilterPhrases",
          },
          {
            object: config,
            method: "fetchIcons",
          },
        ],
        sandbox
      );
      return expected;
    },
  };
};
