import * as vscode from "vscode";
import { database } from "./database";
import { DetailedActionType, QuickPickItem } from "./types";

function removeUri(uri: vscode.Uri): void {
  database.deleteByUri(uri.toString());
}

function removeFolder(uri: vscode.Uri): void {
  database.deleteByUriPrefix(uri.toString());
}

export function removeFromCacheByPath(
  uri: vscode.Uri,
  detailedActionType: DetailedActionType
) {
  const removeFnByDetailedActionType: { [key: string]: Function } = {
    [DetailedActionType.RenameOrMoveFile]: removeUri.bind(null, uri),
    [DetailedActionType.RemoveFile]: removeUri.bind(null, uri),
    [DetailedActionType.TextChange]: removeUri.bind(null, uri),
    [DetailedActionType.ReloadUnsavedUri]: removeUri.bind(null, uri),
    [DetailedActionType.RemoveDirectory]: removeFolder.bind(null, uri),
    [DetailedActionType.RenameOrMoveDirectory]: removeFolder.bind(null, uri),
  };
  removeFnByDetailedActionType[detailedActionType]();
  database.schedulePersist();
}
