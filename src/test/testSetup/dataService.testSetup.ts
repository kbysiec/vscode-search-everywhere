import * as vscode from "vscode";
import DataService from "../../dataService";
import ItemsFilter from "../../interface/itemsFilter";
import {
  getDocumentSymbolItemSingleLineArray,
  getItems,
} from "../util/itemMockFactory";
import { getItemsFilter, getWorkspaceData } from "../util/mockFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (dataService: DataService) => {
  const dataServiceAny = dataService as any;

  const stubConfig = (
    itemsFilter: ItemsFilter = {},
    isCancelled: boolean = false
  ) => {
    stubMultiple([
      {
        object: dataServiceAny,
        method: "itemsFilter",
        returns: itemsFilter,
        isNotMethod: true,
      },
      {
        object: dataServiceAny,
        method: "isCancelled",
        returns: isCancelled,
        isNotMethod: true,
      },
      {
        object: dataServiceAny.patternProvider,
        method: "getExcludePatterns",
        returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
      },
    ]);
  };

  const stubFetchingItems = () => {
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
        object: vscode.commands,
        method: "executeCommand",
        returns: Promise.resolve(getDocumentSymbolItemSingleLineArray(1)),
      },
    ]);
  };

  const restoreFetchingItemsStubs = () => {
    restoreStubbedMultiple([
      { object: dataServiceAny.utils, method: "createWorkspaceData" },
      { object: vscode.workspace, method: "findFiles" },
      { object: vscode.commands, method: "executeCommand" },
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
      stubFetchingItems();
    },
    fetchData2: () => {
      restoreFetchingItemsStubs();
      stubConfig();
      stubFetchingItems();
    },
    fetchData3: () => {
      restoreFetchingItemsStubs();
      stubConfig();
      stubFetchingItems();
    },
    fetchData4: () => {
      restoreStubbedMultiple([
        { object: dataServiceAny.utils, method: "printErrorMessage" },
        {
          object: vscode.workspace,
          method: "findFiles",
        },
        {
          object: vscode.commands,
          method: "executeCommand",
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
        {
          object: vscode.commands,
          method: "executeCommand",
        },
      ]);
    },
    fetchData5: () => {
      restoreFetchingItemsStubs();
      stubConfig();
      stubFetchingItems();
    },
    fetchData6: () => {
      restoreFetchingItemsStubs();
      restoreStubbedMultiple([
        { object: dataServiceAny.utils, method: "sleep" },
      ]);
      stubConfig();
      return stubMultiple([
        {
          object: dataServiceAny,
          method: "getSymbolsForUri",
          returns: Promise.resolve(undefined),
        },
        {
          object: dataServiceAny.utils,
          method: "createWorkspaceData",
          returns: getWorkspaceData(),
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: Promise.resolve(getItems(1)),
        },
        {
          object: vscode.commands,
          method: "executeCommand",
          returns: Promise.resolve(getDocumentSymbolItemSingleLineArray(1)),
        },
      ]);
    },
    fetchData7: () => {
      restoreFetchingItemsStubs();
      stubConfig(undefined, true);
      stubFetchingItems();
    },
    fetchData8: () => {
      restoreFetchingItemsStubs();
      stubConfig(getItemsFilter([0]));
      stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "createWorkspaceData",
          returns: getWorkspaceData(),
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: Promise.resolve(getItems(1)),
        },
        {
          object: vscode.commands,
          method: "executeCommand",
          returns: Promise.resolve(
            getDocumentSymbolItemSingleLineArray(1, true)
          ),
        },
      ]);
    },
    fetchData9: () => {
      restoreFetchingItemsStubs();
      stubConfig(getItemsFilter([], [0]));
      stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "createWorkspaceData",
          returns: getWorkspaceData(),
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: Promise.resolve(getItems(1)),
        },
        {
          object: vscode.commands,
          method: "executeCommand",
          returns: Promise.resolve(getDocumentSymbolItemSingleLineArray(1)),
        },
      ]);
    },
    fetchData10: () => {
      restoreFetchingItemsStubs();
      stubConfig(getItemsFilter([], [], ["fake"]));
      stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "createWorkspaceData",
          returns: getWorkspaceData(),
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: Promise.resolve(getItems(2)),
        },
        {
          object: vscode.commands,
          method: "executeCommand",
          returns: Promise.resolve(),
        },
      ]);
    },
    fetchData11: () => {
      restoreFetchingItemsStubs();
      stubConfig();

      const workspaceDataItems = [
        {
          uri: vscode.Uri.file("/./fake/fake-1.ts"),
          get elements() {
            return [
              this.uri,
              {
                name: "fake-1.ts§&§test name",
                detail: "test details",
                kind: 1,
                range: new vscode.Range(
                  new vscode.Position(0, 0),
                  new vscode.Position(3, 0)
                ),
                selectionRange: new vscode.Range(
                  new vscode.Position(0, 0),
                  new vscode.Position(3, 0)
                ),
                children: [],
              },
            ];
          },
        },
      ];

      stubMultiple([
        {
          object: dataServiceAny.utils,
          method: "createWorkspaceData",
          returns: getWorkspaceData(workspaceDataItems),
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: Promise.resolve(getItems(2)),
        },
        {
          object: vscode.commands,
          method: "executeCommand",
          returns: Promise.resolve(),
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
    isUriExistingInWorkspace3: () => {
      stubMultiple([
        {
          object: dataServiceAny,
          method: "uris",
          returns: getItems(),
          isNotMethod: true,
        },
      ]);
    },
    isUriExistingInWorkspace4: () => {
      stubMultiple([
        {
          object: dataServiceAny,
          method: "fetchUris",
          returns: Promise.resolve(getItems()),
        },
        {
          object: dataServiceAny,
          method: "uris",
          returns: [],
          isNotMethod: true,
        },
      ]);
    },
  };
};
