import * as vscode from "vscode";
import { updateData } from "./cache";
// import Cache from "./cache";
import DetailedActionType from "./enum/detailedActionType";
import QuickPickItem from "./interface/quickPickItem";
import { utils } from "./utils";
// import Utils from "./utils";
import WorkspaceCommon from "./workspaceCommon";

class WorkspaceUpdater {
  constructor(private common: WorkspaceCommon) {}

  async updateCacheByPath(
    uri: vscode.Uri,
    detailedActionType: DetailedActionType,
    oldUri?: vscode.Uri
  ) {
    try {
      const updateFnByDetailedActionType: { [key: string]: Function } = {
        [DetailedActionType.CreateNewFile]: this.updateUri.bind(this, uri),
        [DetailedActionType.RenameOrMoveFile]: this.updateUri.bind(this, uri),
        [DetailedActionType.TextChange]: this.updateUri.bind(this, uri),
        [DetailedActionType.RenameOrMoveDirectory]: this.updateFolder.bind(
          this,
          uri,
          oldUri!
        ),
      };

      const updateFn = updateFnByDetailedActionType[detailedActionType];
      updateFn && (await updateFn());
    } catch (error) {
      utils.printErrorMessage(error as Error);
      await this.common.index("on error catch");
    }
  }

  private async updateUri(uri: vscode.Uri) {
    const dataForUri = await this.common.downloadData([uri]);
    const data = this.mergeWithDataFromCache(dataForUri);
    updateData(data);
  }

  private updateFolder(uri: vscode.Uri, oldUri: vscode.Uri) {
    const data = this.common.getData();
    const updatedData = utils.updateQpItemsWithNewDirectoryPath(
      data,
      oldUri!,
      uri
    );
    updateData(updatedData);
  }

  private mergeWithDataFromCache(data: QuickPickItem[]): QuickPickItem[] {
    const dataFromCache = this.common.getData();
    return dataFromCache.concat(data);
  }
}

export default WorkspaceUpdater;
