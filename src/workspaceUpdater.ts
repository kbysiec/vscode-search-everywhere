import * as vscode from "vscode";
import Cache from "./cache";
import DataService from "./dataService";
import QuickPickItem from "./interface/quickPickItem";
import Utils from "./utils";
import WorkspaceCommon from "./workspaceCommon";
import WorkspaceRemover from "./workspaceRemover";

class WorkspaceUpdater {
  constructor(
    private common: WorkspaceCommon,
    private remover: WorkspaceRemover,
    private dataService: DataService,
    private cache: Cache,
    private utils: Utils
  ) {}
  async updateCacheByPath(uri: vscode.Uri): Promise<void> {
    try {
      if (this.wasItemsMovedToAnotherDirectoryOrDirectoryWasRenamed()) {
        this.common.wasDirectoryRenamed()
          ? this.updateDataAfterDirectoryRenaming()
          : await this.updateDataAfterMovingToAnotherDirectory(uri);
      } else {
        (await this.dataService.isUriExistingInWorkspace(uri)) &&
          (await this.updateDataAfterChangesInExistingFile(uri));
      }
      this.cleanDirectoryRenamingData();
    } catch (error) {
      this.utils.printErrorMessage(error);
      await this.common.index("on error catch");
    }
  }

  private wasItemsMovedToAnotherDirectoryOrDirectoryWasRenamed(): boolean {
    return (
      !!this.common.urisForDirectoryPathUpdate &&
      !!this.common.urisForDirectoryPathUpdate.length
    );
  }

  private updateDataAfterDirectoryRenaming(): void {
    let data = this.common.getData();
    if (data) {
      data = this.utils.updateQpItemsWithNewDirectoryPath(
        data,
        this.common.directoryUriBeforePathUpdate!,
        this.common.directoryUriAfterPathUpdate!
      );
      this.cache.updateData(data);
    }
  }

  private async updateDataAfterMovingToAnotherDirectory(
    uri: vscode.Uri
  ): Promise<void> {
    await this.updateDataForExistingUriInWorkspace(uri);
  }

  private async updateDataAfterChangesInExistingFile(
    uri: vscode.Uri
  ): Promise<void> {
    await this.updateDataForExistingUriInWorkspace(uri);
  }

  private cleanDirectoryRenamingData() {
    this.common.directoryUriBeforePathUpdate = null;
    this.common.directoryUriAfterPathUpdate = null;
    this.common.urisForDirectoryPathUpdate = null;
  }

  private async updateDataForExistingUriInWorkspace(
    uri: vscode.Uri
  ): Promise<void> {
    await this.remover.removeFromCacheByPath(uri);
    let data = await this.common.downloadData([uri]);
    data = this.mergeWithDataFromCache(data);
    this.cache.updateData(data);
  }

  private mergeWithDataFromCache(data: QuickPickItem[]): QuickPickItem[] {
    const dataFromCache = this.common.getData();
    return dataFromCache ? dataFromCache.concat(data) : data;
  }
}

export default WorkspaceUpdater;
