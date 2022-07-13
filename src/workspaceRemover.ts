import * as vscode from "vscode";
import { updateData } from "./cache";
// import Cache from "./cache";
import DetailedActionType from "./enum/detailedActionType";
import QuickPickItem from "./interface/quickPickItem";
import WorkspaceCommon from "./workspaceCommon";

class WorkspaceRemover {
  constructor(private common: WorkspaceCommon) {}

  removeFromCacheByPath(
    uri: vscode.Uri,
    detailedActionType: DetailedActionType
  ) {
    let data = this.common.getData();

    const removeFnByDetailedActionType: { [key: string]: Function } = {
      [DetailedActionType.RenameOrMoveFile]: this.removeUri.bind(
        this,
        data,
        uri
      ),
      [DetailedActionType.RemoveFile]: this.removeUri.bind(this, data, uri),
      [DetailedActionType.TextChange]: this.removeUri.bind(this, data, uri),
      [DetailedActionType.RemoveDirectory]: this.removeFolder.bind(
        this,
        data,
        uri
      ),
      [DetailedActionType.RenameOrMoveDirectory]: this.removeFolder.bind(
        this,
        data,
        uri
      ),
    };
    data = removeFnByDetailedActionType[detailedActionType]();
    updateData(data);
  }

  private removeUri(data: QuickPickItem[], uri: vscode.Uri): QuickPickItem[] {
    return data.filter(
      (qpItem: QuickPickItem) => qpItem.uri.fsPath !== uri.fsPath
    );
  }

  private removeFolder(data: QuickPickItem[], uri: vscode.Uri) {
    return data.filter((qpItem: QuickPickItem) => {
      return !qpItem.uri.fsPath.includes(uri.fsPath);
    });
  }
}

export default WorkspaceRemover;
