import * as vscode from "vscode";
import { database } from "./database";
import { DetailedActionType, QuickPickItem } from "./types";
import { utils } from "./utils";
import { workspaceIndexer as indexer } from "./workspaceIndexer";

async function updateUri(uri: vscode.Uri) {
  // Delete old data for this URI, then re-index and insert
  database.deleteByUri(uri.toString());
  const dataForUri = await indexer.downloadData([uri]);
  database.insertSymbolsBatch(dataForUri);
  database.schedulePersist();
}

function updateFolder(uri: vscode.Uri, oldUri: vscode.Uri) {
  // For directory renames, we need to update all URIs with the old prefix.
  // The simplest approach: the old paths were already removed by workspaceRemover.
  // New paths will be indexed via the update action if they are files.
  // For directories, VSCode fires individual file events for each file inside.
  // So this is a no-op; individual file updates handle it.
  database.schedulePersist();
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
    await indexer.index("on error catch");
  }
}
