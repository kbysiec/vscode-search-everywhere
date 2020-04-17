import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";
import WorkspaceData from "./interface/workspaceData";
import Utils from "./utils";
import Item from "./interface/item";

class DataConverter {
  constructor(private utils: Utils) {}

  convertToQpData(data: WorkspaceData): QuickPickItem[] {
    return this.mapDataToQpData(data.items);
  }

  private mapDataToQpData(data: Map<string, Item>): QuickPickItem[] {
    const qpData: QuickPickItem[] = [];

    data.forEach((item: Item) => {
      item.elements.forEach((element: vscode.Uri | vscode.DocumentSymbol) => {
        qpData.push(this.mapItemElementToQpItem(item.uri, element));
      });
    });
    return qpData;
  }

  private mapItemElementToQpItem(
    uri: vscode.Uri,
    item: vscode.DocumentSymbol | vscode.Uri
  ): QuickPickItem {
    if (item.hasOwnProperty("range")) {
      item = item as vscode.DocumentSymbol;
      return this.mapDocumentSymbolToQpItem(uri, item);
    } else {
      item = item as vscode.Uri;
      return this.mapUriToQpItem(item);
    }
  }

  private mapDocumentSymbolToQpItem(
    uri: vscode.Uri,
    symbol: vscode.DocumentSymbol
  ): QuickPickItem {
    const splitter = this.utils.getSplitter();
    const symbolName = symbol.name.split(splitter);
    const parent = symbolName.length === 2 ? symbolName[0] : "";
    const name = symbolName.length === 2 ? symbolName[1] : symbol.name;

    const description = `${vscode.SymbolKind[symbol.kind]} at ${
      symbol.range.isSingleLine
        ? `line: ${symbol.range.start.line + 1}`
        : `lines: ${symbol.range.start.line + 1} - ${symbol.range.end.line}${
            parent ? ` in ${parent}` : ""
          }`
    }`;

    return {
      uri,
      symbolKind: symbol.kind,
      range: {
        start: symbol.range.start,
        end: symbol.range.end,
      },
      label: name,
      detail: this.normalizeUriPath(uri.fsPath),
      description,
    };
  }

  private mapUriToQpItem(uri: vscode.Uri): QuickPickItem {
    const symbolKind = 0;
    const name = uri.path.split("/").pop();
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(0, 0);

    const description = "File";

    return {
      uri,
      symbolKind,
      range: {
        start,
        end,
      },
      label: name,
      detail: this.normalizeUriPath(uri.fsPath),
      description,
    } as QuickPickItem;
  }

  private normalizeUriPath(path: string): string {
    const workspaceFoldersPaths = this.getWorkspaceFoldersPaths();
    let normalizedPath = path;
    workspaceFoldersPaths.forEach((wfPath: string) => {
      normalizedPath = normalizedPath.replace(wfPath, "");
    });

    return normalizedPath;
  }

  private getWorkspaceFoldersPaths(): string[] {
    return (
      (vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.map(
          (wf: vscode.WorkspaceFolder) => wf.uri.fsPath
        )) ||
      []
    );
  }
}

export default DataConverter;
