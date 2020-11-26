import * as vscode from "vscode";
import DataConverter from "../../dataConverter";
import Icons from "../../interface/icons";
import ItemsFilterPhrases from "../../interface/itemsFilterPhrases";
import { getConfiguration, getWorkspaceData } from "../util/mockFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";
import { mocks } from "../mock/dataConverter.mock";

export const getTestSetups = (dataConverter: DataConverter) => {
  const dataConverterAny = dataConverter as any;

  const stubConfig = (
    icons: Icons = {},
    shouldUseItemsFilterPhrases: boolean = false,
    itemsFilterPhrases: ItemsFilterPhrases = {},
    workspaceFolders: vscode.WorkspaceFolder[] | null = mocks.workspaceFolders
  ) => {
    stubMultiple([
      {
        object: dataConverterAny,
        method: "icons",
        returns: icons,
        isNotMethod: true,
      },
      {
        object: dataConverterAny,
        method: "shouldUseItemsFilterPhrases",
        returns: shouldUseItemsFilterPhrases,
        isNotMethod: true,
      },
      {
        object: dataConverterAny,
        method: "itemsFilterPhrases",
        returns: itemsFilterPhrases,
        isNotMethod: true,
      },
      {
        object: vscode.workspace,
        method: "workspaceFolders",
        returns: workspaceFolders,
        isNotMethod: true,
        returnsIsUndefined: !workspaceFolders,
      },
    ]);
  };

  return {
    reload1: () => {
      return stubMultiple([
        { object: dataConverterAny, method: "fetchConfig" },
      ]);
    },
    cancel1: () => {
      return stubMultiple([
        { object: dataConverterAny, method: "setCancelled" },
      ]);
    },
    convertToQpData1: () => {
      restoreStubbedMultiple([
        {
          object: dataConverterAny.utils,
          method: "getSplitter",
        },
        {
          object: dataConverterAny.utils,
          method: "getNameFromUri",
        },
        {
          object: dataConverterAny.utils,
          method: "normalizeUriPath",
        },
        {
          object: dataConverterAny.utils,
          method: "getWorkspaceFoldersPaths",
        },
      ]);
      stubConfig();

      const { workspaceData, qpItems } = mocks.convertToQpData1();

      return {
        workspaceData,
        qpItems,
      };
    },
    convertToQpData2: () => {
      restoreStubbedMultiple([
        {
          object: dataConverterAny.utils,
          method: "getSplitter",
        },
        {
          object: dataConverterAny.utils,
          method: "getNameFromUri",
        },
        {
          object: dataConverterAny.utils,
          method: "normalizeUriPath",
        },
        {
          object: dataConverterAny.utils,
          method: "getWorkspaceFoldersPaths",
        },
      ]);
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(
        configuration.icons,
        true,
        configuration.itemsFilterPhrases,
        null
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
      stubMultiple([
        {
          object: dataConverterAny,
          method: "isCancelled",
          returns: true,
          isNotMethod: true,
        },
      ]);

      const { workspaceData } = mocks.convertToQpData4();

      return {
        workspaceData,
        qpItems: [],
      };
    },
  };
};
