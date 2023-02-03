import * as sinon from "sinon";
import * as vscode from "vscode";
import { utils } from "../../utils";
import { getItem } from "../util/itemMockFactory";
import { getWorkspaceData } from "../util/mockFactory";
import { getQpItem } from "../util/qpItemMockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  const stubWorkspaceFolders = (paths: string[] | undefined) => {
    let index = 0;

    const workspaceFolders = paths
      ? paths.map((path) => ({
          index: index++,
          name: path,
          uri: vscode.Uri.file(path),
        }))
      : undefined;

    stubMultiple(
      [
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: workspaceFolders,
          isNotMethod: true,
        },
      ],
      sandbox
    );
  };

  return {
    afterEach: () => {
      sandbox.restore();
    },
    hasWorkspaceAnyFolder1: () => {
      stubWorkspaceFolders(["/#"]);
    },
    hasWorkspaceAnyFolder2: () => {
      stubWorkspaceFolders([]);
    },
    hasWorkspaceMoreThanOneFolder1: () => {
      stubWorkspaceFolders(["/#", "/test/#"]);
    },
    hasWorkspaceMoreThanOneFolder2: () => {
      stubWorkspaceFolders(["/#"]);
    },
    printNoFolderOpenedMessage1: () => {
      return stubMultiple(
        [
          {
            object: vscode.window,
            method: "showInformationMessage",
          },
        ],
        sandbox
      );
    },
    printNoFolderOpenedMessage2: () => {
      return stubMultiple(
        [
          {
            object: vscode.window,
            method: "showInformationMessage",
          },
        ],
        sandbox
      );
    },
    printStatsMessage1: () => {
      return stubMultiple(
        [
          {
            object: vscode.window,
            method: "showInformationMessage",
          },
        ],
        sandbox
      );
    },
    clearWorkspaceData1: () => {
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

      return getWorkspaceData(workspaceDataItems);
    },
    sleepAndExecute1: () => {
      return sinon.stub();
    },
    updateQpItemsWithNewDirectoryPath1: () => {
      stubWorkspaceFolders([
        "/test/path/to/workspace",
        "/test2/path2/to2/workspace2",
      ]);
    },
    updateQpItemsWithNewDirectoryPath2: () => {
      stubWorkspaceFolders([
        "/test/path/to/workspace",
        "/test2/path2/to2/workspace2",
      ]);
    },
    normalizeUriPath1: () => {
      stubWorkspaceFolders([
        "/common/path/folder1/subfolder",
        "/common/path/folder2/subfolder",
      ]);
      stubMultiple(
        [
          {
            object: utils,
            method: "getWorkspaceFoldersCommonPathProp",
            returns: "/common/path",
          },
        ],
        sandbox
      );
      return {
        item: getItem("/common/path/folder1/subfolder/"),
        qpItem: getQpItem("/folder1/subfolder/"),
      };
    },
    normalizeUriPath2: () => {
      stubWorkspaceFolders(["/test/path/to/workspace"]);

      return {
        item: getItem("/test/path/to/workspace/"),
        qpItem: getQpItem(""),
      };
    },
    normalizeUriPath3: () => {
      stubWorkspaceFolders(undefined);

      return {
        item: getItem(),
        qpItem: getQpItem(),
      };
    },
    getStructure1: () => {
      const workspaceDataItems = [
        {
          uri: vscode.Uri.file("/fake/fake-1.ts"),
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
              {
                name: "fake-1.ts§&§test name 2",
                detail: "test details 2",
                kind: 1,
                range: new vscode.Range(
                  new vscode.Position(4, 0),
                  new vscode.Position(5, 0)
                ),
                selectionRange: new vscode.Range(
                  new vscode.Position(4, 0),
                  new vscode.Position(5, 0)
                ),
                children: [],
              },
              {
                name: "test name 3",
                detail: "test details 3",
                kind: 1,
                range: new vscode.Range(
                  new vscode.Position(9, 0),
                  new vscode.Position(9, 0)
                ),
                selectionRange: new vscode.Range(
                  new vscode.Position(9, 0),
                  new vscode.Position(9, 0)
                ),
                children: [],
              },
            ];
          },
        },
        {
          uri: vscode.Uri.file("/fake-other/fake-2.ts"),
          get elements() {
            return [this.uri];
          },
        },
        {
          uri: vscode.Uri.file("/fake-another/fake-3.ts"),
          get elements() {
            return [];
          },
        },
      ];

      return getWorkspaceData(workspaceDataItems);
    },
    setWorkspaceFoldersCommonPath1: () => {
      stubWorkspaceFolders(["/#"]);
    },
    setWorkspaceFoldersCommonPath2: () => {
      stubWorkspaceFolders(undefined);
    },
    setWorkspaceFoldersCommonPath3: () => {
      stubWorkspaceFolders([
        "/common/path/folder1/subfolder",
        "/common/path/folder2/subfolder",
      ]);
    },
  };
};
