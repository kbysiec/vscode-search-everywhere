import * as vscode from "vscode";
import Cache from "./cache";
import DataService from "./dataService";
import QuickPickItem from "./interface/quickPickItem";
import Utils from "./utils";
import WorkspaceCommon from "./workspaceCommon";

class WorkspaceRemover {
  constructor(
    private common: WorkspaceCommon,
    private dataService: DataService,
    private cache: Cache,
    private utils: Utils
  ) {}

  async removeFromCacheByPath(uri: vscode.Uri): Promise<void> {
    let data = this.common.getData();
    if (data) {
      const isUriExistingInWorkspace =
        await this.dataService.isUriExistingInWorkspace(uri);

      data = isUriExistingInWorkspace
        ? this.removeFromDataForExistingUriInWorkspace(data, uri)
        : this.removeFromDataAfterItemsWereMovedToAnotherDirectoryOrDirectoryWasRenamed(
            data,
            uri
          );
      this.cache.updateData(data);
    }
  }

  private removeFromDataForExistingUriInWorkspace(
    data: QuickPickItem[],
    uri: vscode.Uri
  ): QuickPickItem[] {
    return data.filter(
      (qpItem: QuickPickItem) => qpItem.uri.fsPath !== uri.fsPath
    );
  }

  private removeFromDataAfterItemsWereMovedToAnotherDirectoryOrDirectoryWasRenamed(
    data: QuickPickItem[],
    uri: vscode.Uri
  ): QuickPickItem[] {
    this.fetchUrisForDirectoryPathUpdate(data, uri); // check if necessary
    this.common.directoryUriBeforePathUpdate = uri;

    return this.common.wasDirectoryRenamed()
      ? data
      : data.filter((qpItem: QuickPickItem) => {
          return !qpItem.uri.fsPath.includes(uri.fsPath);
        });
  }

  private fetchUrisForDirectoryPathUpdate(
    data: QuickPickItem[],
    uri: vscode.Uri
  ): void {
    this.common.urisForDirectoryPathUpdate =
      this.utils.getUrisForDirectoryPathUpdate(data, uri, this.common.fileKind);
  }
}

export default WorkspaceRemover;
