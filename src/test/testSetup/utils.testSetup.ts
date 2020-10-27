import * as vscode from "vscode";
import Utils from "../../utils";
import { getWorkspaceData } from "../util/mockFactory";
import { stubMultiple, restoreStubbedMultiple } from "../util/stubHelpers";

export const getTestSetups = (utils: Utils) => {
  const utilsAny = utils as any;

  return {
    hasWorkspaceAnyFolder1: () => {
      stubMultiple([
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: ["/#"],
          isNotMethod: true,
        },
      ]);
    },
    hasWorkspaceAnyFolder2: () => {
      stubMultiple([
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: [],
          isNotMethod: true,
        },
      ]);
    },
    hasWorkspaceMoreThanOneFolder1: () => {
      stubMultiple([
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: ["/#", "/test/#"],
          isNotMethod: true,
        },
      ]);
    },
    hasWorkspaceMoreThanOneFolder2: () => {
      stubMultiple([
        {
          object: vscode.workspace,
          method: "workspaceFolders",
          returns: ["/#"],
          isNotMethod: true,
        },
      ]);
    },
    shouldReindexOnConfigurationChange1: () => {
      restoreStubbedMultiple([
        { object: utilsAny.config, method: "shouldUseFilesAndSearchExclude" },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldUseFilesAndSearchExclude",
          returns: false,
        },
      ]);
    },
    shouldReindexOnConfigurationChange2: () => {
      restoreStubbedMultiple([
        { object: utilsAny.config, method: "shouldUseFilesAndSearchExclude" },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldUseFilesAndSearchExclude",
          returns: false,
        },
      ]);
    },
    shouldReindexOnConfigurationChange3: () => {
      restoreStubbedMultiple([
        { object: utilsAny.config, method: "shouldUseFilesAndSearchExclude" },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldUseFilesAndSearchExclude",
          returns: false,
        },
      ]);
    },
    shouldReindexOnConfigurationChange4: () => {
      restoreStubbedMultiple([
        { object: utilsAny.config, method: "shouldUseFilesAndSearchExclude" },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldUseFilesAndSearchExclude",
          returns: true,
        },
      ]);
    },
    shouldReindexOnConfigurationChange5: () => {
      restoreStubbedMultiple([
        { object: utilsAny.config, method: "shouldUseFilesAndSearchExclude" },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldUseFilesAndSearchExclude",
          returns: true,
        },
      ]);
    },
    printNoFolderOpenedMessage1: () => {
      return stubMultiple([
        {
          object: vscode.window,
          method: "showInformationMessage",
        },
      ]);
    },
    printNoFolderOpenedMessage2: () => {
      restoreStubbedMultiple([
        { object: vscode.window, method: "showInformationMessage" },
      ]);

      return stubMultiple([
        {
          object: vscode.window,
          method: "showInformationMessage",
        },
      ]);
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
    getNotificationLocation1: () => {
      restoreStubbedMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
        },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
          returns: true,
        },
      ]);
    },
    getNotificationLocation2: () => {
      restoreStubbedMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
        },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
          returns: false,
        },
      ]);
    },
    getNotificationTitle1: () => {
      restoreStubbedMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
        },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
          returns: true,
        },
      ]);
    },
    getNotificationTitle2: () => {
      restoreStubbedMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
        },
      ]);
      stubMultiple([
        {
          object: utilsAny.config,
          method: "shouldDisplayNotificationInStatusBar",
          returns: false,
        },
      ]);
    },
  };
};
