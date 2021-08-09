import * as sinon from "sinon";
import * as vscode from "vscode";
import ExcludeMode from "../../enum/excludeMode";
import { getTextDocumentStub } from "./stubFactory";

export const getWorkspaceFoldersChangeEvent = (flag: boolean) => {
  return flag
    ? {
        added: [
          {
            uri: vscode.Uri.file("#"),
            name: "test workspace folder",
            index: 1,
          },
        ],
        removed: [],
      }
    : {
        added: [],
        removed: [],
      };
};

export const getConfigurationChangeEvent = (
  flag: boolean = true,
  shouldUseExcludedArray: boolean = true,
  isExcluded: boolean = true,
  excludeMode: ExcludeMode = ExcludeMode.SearchEverywhere,
  flagForFilesExclude: boolean = false,
  flagForSearchExclude: boolean = false
) => {
  const defaultSection = "searchEverywhere";

  return {
    affectsConfiguration: (section: string) =>
      defaultSection === section
        ? flag
        : shouldUseExcludedArray
        ? flag && isExcluded
        : excludeMode === ExcludeMode.FilesAndSearch
        ? section === "files.exclude"
          ? flagForFilesExclude
          : section === "search.exclude"
          ? flagForSearchExclude
          : false
        : flag,
  };
};

export const getTextDocumentChangeEvent = (
  shouldContentBeChanged: boolean = false
): vscode.TextDocumentChangeEvent => {
  const textDocumentChangeEvent = {
    document: getTextDocumentStub(),
    contentChanges: [],
  };
  shouldContentBeChanged &&
    (textDocumentChangeEvent as any).contentChanges.push("test change");

  return textDocumentChangeEvent;
};

export const getFileRenameEvent = (isDirectory: boolean = false) => ({
  files: isDirectory
    ? [
        {
          oldUri: vscode.Uri.file("./test"),
          newUri: vscode.Uri.file("./testNew"),
        },
      ]
    : [
        {
          oldUri: vscode.Uri.file("./test/#"),
          newUri: vscode.Uri.file("./testNew/#"),
        },
        {
          oldUri: vscode.Uri.file("./test2/#"),
          newUri: vscode.Uri.file("./testNew2/#"),
        },
      ],
});

export const getFileCreateEvent = () => ({
  files: [vscode.Uri.file("./#")],
});

export const getFileDeleteEvent = () => ({
  files: [vscode.Uri.file("./#")],
});

export const getFileWatcherStub = () => {
  return {
    ignoreCreateEvents: false,
    ignoreChangeEvents: false,
    ignoreDeleteEvents: false,
    onDidChange: sinon.stub(),
    onDidCreate: sinon.stub(),
    onDidDelete: sinon.stub(),
    dispose: () => {},
  };
};

export const getQuickPickOnDidChangeValueEventListeners = (
  count: number = 2
): vscode.Disposable[] => {
  const array: vscode.Disposable[] = [];
  for (let i = 0; i < count; i++) {
    array.push(new vscode.Disposable(() => {}));
  }
  return array;
};
