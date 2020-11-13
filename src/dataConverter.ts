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
      if (this.isCancelled) {
        qpData = [];
        break;
      }

      item.elements.forEach((element: vscode.Uri | vscode.DocumentSymbol) => {
        qpData.push(this.mapItemElementToQpItem(item.uri, element));
      });
    }
    return qpData;
  }

  private mapItemElementToQpItem(
    uri: vscode.Uri,
    item: vscode.DocumentSymbol | vscode.Uri
  ): QuickPickItem {
    return item.hasOwnProperty("range")
      ? this.mapDocumentSymbolToQpItem(uri, item as vscode.DocumentSymbol)
      : this.mapUriToQpItem(item as vscode.Uri);
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
    const description = this.getDocumentSymbolToQpItemDescription(
      itemFilterPhrase,
      name,
      symbol,
      parent
    );

    return this.createQuickPickItem(
      uri,
      symbol.kind,
      symbol.range.start,
      symbol.range.end,
      label,
      description
    );
  }

  private getDocumentSymbolToQpItemDescription(
    itemFilterPhrase: string,
    name: string,
    symbol: vscode.DocumentSymbol,
    parent: string
  ) {
    return `${
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
  }

  private mapUriToQpItem(uri: vscode.Uri): QuickPickItem {
    const kind = 0;
    const name = uri.path.split("/").pop() as string;
    const icon = this.icons[kind] ? `$(${this.icons[kind]})` : "";
    const label = icon ? `${icon}  ${name}` : name;
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(0, 0);
    const itemFilterPhrase = this.getItemFilterPhraseForKind(kind);
    const description = this.getUriToQpItemDescription(itemFilterPhrase, name);

    return this.createQuickPickItem(uri, kind, start, end, label, description);
  }

  private getUriToQpItemDescription(itemFilterPhrase: string, name: string) {
    return `${
      this.shouldUseItemsFilterPhrases && itemFilterPhrase
        ? `[${itemFilterPhrase}${name}] `
        : ""
    }File`;
  }

  private createQuickPickItem(
    uri: vscode.Uri,
    kind: number,
    start: vscode.Position,
    end: vscode.Position,
    label: string,
    description: string
  ): QuickPickItem {
    return {
      uri,
      kind,
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
