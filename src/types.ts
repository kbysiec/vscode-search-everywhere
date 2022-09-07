import * as vscode from "vscode";

export enum ActionTrigger {
  Search = "Search",
  Reload = "Reload",
  Startup = "Startup",
  ConfigurationChange = "ConfigurationChange",
  WorkspaceFoldersChange = "WorkspaceFoldersChange",
  DidChangeTextDocument = "DidChangeTextDocument",
  DidRenameFiles = "DidRenameFiles",
  DidCreateFiles = "DidCreateFiles",
  DidDeleteFiles = "DidDeleteFiles",
  ReloadUnsavedUri = "ReloadUnsavedUri",
}

export enum ActionType {
  Rebuild = "Rebuild",
  Update = "Update",
  Remove = "Remove",
}

export enum DetailedActionType {
  CreateNewFile = "CreateNewFile",
  CreateNewDirectory = "CreateNewDirectory",
  RenameOrMoveFile = "RenameOrMoveFile",
  RenameOrMoveDirectory = "RenameOrMoveDirectory",
  RemoveFile = "RemoveFile",
  RemoveDirectory = "RemoveDirectory",
  TextChange = "TextChange",
  ReloadUnsavedUri = "ReloadUnsavedUri",
}

export enum ExcludeMode {
  SearchEverywhere = "search everywhere",
  FilesAndSearch = "files and search",
  Gitignore = "gitignore",
}

export interface Action {
  type: ActionType;
  fn: Function;
  trigger?: string;
  uri?: vscode.Uri;
  id?: number;
}

export interface Icons {
  [symbolKind: number]: string;
}

export interface IndexStats {
  ElapsedTimeInSeconds: number;
  ScannedUrisCount: number;
  IndexedItemsCount: number;
}

export interface Item {
  uri: vscode.Uri;
  elements: Array<vscode.DocumentSymbol | vscode.Uri>;
}

export interface ItemsFilter {
  allowedKinds?: number[];
  ignoredKinds?: number[];
  ignoredNames?: string[];
}

export interface ItemsFilterPhrases {
  [symbolKind: number]: string;
}

export interface QuickPickItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
  symbolKind: number;
  range?: Range;
  isHelp?: boolean;
}

export interface Range {
  start: vscode.Position;
  end: vscode.Position;
}

export interface WorkspaceData {
  items: Map<string, Item>;
  count: number;
}
