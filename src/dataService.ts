import * as vscode from "vscode";
import Config from "./config";
import Cache from "./cache";
import WorkspaceData from "./interface/workspaceData";
import Utils from "./utils";

class DataService {
  private onDidItemIndexedEventEmitter: vscode.EventEmitter<
    number
  > = new vscode.EventEmitter();
  readonly onDidItemIndexed: vscode.Event<number> = this
    .onDidItemIndexedEventEmitter.event;

  constructor(private utils: Utils, private config: Config) {}

  async fetchData(uris?: vscode.Uri[]): Promise<WorkspaceData> {
    const workspaceData: WorkspaceData = this.utils.createWorkspaceData();
    const uriItems = await this.getUris(uris);

    await this.includeSymbols(workspaceData, uriItems);
    this.includeUris(workspaceData, uriItems);

    return workspaceData;
  }

  async isUriExistingInWorkspace(uri: vscode.Uri): Promise<boolean> {
    const uris = await this.fetchUris();
    return uris.some(
      (existingUri: vscode.Uri) => existingUri.fsPath === uri.fsPath
    );
  }

  private async fetchUris(): Promise<vscode.Uri[]> {
    const includePatterns = this.getIncludePatterns();
    const excludePatterns = this.getExcludePatterns();
    return await vscode.workspace.findFiles(includePatterns, excludePatterns);
  }

  private async getUris(uris?: vscode.Uri[]): Promise<vscode.Uri[]> {
    if (uris && uris.length) {
      return uris;
    } else {
      return await this.fetchUris();
    }
  }

  private getIncludePatterns(): string {
    const includePatterns = this.config.getInclude();
    return this.patternsAsString(includePatterns);
  }

  private getExcludePatterns(): string {
    const excludePatterns = this.config.getExclude();
    return this.patternsAsString(excludePatterns);
  }

  private patternsAsString(patterns: string[]): string {
    if (patterns.length === 0) {
      return "";
    } else if (patterns.length === 1) {
      return patterns[0];
    } else {
      return `{${patterns.join(",")}}`;
    }
  }

  private async includeSymbols(
    workspaceData: WorkspaceData,
    uris: vscode.Uri[]
  ): Promise<void> {
    const maxCounter = 10;
    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      let counter = 0;
      let symbolsForUri: vscode.DocumentSymbol[] | undefined;

      do {
        symbolsForUri = await this.getSymbolsForUri(uri);
        if (counter) {
          await this.utils.sleep(120);
        }
        counter++;
      } while (symbolsForUri === undefined && counter < maxCounter);

      symbolsForUri &&
        symbolsForUri.length &&
        workspaceData.items.set(uri.fsPath, {
          uri,
          elements: symbolsForUri,
        });

      workspaceData.count += symbolsForUri ? symbolsForUri.length : 0;

      this.onDidItemIndexedEventEmitter.fire(uris.length);
    }
  }

  private includeUris(workspaceData: WorkspaceData, uris: vscode.Uri[]): void {
    uris.forEach((uri: vscode.Uri) => {
      const array = workspaceData.items.get(uri.fsPath);
      if (array) {
        const exists = this.ifUriExistsInArray(array.elements, uri);

        if (!exists) {
          array.elements.push(uri);
          workspaceData.count++;
        }
      } else {
        workspaceData.items.set(uri.fsPath, {
          uri,
          elements: [uri],
        });
        workspaceData.count++;
      }
    });
  }

  private ifUriExistsInArray(
    array: Array<vscode.Uri | vscode.DocumentSymbol>,
    uri: vscode.Uri
  ) {
    return array.some((uriInArray: vscode.Uri | vscode.DocumentSymbol) => {
      if (!uri.hasOwnProperty("range")) {
        uriInArray = uriInArray as vscode.Uri;
        return uriInArray.fsPath === uri.fsPath;
      }
      return false;
    });
  }

  private async getSymbolsForUri(
    uri: vscode.Uri
  ): Promise<vscode.DocumentSymbol[] | undefined> {
    const symbols = await this.loadAllSymbolsForUri(uri);
    return symbols ? this.reduceAndFlatSymbolsArrayForUri(symbols) : undefined;
  }

  private async loadAllSymbolsForUri(
    uri: vscode.Uri
  ): Promise<vscode.DocumentSymbol[] | undefined> {
    return await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      "vscode.executeDocumentSymbolProvider",
      uri
    );
  }

  private reduceAndFlatSymbolsArrayForUri(
    symbols: vscode.DocumentSymbol[],
    parentName?: string
  ): vscode.DocumentSymbol[] {
    const flatSymbolsArray: vscode.DocumentSymbol[] = [];
    const splitter = this.utils.getSplitter();

    symbols.forEach((symbol: vscode.DocumentSymbol) => {
      if (parentName) {
        parentName = parentName.split(splitter)[0];
        symbol.name = `${parentName}${splitter}${symbol.name}`;
      }
      flatSymbolsArray.push(symbol);

      if (this.hasSymbolChildren(symbol)) {
        flatSymbolsArray.push(
          ...this.reduceAndFlatSymbolsArrayForUri(symbol.children, symbol.name)
        );
      }
      symbol.children = [];
    });

    return flatSymbolsArray;
  }

  private hasSymbolChildren(symbol: vscode.DocumentSymbol): boolean {
    return symbol.children && symbol.children.length ? true : false;
  }
}

export default DataService;
