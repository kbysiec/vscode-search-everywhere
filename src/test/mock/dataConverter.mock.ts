import * as vscode from "vscode";
import { QuickPickItem } from "../../types";
import { getWorkspaceData } from "../util/mockFactory";

export const itemUntitledUri = vscode.Uri.file("./fake/fake-1.ts");
(itemUntitledUri as any).scheme = "untitled";

export const qpItemUntitled: QuickPickItem = {
  label: "fake-1.ts",
  uri: itemUntitledUri,
  symbolKind: 0,
};

export const mocks = {
  workspaceFolders: [
    {
      index: 0,
      name: "/test/path/to/workspace",
      uri: vscode.Uri.file("/test/path/to/workspace"),
    },
    {
      index: 1,
      name: "/test2/path2/to2/workspace2",
      uri: vscode.Uri.file("/test2/path2/to2/workspace2"),
    },
  ],
  convertToQpData1() {
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
    ];

    const workspaceData = getWorkspaceData(workspaceDataItems);
    const qpItems = [
      {
        label: "fake-1.ts",
        description: "File",
        detail: "/./fake/fake-1.ts",
        uri: workspaceDataItems[0].uri,
        symbolKind: 0,
        range: {
          start: new vscode.Position(0, 0),
          end: new vscode.Position(0, 0),
        },
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
      },
      {
        label: "test name",
        description: "Module at lines: 1 - 4 in fake-1.ts",
        detail: "/./fake/fake-1.ts",
        uri: workspaceDataItems[0].uri,
        symbolKind: 1,
        range: {
          start: new vscode.Position(0, 0),
          end: new vscode.Position(3, 0),
        },
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
      },
      {
        label: "test name 2",
        description: "Module at lines: 5 - 6 in fake-1.ts",
        detail: "/./fake/fake-1.ts",
        uri: workspaceDataItems[0].uri,
        symbolKind: 1,
        range: {
          start: new vscode.Position(4, 0),
          end: new vscode.Position(5, 0),
        },
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
      },
      {
        label: "test name 3",
        description: "Module at line: 10",
        detail: "/./fake/fake-1.ts",
        uri: workspaceDataItems[0].uri,
        symbolKind: 1,
        range: {
          start: new vscode.Position(9, 0),
          end: new vscode.Position(9, 0),
        },
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
      },
    ];

    return {
      workspaceData,
      qpItems,
    };
  },
  convertToQpData2() {
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
            {
              name: "test name 2",
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
          ];
        },
      },
    ];

    const workspaceData = getWorkspaceData(workspaceDataItems);
    const qpItems = [
      {
        label: "$(fake-icon)  fake-1.ts",
        description: "[$$fake-1.ts] File",
        detail: "/./fake/fake-1.ts",
        uri: workspaceDataItems[0].uri,
        symbolKind: 0,
        range: {
          start: new vscode.Position(0, 0),
          end: new vscode.Position(0, 0),
        },
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
      },
      {
        label: "$(another-fake-icon)  test name",
        description: "[^^test name] Module at lines: 1 - 4 in fake-1.ts",
        detail: "/./fake/fake-1.ts",
        uri: workspaceDataItems[0].uri,
        symbolKind: 1,
        range: {
          start: new vscode.Position(0, 0),
          end: new vscode.Position(3, 0),
        },
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
      },
      {
        label: "$(another-fake-icon)  test name 2",
        description: "[^^test name 2] Module at lines: 5 - 6",
        detail: "/./fake/fake-1.ts",
        uri: workspaceDataItems[0].uri,
        symbolKind: 1,
        range: {
          start: new vscode.Position(4, 0),
          end: new vscode.Position(5, 0),
        },
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
      },
    ];

    return {
      workspaceData,
      qpItems,
    };
  },
  convertToQpData4() {
    const workspaceDataItems = [
      {
        uri: vscode.Uri.file("/./fake/fake-1.ts"),
        get elements() {
          return [this.uri];
        },
      },
    ];

    const workspaceData = getWorkspaceData(workspaceDataItems);

    return {
      workspaceData,
    };
  },
};
