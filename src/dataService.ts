import * as vscode from "vscode";
import { fetchItemsFilter } from "./config";
import { onDidItemIndexedEventEmitter } from "./dataServiceEventsEmitter";
import { patternProvider } from "./patternProvider";
import { Item, ItemsFilter, WorkspaceData } from "./types";
import { utils } from "./utils";

async function fetchUris(): Promise<vscode.Uri[]> {
  const includePatterns = patternProvider.getIncludePatterns();
  const excludePatterns = await patternProvider.getExcludePatterns();
  try {
    return await vscode.workspace.findFiles(includePatterns, excludePatterns);
  } catch (error) {
    utils.printErrorMessage(error as Error);
    return Promise.resolve([]);
  }
}

async function getUrisOrFetchIfEmpty(
  uris?: vscode.Uri[]
): Promise<vscode.Uri[]> {
  return uris && uris.length ? uris : await dataService.fetchUris();
}

async function includeSymbols(
  workspaceData: WorkspaceData,
  uris: vscode.Uri[]
): Promise<void> {
  const fetchSymbolsForUriPromises = [];

  for (let i = 0; i < uris.length; i++) {
    if (dataService.getIsCancelled()) {
      utils.clearWorkspaceData(workspaceData);
      break;
    }

    const uri = uris[i];
    fetchSymbolsForUriPromises.push(
      (async () => {
        let symbolsForUri = await tryToGetSymbolsForUri(uri);
        addSymbolsForUriToWorkspaceData(workspaceData, uri, symbolsForUri);

        onDidItemIndexedEventEmitter.fire(uris.length);
      })()
    );
  }
  await Promise.all(fetchSymbolsForUriPromises);
}

async function tryToGetSymbolsForUri(
  uri: vscode.Uri
): Promise<vscode.DocumentSymbol[] | undefined> {
  const maxCounter = 10;
  let counter = 0;
  let symbolsForUri: vscode.DocumentSymbol[] | undefined;

  do {
    symbolsForUri = await dataService.getSymbolsForUri(uri);
    !!counter && (await utils.sleep(120));
    counter++;
  } while (symbolsForUri === undefined && counter < maxCounter);

  return symbolsForUri;
}

function addSymbolsForUriToWorkspaceData(
  workspaceData: WorkspaceData,
  uri: vscode.Uri,
  symbolsForUri: vscode.DocumentSymbol[] | undefined
) {
  symbolsForUri &&
    symbolsForUri.length &&
    workspaceData.items.set(uri.path, {
      uri,
      elements: symbolsForUri,
    });

  workspaceData.count += symbolsForUri ? symbolsForUri.length : 0;
}

function includeUris(workspaceData: WorkspaceData, uris: vscode.Uri[]): void {
  const validUris = filterUris(uris);
  for (let i = 0; i < validUris.length; i++) {
    const uri = validUris[i];
    if (dataService.getIsCancelled()) {
      utils.clearWorkspaceData(workspaceData);
      break;
    }
    addUriToWorkspaceData(workspaceData, uri);
  }
}

function addUriToWorkspaceData(workspaceData: WorkspaceData, uri: vscode.Uri) {
  const item = workspaceData.items.get(uri.path);
  if (item) {
    !ifUriExistsInArray(item.elements, uri) &&
      addUriToExistingArrayOfElements(workspaceData, uri, item);
  } else {
    createItemWithArrayOfElementsForUri(workspaceData, uri);
  }
}

function addUriToExistingArrayOfElements(
  workspaceData: WorkspaceData,
  uri: vscode.Uri,
  item: Item
) {
  item.elements.push(uri);
  workspaceData.count++;
}

function createItemWithArrayOfElementsForUri(
  workspaceData: WorkspaceData,
  uri: vscode.Uri
) {
  workspaceData.items.set(uri.path, {
    uri,
    elements: [uri],
  });
  workspaceData.count++;
}

function ifUriExistsInArray(
  array: Array<vscode.Uri | vscode.DocumentSymbol>,
  uri: vscode.Uri
) {
  return array.some((uriInArray: vscode.Uri | vscode.DocumentSymbol) => {
    if (!uriInArray.hasOwnProperty("range")) {
      uriInArray = uriInArray as vscode.Uri;
      return uriInArray.path === uri.path;
    }
    return false;
  });
}

async function getSymbolsForUri(
  uri: vscode.Uri
): Promise<vscode.DocumentSymbol[] | undefined> {
  const allSymbols = await loadAllSymbolsForUri(uri);
  const symbols = allSymbols
    ? reduceAndFlatSymbolsArrayForUri(allSymbols)
    : undefined;
  return symbols ? filterSymbols(symbols) : undefined;
}

async function loadAllSymbolsForUri(
  uri: vscode.Uri
): Promise<vscode.DocumentSymbol[] | undefined> {
  return await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    "vscode.executeDocumentSymbolProvider",
    uri
  );
}

