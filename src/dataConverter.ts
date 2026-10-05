import * as vscode from "vscode";
import {
  fetchIcons,
  fetchItemsFilterPhrases,
  fetchShouldUseItemsFilterPhrases,
} from "./config";
import {
  Icons,
  Item,
  ItemsFilterPhrases,
  QuickPickItem,
  WorkspaceData,
} from "./types";
import { utils } from "./utils";

function getItemFilterPhraseForKind(symbolKind: number): string {
  return dataConverter.getItemsFilterPhrases()[symbolKind] as string;
}

function mapDataToQpData(data: Map<string, Item>): QuickPickItem[] {
  let qpData: QuickPickItem[] = [];

  for (let item of data.values()) {
    if (dataConverter.getIsCancelled()) {
      qpData = [];
      break;
    }

    item.elements.forEach((element: vscode.Uri | vscode.DocumentSymbol) => {
      qpData.push(mapItemElementToQpItem(item.uri, element));
    });
  }
  return qpData;
}

function mapItemElementToQpItem(
  uri: vscode.Uri,
  item: vscode.DocumentSymbol | vscode.Uri
): QuickPickItem {
  return "range" in item || "kind" in item
    ? mapDocumentSymbolToQpItem(uri, item as vscode.DocumentSymbol)
    : mapUriToQpItem(item as vscode.Uri);
}

function mapDocumentSymbolToQpItem(
  uri: vscode.Uri,
  symbol: vscode.DocumentSymbol
): QuickPickItem {
  const splitter = utils.getSplitter();
  const symbolName = symbol.name.split(splitter);
  const parent = symbolName.length === 2 ? symbolName[0] : "";
  const name = symbolName.length === 2 ? symbolName[1] : symbol.name;
  const icons = dataConverter.getIcons();
  const icon = icons[symbol.kind] ? `$(${icons[symbol.kind]})` : "";
  const label = icon ? `${icon}  ${name}` : name;
  const itemFilterPhrase = getItemFilterPhraseForKind(symbol.kind);
  const description = getDocumentSymbolToQpItemDescription(
    itemFilterPhrase,
    name,
    symbol,
    parent
  );

  const range =
    symbol.range ||
    (symbol as any).location?.range ||
    new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));

  return createQuickPickItem(
    uri,
    symbol.kind,
    range.start,
    range.end,
    label,
    description
  );
}

function getDocumentSymbolToQpItemDescription(
  itemFilterPhrase: string,
  name: string,
  symbol: vscode.DocumentSymbol,
  parent: string
) {
  const range = symbol.range || (symbol as any).location?.range;
  const lineDesc = range
    ? range.isSingleLine
      ? `line: ${range.start.line + 1}`
      : `lines: ${range.start.line + 1} - ${range.end.line + 1}`
    : "";

  return `${
    dataConverter.getShouldUseItemsFilterPhrases() && itemFilterPhrase
      ? `[${itemFilterPhrase}${name}] `
      : ""
  }${vscode.SymbolKind[symbol.kind]}${lineDesc ? ` at ${lineDesc}` : ""}${
    parent ? ` in ${parent}` : ""
  }`;
}

function mapUriToQpItem(uri: vscode.Uri): QuickPickItem {
  const symbolKind = 0;
  const name = utils.getNameFromUri(uri);
  const icons = dataConverter.getIcons();
  const icon = icons[symbolKind] ? `$(${icons[symbolKind]})` : "";
  const label = icon ? `${icon}  ${name}` : name;
  const start = new vscode.Position(0, 0);
  const end = new vscode.Position(0, 0);
  const itemFilterPhrase = getItemFilterPhraseForKind(symbolKind);
  const description = getUriToQpItemDescription(itemFilterPhrase, name);

  return createQuickPickItem(uri, symbolKind, start, end, label, description);
}

function getUriToQpItemDescription(itemFilterPhrase: string, name: string) {
  return `${
    dataConverter.getShouldUseItemsFilterPhrases() && itemFilterPhrase
      ? `[${itemFilterPhrase}${name}] `
      : ""
  }File`;
}

function createQuickPickItem(
  uri: vscode.Uri,
  symbolKind: number,
  start: vscode.Position,
  end: vscode.Position,
  label: string,
  description: string
): QuickPickItem {
  return {
    uri,
    symbolKind,
    range: {
      start,
      end,
    },
    label,
    detail: utils.normalizeUriPath(uri.path),
    description,
    // buttons: [
    //   {
    //     iconPath: new vscode.ThemeIcon("open-preview"),
    //     tooltip: "Open to the side",
    //   },
    // ],
  } as QuickPickItem;
}

function reload() {
  dataConverter.fetchConfig();
}

function cancel() {
  dataConverter.setCancelled(true);
}

function convertUriAndSymbolsToQpItems(
  uri: vscode.Uri,
  symbols?: vscode.DocumentSymbol[]
): QuickPickItem[] {
  const qpItems: QuickPickItem[] = [];
  qpItems.push(mapUriToQpItem(uri));
  if (symbols && symbols.length) {
    for (let i = 0; i < symbols.length; i++) {
      qpItems.push(mapDocumentSymbolToQpItem(uri, symbols[i]));
    }
  }
  return qpItems;
}

function convertToQpData(data: WorkspaceData): QuickPickItem[] {
  const qpData = mapDataToQpData(data.items);
  dataConverter.setCancelled(false);
  return qpData;
}

function fetchConfig() {
  const icons = fetchIcons();
  setIcons(icons);
  const shouldUseItemsFilterPhrases = fetchShouldUseItemsFilterPhrases();
  setShouldUseItemsFilterPhrases(shouldUseItemsFilterPhrases);
  const itemsFilterPhrases = fetchItemsFilterPhrases();
  setItemsFilterPhrases(itemsFilterPhrases);
}

function setCancelled(value: boolean) {
  isCancelled = value;
}

function getIsCancelled() {
  return isCancelled;
}

function setIcons(newIcons: Icons) {
  icons = newIcons;
}

function getIcons() {
  return icons;
}

function setShouldUseItemsFilterPhrases(value: boolean) {
  shouldUseItemsFilterPhrases = value;
}

function getShouldUseItemsFilterPhrases() {
  return shouldUseItemsFilterPhrases;
}

function setItemsFilterPhrases(newItemsFilterPhrases: ItemsFilterPhrases) {
  itemsFilterPhrases = newItemsFilterPhrases;
}

function getItemsFilterPhrases() {
  return itemsFilterPhrases;
}

let isCancelled = false;
let icons: Icons = {};
let shouldUseItemsFilterPhrases = false;
let itemsFilterPhrases: ItemsFilterPhrases = {};

export const dataConverter = {
  setCancelled,
  getIsCancelled,
  getIcons,
  getShouldUseItemsFilterPhrases,
  getItemsFilterPhrases,
  reload,
  cancel,
  convertToQpData,
  convertUriAndSymbolsToQpItems,
  fetchConfig,
};
