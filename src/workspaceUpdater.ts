import * as vscode from "vscode";
import { updateData } from "./cache";
import { DetailedActionType, QuickPickItem } from "./types";
import { utils } from "./utils";
import { workspaceCommon as common } from "./workspaceCommon";

async function updateUri(uri: vscode.Uri) {
  const dataForUri = await common.downloadData([uri]);
  const data = mergeWithDataFromCache(dataForUri);
  updateData(data);
}

function updateFolder(uri: vscode.Uri, oldUri: vscode.Uri) {
  const data = common.getData();
  const updatedData = utils.updateQpItemsWithNewDirectoryPath(
    data,
    oldUri!,
    uri
  );
  updateData(updatedData);
}

function mergeWithDataFromCache(data: QuickPickItem[]): QuickPickItem[] {
  const dataFromCache = common.getData();
  return dataFromCache.concat(data);
}

export async function updateCacheByPath(
  uri: vscode.Uri,
  detailedActionType: DetailedActionType,
  oldUri?: vscode.Uri
) {
  try {
    const updateFnByDetailedActionType: { [key: string]: Function } = {
      [DetailedActionType.CreateNewFile]: updateUri.bind(null, uri),
      [DetailedActionType.RenameOrMoveFile]: updateUri.bind(null, uri),
      [DetailedActionType.TextChange]: updateUri.bind(null, uri),
      [DetailedActionType.ReloadUnsavedUri]: updateUri.bind(null, uri),
      [DetailedActionType.RenameOrMoveDirectory]: updateFolder.bind(
        null,
        uri,
        oldUri!
      ),
    };

    const updateFn = updateFnByDetailedActionType[detailedActionType];
    updateFn && (await updateFn());
  } catch (error) {
    utils.printErrorMessage(error as Error);
    await common.index("on error catch");
  }
}