function reduceAndFlatSymbolsArrayForUri(
  symbols: vscode.DocumentSymbol[],
  parentName?: string
): vscode.DocumentSymbol[] {
  const flatArrayOfSymbols: vscode.DocumentSymbol[] = [];

  symbols.forEach((symbol: vscode.DocumentSymbol) => {
    prepareSymbolNameIfHasParent(symbol, parentName);
    flatArrayOfSymbols.push(symbol);

    if (hasSymbolChildren(symbol)) {
      flatArrayOfSymbols.push(
        ...reduceAndFlatSymbolsArrayForUri(symbol.children, symbol.name)
      );
    }
    symbol.children = [];
  });

  return flatArrayOfSymbols;
}

function prepareSymbolNameIfHasParent(
  symbol: vscode.DocumentSymbol,
  parentName?: string
) {
  const splitter = utils.getSplitter();
  if (parentName) {
    parentName = parentName.split(splitter)[0];
    symbol.name = `${parentName}${splitter}${symbol.name}`;
  }
}

function hasSymbolChildren(symbol: vscode.DocumentSymbol): boolean {
  return symbol.children && symbol.children.length ? true : false;
}

function filterUris(uris: vscode.Uri[]): vscode.Uri[] {
  return uris.filter((uri) => isUriValid(uri));
}

function filterSymbols(
  symbols: vscode.DocumentSymbol[]
): vscode.DocumentSymbol[] {
  return symbols.filter((symbol) => isSymbolValid(symbol));
}

function isUriValid(uri: vscode.Uri): boolean {
  return isItemValid(uri);
}

function isSymbolValid(symbol: vscode.DocumentSymbol): boolean {
  return isItemValid(symbol);
}

function isItemValid(item: vscode.Uri | vscode.DocumentSymbol): boolean {
  let symbolKind: number;
  let name: string | undefined;
  const isUri = item.hasOwnProperty("path");

  if (isUri) {
    symbolKind = 0;
    name = (item as vscode.Uri).path.split("/").pop();
  } else {
    const documentSymbol = item as vscode.DocumentSymbol;
    symbolKind = documentSymbol.kind;
    name = documentSymbol.name;
  }

  const itemsFilter = dataService.getItemsFilter();

  return (
    isInAllowedKinds(itemsFilter, symbolKind) &&
    isNotInIgnoredKinds(itemsFilter, symbolKind) &&
    isNotInIgnoredNames(itemsFilter, name)
  );
}

function isInAllowedKinds(
  itemsFilter: ItemsFilter,
  symbolKind: number
): boolean {
  return (
    !(itemsFilter.allowedKinds && itemsFilter.allowedKinds.length) ||
    itemsFilter.allowedKinds.includes(symbolKind)
  );
}

function isNotInIgnoredKinds(
  itemsFilter: ItemsFilter,
  symbolKind: number
): boolean {
  return (
    !(itemsFilter.ignoredKinds && itemsFilter.ignoredKinds.length) ||
    !itemsFilter.ignoredKinds.includes(symbolKind)
  );
}

function isNotInIgnoredNames(
  itemsFilter: ItemsFilter,
  name: string | undefined
): boolean {
  return (
    !(itemsFilter.ignoredNames && itemsFilter.ignoredNames.length) ||
    !itemsFilter.ignoredNames.some(
      (ignoreEl) =>
        ignoreEl && name && name.toLowerCase().includes(ignoreEl.toLowerCase())
    )
  );
}

async function fetchData(uris?: vscode.Uri[]): Promise<WorkspaceData> {
  const workspaceData: WorkspaceData = utils.createWorkspaceData();
  const uriItems = await getUrisOrFetchIfEmpty(uris);

  await includeSymbols(workspaceData, uriItems);
  includeUris(workspaceData, uriItems);

  dataService.setIsCancelled(false);

  return workspaceData;
}

async function isUriExistingInWorkspace(uri: vscode.Uri): Promise<boolean> {
  const uris = await dataService.fetchUris();
  return uris.some((existingUri: vscode.Uri) => existingUri.path === uri.path);
}

async function fetchConfig() {
  const itemsFilter = fetchItemsFilter();
  setItemsFilter(itemsFilter);
  await patternProvider.fetchConfig();
}

function reload() {
  dataService.fetchConfig();
}

function cancel() {
  dataService.setIsCancelled(true);
}

function setIsCancelled(value: boolean) {
  isCancelled = value;
}

function getIsCancelled() {
  return isCancelled;
}

function setItemsFilter(newItemsFilter: ItemsFilter) {
  itemsFilter = newItemsFilter;
}

function getItemsFilter() {
  return itemsFilter;
}

let isCancelled = false;
let itemsFilter: ItemsFilter = {};

export const dataService = {
  setIsCancelled,
  getIsCancelled,
  getItemsFilter,
  fetchConfig,
  reload,
  cancel,
  fetchData,
  isUriExistingInWorkspace,
  fetchUris,
  getSymbolsForUri,
};
