import * as vscode from "vscode";
import DataService from "../../dataService";
import ItemsFilter from "../../interface/itemsFilter";
import {
  getItems,
  getDocumentSymbolItemSingleLineArray,
} from "../util/itemMockFactory";
import {
  getWorkspaceData,
  getItemsFilter,
  getEventEmitter,
} from "../util/mockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (dataService: DataService) => {
  const dataServiceAny = dataService as any;

  let stubConfig = (
    includePatterns: string = "",
    excludePatterns: string[] = [],
    shouldUseFilesAndSearchExclude: boolean = false,
    filesAndSearchExcludePatterns: string[] = [],
    itemsFilter: ItemsFilter = {}
  ) => {
    stubMultiple([
      {
        object: dataServiceAny,
        method: "includePatterns",
        returns: includePatterns,
        isNotMethod: true,
      },
      {
        object: dataServiceAny,
        method: "excludePatterns",
        returns: excludePatterns,
        isNotMethod: true,
      },
      {
        object: dataServiceAny,
        method: "shouldUseFilesAndSearchExclude",
        returns: shouldUseFilesAndSearchExclude,
        isNotMethod: true,
      },
      {
        object: dataServiceAny,
        method: "filesAndSearchExcludePatterns",
        returns: filesAndSearchExcludePatterns,
        isNotMethod: true,
      },
      {
        object: dataServiceAny,
        method: "itemsFilter",
        returns: itemsFilter,
        isNotMethod: true,
      },
    ]);
  };

  return {
    reload1: () => {
      return stubMultiple([{ object: dataServiceAny, method: "fetchConfig" }]);
    },
    cancel1: () => {
      return stubMultiple([{ object: dataServiceAny, method: "setCancelled" }]);
    },
    fetchData1: () => {
      restoreStubbedMultiple([
        { object: dataServiceAny.utils, method: "createWorkspaceData" },
      ]);
      stubConfig();
      stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "createWorkspaceData",
          returns: getWorkspaceData(),
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: Promise.resolve(getItems()),
        },
        {
          object: dataServiceAny,
          method: "loadAllSymbolsForUri",
          returns: Promise.resolve(getDocumentSymbolItemSingleLineArray(1)),
        },
      ]);
    },
    isUriExistingInWorkspace1: () => {
      stubMultiple([
        {
          object: dataServiceAny,
          method: "fetchUris",
          returns: Promise.resolve(getItems()),
        },
      ]);
    },
    isUriExistingInWorkspace2: () => {
      stubMultiple([
        {
          object: dataServiceAny,
          method: "fetchUris",
          returns: Promise.resolve(getItems()),
        },
      ]);
    },
    fetchUris1: () => {
      const items = getItems();
      restoreStubbedMultiple([
        {
          object: vscode.workspace,
          method: "findFiles",
        },
      ]);
      stubConfig();

      stubMultiple([
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: Promise.resolve(items),
        },
      ]);

      return items;
    },
    fetchUris2: () => {
      restoreStubbedMultiple([
        { object: dataServiceAny.utils, method: "printErrorMessage" },
        {
          object: vscode.workspace,
          method: "findFiles",
        },
      ]);
      stubConfig();
      return stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "printErrorMessage",
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          throws: "test error",
        },
      ]);
    },
    getUris1: () => {
      const items = getItems();
      stubMultiple([
        {
          object: dataServiceAny,
          method: "fetchUris",
          returns: Promise.resolve(items),
        },
      ]);

      return items;
    },
    getUris2: () => {
      const items = getItems();
      stubMultiple([
        {
          object: dataServiceAny,
          method: "fetchUris",
          returns: Promise.resolve(items),
        },
      ]);

      return items;
    },
    getIncludePattern1: () => {
      const pattern = "**/*.{js}";
      stubConfig(pattern, [], false, [], getItemsFilter([1, 2]));

      return pattern;
    },
    getExcludePatterns1: () => {
      const patterns = ["**/node_modules/**"];
      stubConfig("", patterns, false, []);

      return patterns;
    },
    getExcludePatterns2: () => {
      const patterns = ["**/node_modules/**"];
      stubConfig("", [], true, patterns);

      return patterns;
    },
    includeSymbols1: () => {
      stubMultiple([
        {
          object: dataServiceAny,
          method: "getSymbolsForUri",
          returns: Promise.resolve(getDocumentSymbolItemSingleLineArray(3)),
        },
      ]);
    },
    includeSymbol2: () => {
      restoreStubbedMultiple([
        { object: dataServiceAny.utils, method: "sleep" },
      ]);
      return stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "sleep",
          returns: Promise.resolve(),
        },
        {
          object: dataServiceAny,
          method: "getSymbolsForUri",
          returns: Promise.resolve(undefined),
        },
      ]);
    },
    includeSymbol3: () => {
      const eventEmitter = getEventEmitter();
      stubMultiple([
        {
          object: dataServiceAny,
          method: "getSymbolsForUri",
          returns: Promise.resolve(getDocumentSymbolItemSingleLineArray(3)),
        },
        {
          object: dataServiceAny,
          method: "onDidItemIndexedEventEmitter",
          returns: eventEmitter,
          isNotMethod: true,
        },
      ]);

      return eventEmitter;
    },
    includeSymbol4: () => {
      restoreStubbedMultiple([
        { object: dataServiceAny.utils, method: "clearWorkspaceData" },
      ]);
      return stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "clearWorkspaceData",
        },
        {
          object: dataServiceAny,
          method: "isCancelled",
          returns: true,
          isNotMethod: true,
        },
      ]);
    },
    includeUris1: () => {
      stubConfig();
    },
    includeUris2: () => {
      stubConfig();
    },
    includeUris3: () => {
      restoreStubbedMultiple([
        { object: dataServiceAny.utils, method: "clearWorkspaceData" },
      ]);
      stubConfig();

      return stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "clearWorkspaceData",
        },
        {
          object: dataServiceAny,
          method: "isCancelled",
          returns: true,
          isNotMethod: true,
        },
      ]);
    },
    getSymbolsForUri1: () => {
      stubConfig();
      const documentSymbolItems = getDocumentSymbolItemSingleLineArray(2);
      stubMultiple([
        {
          object: dataServiceAny,
          method: "loadAllSymbolsForUri",
          returns: Promise.resolve(documentSymbolItems),
        },
      ]);

      return documentSymbolItems;
    },
    getSymbolsForUri2: () => {
      stubMultiple([
        {
          object: dataServiceAny,
          method: "loadAllSymbolsForUri",
          returns: Promise.resolve(undefined),
        },
      ]);
    },
    loadAllSymbolsForUri1: () => {
      return stubMultiple([
        {
          object: vscode.commands,
          method: "executeCommand",
        },
      ]);
    },
    reduceAndFlatSymbolsArrayForUri1: () => {
      restoreStubbedMultiple([
        {
          object: dataServiceAny.utils,
          method: "getSplitter",
        },
      ]);
      stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "getSplitter",
          returns: "§&§",
        },
      ]);
    },
    filterUris1: () => {
      stubConfig("", [], false, [], getItemsFilter([], [], ["fake-1"]));
    },
    filterSymbols1: () => {
      stubConfig("", [], false, [], getItemsFilter([], [1, 3, 4]));
    },
    isUriValid1: () => {
      stubConfig("", [], false, [], getItemsFilter([0, 1]));
    },
    isUriValid2: () => {
      stubConfig("", [], false, [], getItemsFilter([2, 3]));
    },
    isSymbolValid1: () => {
      stubConfig("", [], false, [], getItemsFilter([1, 2]));
    },
    isSymbolValid2: () => {
      stubConfig("", [], false, [], getItemsFilter([2, 3]));
    },
    isItemValid1: () => {
      stubConfig();
    },
    isItemValid2: () => {
      stubConfig("", [], false, [], getItemsFilter([0]));
    },
    isItemValid3: () => {
      stubConfig("", [], false, [], getItemsFilter([1]));
    },
    isItemValid4: () => {
      stubConfig("", [], false, [], getItemsFilter([], [0]));
    },
    isItemValid5: () => {
      stubConfig("", [], false, [], getItemsFilter([], [], ["fake"]));
    },
    fetchConfig1: () => {
      restoreStubbedMultiple([
        { object: dataServiceAny.config, method: "getInclude" },
        { object: dataServiceAny.config, method: "getExclude" },
        {
          object: dataServiceAny.config,
          method: "shouldUseFilesAndSearchExclude",
        },
        { object: dataServiceAny.config, method: "getFilesAndSearchExclude" },
        { object: dataServiceAny.config, method: "getItemsFilter" },
      ]);

      return stubMultiple([
        {
          object: dataServiceAny.config,
          method: "getInclude",
        },
        {
          object: dataServiceAny.config,
          method: "getExclude",
        },
        {
          object: dataServiceAny.config,
          method: "shouldUseFilesAndSearchExclude",
        },
        {
          object: dataServiceAny.config,
          method: "getFilesAndSearchExclude",
        },
        {
          object: dataServiceAny.config,
          method: "getItemsFilter",
        },
      ]);
    },
  };
};
