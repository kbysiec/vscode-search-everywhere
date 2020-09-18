import * as vscode from "vscode";
import DataConverter from "../../dataConverter";
import Icons from "../../interface/icons";
import ItemsFilterPhrases from "../../interface/itemsFilterPhrases";
import { getConfiguration } from "../util/mockFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";
import * as mock from "../mock/dataConverter.mock";

export const getTestSetups = (dataConverter: DataConverter) => {
  const dataConverterAny = dataConverter as any;

  let stubConfig = (
    icons: Icons = {},
    shouldUseItemsFilterPhrases: boolean = false,
    itemsFilterPhrases: ItemsFilterPhrases = {}
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
      stubConfig();
    },
    getItemFilterPhraseForKind1: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubMultiple([
        {
          object: dataConverterAny,
          method: "itemsFilterPhrases",
          returns: configuration.itemsFilterPhrases,
          isNotMethod: true,
        },
      ]);
    },
    mapDataToQpData1: () => {
      stubConfig();
    },
    mapDataToQpData3: () => {
      stubMultiple([
        {
          object: dataConverterAny,
          method: "isCancelled",
          returns: true,
          isNotMethod: true,
        },
      ]);
    },
    mapItemElementToQpItem1: () => {
      stubConfig();
    },
    mapItemElementToQpItem2: () => {
      stubConfig();
    },
    mapDocumentSymbolToQpItem1: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubMultiple([
        {
          object: dataConverterAny,
          method: "icons",
          returns: {},
          isNotMethod: true,
        },
        {
          object: dataConverterAny,
          method: "shouldUseItemsFilterPhrases",
          returns: false,
          isNotMethod: true,
        },
        {
          object: dataConverterAny,
          method: "itemsFilterPhrases",
          returns: configuration.itemsFilterPhrases,
          isNotMethod: true,
        },
      ]);
    },
    mapDocumentSymbolToQpItem2: () => {
      restoreStubbedMultiple([
        {
          object: dataConverterAny.utils,
          method: "getSplitter",
        },
      ]);
      stubMultiple([
        {
          object: dataConverterAny.utils,
          method: "getSplitter",
          returns: "§&§",
        },
      ]);
      stubConfig();
    },
    mapDocumentSymbolToQpItem3: () => {
      stubConfig();
    },
    mapDocumentSymbolToQpItem4: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(configuration.icons);
    },
    mapDocumentSymbolToQpItem5: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(undefined, true, configuration.itemsFilterPhrases);
    },
    mapDocumentSymbolToQpItem6: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig({}, false, configuration.itemsFilterPhrases);
    },
    mapUriToQpItem1: () => {
      stubConfig();
    },
    mapUriToQpItem2: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(configuration.icons);
    },
    mapUriToQpItem3: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(undefined, true, configuration.itemsFilterPhrases);
    },
    mapUriToQpItem4: () => {
      const configuration = getConfiguration().searchEverywhere;
      stubConfig(undefined, false, configuration.itemsFilterPhrases);
    },
    normalizeUriPath1: () => {
      stubMultiple([
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: mock.workspaceFolders,
          isNotMethod: true,
        },
      ]);
    },
    getWorkspaceFoldersPaths1: () => {
      stubMultiple([
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: mock.workspaceFolders,
          isNotMethod: true,
        },
      ]);
    },
    fetchConfig1: () => {
      restoreStubbedMultiple([
        { object: dataConverterAny.config, method: "getIcons" },
        {
          object: dataConverterAny.config,
          method: "shouldUseItemsFilterPhrases",
        },
        { object: dataConverterAny.config, method: "getItemsFilterPhrases" },
      ]);

      return stubMultiple([
        {
          object: dataConverterAny.config,
          method: "getIcons",
        },
        {
          object: dataConverterAny.config,
          method: "shouldUseItemsFilterPhrases",
        },
        {
          object: dataConverterAny.config,
          method: "getItemsFilterPhrases",
        },
      ]);
    },
  };
};
