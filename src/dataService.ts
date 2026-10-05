import * as vscode from "vscode";
import { fetchItemsFilter } from "./config";
import { dataConverter } from "./dataConverter";
import { onDidItemIndexedEventEmitter } from "./dataServiceEventsEmitter";
import { logger } from "./logger";
import { patternProvider } from "./patternProvider";
import { Item, ItemsFilter, QuickPickItem, WorkspaceData } from "./types";
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

async function warmupLanguageServer(
  uris: vscode.Uri[],
  progress?: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>
): Promise<void> {
  progress?.report({ message: "Initializing Language Server..." });
  logger.log("Warming up language servers...");

  // 1. Explicitly activate built-in / common language extensions
  const LANG_EXTENSIONS = [
    "vscode.typescript-language-features",
    "vscode.json-language-features",
    "vscode.markdown-language-features",
  ];

  for (const extId of LANG_EXTENSIONS) {
    try {
      const ext = vscode.extensions.getExtension(extId);
      if (ext && !ext.isActive) {
        logger.log(`Activating extension ${extId}...`);
        await ext.activate();
        logger.log(`Extension ${extId} activated.`);
      }
    } catch (e) {
      logger.log(`Could not activate ${extId}: ${e}`);
    }
  }

  // 2. Find candidate code URIs that are regular source files
  const codeExts = ["ts", "tsx", "js", "jsx"];
  const candidateUris = uris.filter((u) => {
    const p = u.path.toLowerCase();
    const ext = p.split(".").pop();
    return (
      ext &&
      codeExts.includes(ext) &&
      !p.endsWith(".d.ts") &&
      !p.includes("test") &&
      !p.includes("fixtures")
    );
  });

  const sampleUri =
    candidateUris[Math.floor(candidateUris.length / 2)] ||
    candidateUris[0] ||
    uris[0];

  if (!sampleUri) {
    return;
  }

  try {
    logger.log(`Opening sample document: ${sampleUri.path}`);
    await vscode.workspace.openTextDocument(sampleUri);
  } catch (e) {
    logger.log(`Failed to open sample document: ${e}`);
  }

  // 3. Poll sampleUri until executeDocumentSymbolProvider returns actual symbols
  const maxAttempts = 30; // up to 15s
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (dataService.getIsCancelled()) {
      return;
    }

    progress?.report({
      message: `Initializing Language Server (${attempt + 1}/${maxAttempts})...`,
    });

    try {
      const rawSymbols = await loadAllSymbolsForUri(sampleUri);
      logger.log(
        `Warmup attempt ${attempt + 1}/${maxAttempts}: returned ${
          rawSymbols ? `${rawSymbols.length} raw symbols` : "undefined"
        }`
      );
      if (rawSymbols && rawSymbols.length > 0) {
        logger.log(
          `Language server is ready! Found ${rawSymbols.length} symbols in sample file.`
        );
        progress?.report({ message: "Language Server ready! Indexing..." });
        break;
      }
    } catch (e) {
      logger.log(`Warmup attempt ${attempt + 1} threw error: ${e}`);
    }

    await utils.sleep(500);
  }
}

async function includeSymbols(
  workspaceData: WorkspaceData,
  uris: vscode.Uri[],
  progress?: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>,
  onBatch?: (items: QuickPickItem[]) => void
): Promise<void> {
  if (!uris.length || dataService.getIsCancelled()) {
    return;
  }

  await warmupLanguageServer(uris, progress);

  const CONCURRENCY = 20;
  let currentIndex = 0;

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, uris.length) },
    async () => {
      while (currentIndex < uris.length) {
        if (dataService.getIsCancelled()) {
          break;
        }
        const i = currentIndex++;
        const uri = uris[i];

        const symbolsForUri = await tryToGetSymbolsForUri(uri);
        if (onBatch) {
          const qpItems = dataConverter.convertUriAndSymbolsToQpItems(
            uri,
            symbolsForUri
          );
          onBatch(qpItems);
          workspaceData.items.set(uri.path, { uri, elements: [] });
          workspaceData.count += qpItems.length;
        } else {
          addSymbolsForUriToWorkspaceData(workspaceData, uri, symbolsForUri);
        }
        onDidItemIndexedEventEmitter.fire(uris.length);
      }
    }
  );

  await Promise.all(workers);

  if (dataService.getIsCancelled()) {
    utils.clearWorkspaceData(workspaceData);
  }
}

const NON_SYMBOL_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "ico", "svg", "bmp", "webp",
  "woff", "woff2", "ttf", "eot", "otf",
  "zip", "tar", "gz", "map", "lock", "pdf", "exe", "dll",
  "mp3", "mp4", "wav", "avi"
]);

async function tryToGetSymbolsForUri(
  uri: vscode.Uri
): Promise<vscode.DocumentSymbol[] | undefined> {
  const ext = uri.path.split(".").pop()?.toLowerCase();
  if (ext && NON_SYMBOL_EXTENSIONS.has(ext)) {
    return undefined;
  }

  return await dataService.getSymbolsForUri(uri);
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
    if (!("range" in uriInArray || "kind" in uriInArray)) {
      const uriElement = uriInArray as vscode.Uri;
      return uriElement.path === uri.path;
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
    if (symbol.children) {
      symbol.children = [];
    }
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
  const isUri = !("kind" in item);

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

async function fetchData(
  uris?: vscode.Uri[],
  progress?: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>,
  onBatch?: (items: QuickPickItem[]) => void
): Promise<WorkspaceData> {
  const workspaceData: WorkspaceData = utils.createWorkspaceData();
  const uriItems = await getUrisOrFetchIfEmpty(uris);

  await includeSymbols(workspaceData, uriItems, progress, onBatch);
  if (!onBatch) {
    includeUris(workspaceData, uriItems);
  }

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
