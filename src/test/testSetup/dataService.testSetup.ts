import * as sinon from "sinon";
import * as vscode from "vscode";
import * as config from "../../config";
import { dataService } from "../../dataService";
import { patternProvider } from "../../patternProvider";
import { ItemsFilter } from "../../types";
import { utils } from "../../utils";
import {
  getDocumentSymbolItemSingleLineArray,
  getItems,
} from "../util/itemMockFactory";
import {
  getConfiguration,
  getItemsFilter,
  getWorkspaceData,
} from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

const stubConfig = (
  sandbox: sinon.SinonSandbox,
  itemsFilter: ItemsFilter = {},
  isCancelled: boolean = false
) => {
  stubMultiple(
    [
      {
        object: dataService,
        method: "getItemsFilter",
        returns: itemsFilter,
      },
      {
        object: dataService,
        method: "getIsCancelled",
        returns: isCancelled,
      },
      {
        object: patternProvider,
        method: "getExcludePatterns",
        returns: Promise.resolve(["**/.history/**", "**/.vscode/**"]),
      },
      {
        object: patternProvider,
        method: "getIncludePatterns",
        returns: Promise.resolve(["**/**/*"]),
      },
      {
        object: utils,
        method: "getSplitter",
        returns: "§&§",
      },
    ],
    sandbox
  );
};

const stubFetchingItems = (sandbox: sinon.SinonSandbox) => {
  stubMultiple(
    [
      {
        object: utils,
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
        [{ object: dataService, method: "fetchConfig" }],
        sandbox
      );
    },
    cancel1: () => {
      return stubMultiple(
        [{ object: dataService, method: "setIsCancelled" }],
        sandbox
      );
    },
    fetchData1: () => {
      stubConfig(sandbox);
      stubFetchingItems(sandbox);
    },
    fetchData2: () => {
      stubConfig(sandbox);
      stubFetchingItems(sandbox);
    },
    fetchData3: () => {
      stubConfig(sandbox);
      stubFetchingItems(sandbox);
    },
    fetchData4: () => {
      stubConfig(sandbox);
      return stubMultiple(
        [
          {
            object: utils,
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
          {
            object: utils,
            method: "createWorkspaceData",
          },
        ],
        sandbox
      );
    },
    fetchData5: () => {
      stubConfig(sandbox);
      stubFetchingItems(sandbox);
    },
    fetchData6: () => {
      stubConfig(sandbox);
      return stubMultiple(
        [
          {
            object: dataService,
            method: "getSymbolsForUri",
            returns: Promise.resolve(undefined),
          },
          {
            object: utils,
            method: "sleep",
          },
          {
            object: utils,
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
        ],
        sandbox
      );
    },
    fetchData7: () => {
      stubConfig(sandbox, undefined, true);
      stubMultiple(
        [
          {
            object: utils,
            method: "clearWorkspaceData",
          },
        ],
        sandbox
      );
      stubFetchingItems(sandbox);
    },
    fetchData8: () => {
      stubConfig(sandbox, getItemsFilter([0]));
      stubMultiple(
        [
          {
            object: utils,
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
        ],
        sandbox
      );
    },
    fetchData9: () => {
      stubConfig(sandbox, getItemsFilter([], [0]));
      stubMultiple(
        [
          {
            object: utils,
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
        ],
        sandbox
      );
    },
    fetchData10: () => {
      stubConfig(sandbox, getItemsFilter([], [], ["fake"]));
      stubMultiple(
        [
          {
            object: utils,
            method: "createWorkspaceData",
            returns: getWorkspaceData(),
          },
          {
            object: utils,
            method: "sleep",
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
        ],
        sandbox
      );
    },
    fetchData11: () => {
      stubConfig(sandbox);

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

      stubMultiple(
        [
          {
            object: utils,
            method: "createWorkspaceData",
            returns: getWorkspaceData(workspaceDataItems),
          },
          {
            object: utils,
            method: "sleep",
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
        ],
        sandbox
      );
    },
    isUriExistingInWorkspace1: () => {
      stubMultiple(
        [
          {
            object: dataService,
            method: "fetchUris",
            returns: Promise.resolve(getItems()),
          },
        ],
        sandbox
      );
    },
    isUriExistingInWorkspace2: () => {
      stubMultiple(
        [
          {
            object: dataService,
            method: "fetchUris",
            returns: Promise.resolve(getItems()),
          },
        ],
        sandbox
      );
    },
    fetchConfig1: () => {
      const configuration = getConfiguration().searchEverywhere;
      const expected = configuration.itemsFilter;
      stubMultiple(
        [
          {
            object: config,
            method: "fetchItemsFilter",
            returns: expected,
          },
          {
            object: patternProvider,
            method: "fetchConfig",
          },
        ],
        sandbox
      );
      return expected;
    },
    fetchConfig2: () => {
      return stubMultiple(
        [
          {
            object: patternProvider,
            method: "fetchConfig",
          },
          {
            object: config,
            method: "fetchItemsFilter",
          },
        ],
        sandbox
      );
    },
  };
};
