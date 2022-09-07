import * as vscode from "vscode";
import { updateData } from "./cache";
import { DetailedActionType, QuickPickItem } from "./types";
import { workspaceCommon as common } from "./workspaceCommon";

function removeUri(data: QuickPickItem[], uri: vscode.Uri): QuickPickItem[] {
  return data.filter((qpItem: QuickPickItem) => qpItem.uri.path !== uri.path);
}

function removeFolder(data: QuickPickItem[], uri: vscode.Uri) {
  return data.filter((qpItem: QuickPickItem) => {
    return !qpItem.uri.path.includes(uri.path);
  });
}

export function removeFromCacheByPath(
  uri: vscode.Uri,
  detailedActionType: DetailedActionType
) {
  let data = common.getData();

  const removeFnByDetailedActionType: { [key: string]: Function } = {
    [DetailedActionType.RenameOrMoveFile]: removeUri.bind(null, data, uri),
    [DetailedActionType.RemoveFile]: removeUri.bind(null, data, uri),
    [DetailedActionType.TextChange]: removeUri.bind(null, data, uri),
    [DetailedActionType.ReloadUnsavedUri]: removeUri.bind(null, data, uri),
    [DetailedActionType.RemoveDirectory]: removeFolder.bind(null, data, uri),
    [DetailedActionType.RenameOrMoveDirectory]: removeFolder.bind(
      null,
      data,
      uri
    ),
  };
  data = removeFnByDetailedActionType[detailedActionType]();
  updateData(data);
}
