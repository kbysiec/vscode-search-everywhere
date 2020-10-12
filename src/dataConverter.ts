import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";
import WorkspaceData from "./interface/workspaceData";
import Utils from "./utils";
import Item from "./interface/item";
import Config from "./config";
import Icons from "./interface/icons";
import ItemsFilterPhrases from "./interface/itemsFilterPhrases";

class DataConverter {
  isCancelled!: boolean;

  private icons!: Icons;
  private shouldUseItemsFilterPhrases!: boolean;
  private itemsFilterPhrases!: ItemsFilterPhrases;

  constructor(private utils: Utils, private config: Config) {
    this.setCancelled(false);
    this.fetchConfig();
  }

  reload() {
    this.fetchConfig();
  }

  cancel() {
    this.setCancelled(true);
  }

  convertToQpData(data: WorkspaceData): QuickPickItem[] {
    const qpData = this.mapDataToQpData(data.items);
    this.setCancelled(false);
    return qpData;
  }

  getItemFilterPhraseForKind(kind: number): string {
    return this.itemsFilterPhrases[kind] as string;
  }

  private mapDataToQpData(data: Map<string, Item>): QuickPickItem[] {
    let qpData: QuickPickItem[] = [];

    for (let item of data.values()) {
      if (!this.isCancelled) {
        item.elements.forEach((element: vscode.Uri | vscode.DocumentSymbol) => {
          qpData.push(this.mapItemElementToQpItem(item.uri, element));
        });
      } else {
        qpData = [];
        break;
      }
    }
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
    const icon = this.icons[symbol.kind] ? `$(${this.icons[symbol.kind]})` : "";
    const label = icon ? `${icon}  ${name}` : name;

    const itemFilterPhrase = this.getItemFilterPhraseForKind(symbol.kind);

    const description = `${
      this.shouldUseItemsFilterPhrases && itemFilterPhrase
        ? `[${itemFilterPhrase}${name}] `
        : ""
    }${vscode.SymbolKind[symbol.kind]} at ${
      symbol.range.isSingleLine
        ? `line: ${symbol.range.start.line + 1}`
        : `lines: ${symbol.range.start.line + 1} - ${
            symbol.range.end.line + 1
          }${parent ? ` in ${parent}` : ""}`
    }`;

    return {
      uri,
      kind: symbol.kind,
      range: {
        start: symbol.range.start,
        end: symbol.range.end,
      },
      label,
      detail: this.normalizeUriPath(uri.fsPath),
      description,
    } as QuickPickItem;
  }

  private mapUriToQpItem(uri: vscode.Uri): QuickPickItem {
    const kind = 0;
    const name = uri.path.split("/").pop();
    const icon = this.icons[kind] ? `$(${this.icons[kind]})` : "";
    const label = icon ? `${icon}  ${name}` : name;

    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(0, 0);

    const itemFilterPhrase = this.getItemFilterPhraseForKind(kind);

    const description = `${
      this.shouldUseItemsFilterPhrases && itemFilterPhrase
        ? `[${itemFilterPhrase}${name}] `
        : ""
    }File`;

    return {
      uri,
      kind: kind,
      range: {
        start,
        end,
      },
      label,
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

  private fetchConfig() {
    this.icons = this.config.getIcons();
    this.shouldUseItemsFilterPhrases = this.config.shouldUseItemsFilterPhrases();
    this.itemsFilterPhrases = this.config.getItemsFilterPhrases();
  }

  private setCancelled(value: boolean) {
    this.isCancelled = value;
  }
}

export default DataConverter;
