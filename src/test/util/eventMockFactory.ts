import * as vscode from "vscode";
import * as sinon from "sinon";
import { getUntitledItem } from "./itemMockFactory";

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
  shouldUseFilesAndSearchExclude: boolean = false,
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
        : shouldUseFilesAndSearchExclude
        ? section === "files.exclude"
          ? flagForFilesExclude
          : section === "search.exclude"
          ? flagForSearchExclude
          : false
        : flag,
  };
};

export const getTextDocumentChangeEvent = async (
  shouldContentBeChanged: boolean = false
): Promise<vscode.TextDocumentChangeEvent> => {
  const itemUntitled = getUntitledItem();
  const textDocumentChangeEvent = {
    document: await vscode.workspace.openTextDocument(itemUntitled),
    contentChanges: [],
  };
  shouldContentBeChanged &&
    (textDocumentChangeEvent as any).contentChanges.push("test change");

  return textDocumentChangeEvent;
};

export const getFileRenameEvent = () => ({
  files: [
    {
      oldUri: vscode.Uri.file("./#"),
      newUri: vscode.Uri.file("./test/#"),
    },
  ],
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
