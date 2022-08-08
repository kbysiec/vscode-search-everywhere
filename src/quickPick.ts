import * as vscode from "vscode";
import {
  fetchHelpPhrase,
  fetchItemsFilterPhrases,
  fetchShouldHighlightSymbol,
  fetchShouldUseDebounce,
  fetchShouldUseItemsFilterPhrases,
} from "./config";
import ItemsFilterPhrases from "./interface/itemsFilterPhrases";
import QuickPickItem from "./interface/quickPickItem";
const debounce = require("debounce");

function disposeOnDidChangeValueEventListeners(): void {
  quickPick
    .getOnDidChangeValueEventListeners()
    .forEach((eventListener: vscode.Disposable) => eventListener.dispose());
  quickPick.setOnDidChangeValueEventListeners([]);
}

function registerOnDidChangeValueEventListeners(): void {
  fetchShouldUseDebounce()
    ? registerOnDidChangeValueWithDebounceEventListeners()
    : registerOnDidChangeValueWithoutDebounceEventListeners();
}

function registerOnDidChangeValueWithDebounceEventListeners(): void {
  const control = quickPick.getControl();
  const onDidChangeValueClearingEventListener = control.onDidChangeValue(
    handleDidChangeValueClearing
  );
  const onDidChangeValueEventListener = control.onDidChangeValue(
    debounce(handleDidChangeValue, 400)
  );

  const onDidChangeValueEventListeners =
    quickPick.getOnDidChangeValueEventListeners();
  onDidChangeValueEventListeners.push(onDidChangeValueClearingEventListener);

  onDidChangeValueEventListeners.push(onDidChangeValueEventListener);
}

function registerOnDidChangeValueWithoutDebounceEventListeners(): void {
  const control = quickPick.getControl();
  const onDidChangeValueEventListener = control.onDidChangeValue(
    debounce(handleDidChangeValue, 400)
  );

  quickPick
    .getOnDidChangeValueEventListeners()
    .push(onDidChangeValueEventListener);
}

async function openSelected(qpItem: QuickPickItem): Promise<void> {
  shouldLoadItemsForFilterPhrase(qpItem)
    ? loadItemsForFilterPhrase(qpItem)
    : await openItem(qpItem);
}

function shouldLoadItemsForFilterPhrase(qpItem: QuickPickItem): boolean {
  return quickPick.getShouldUseItemsFilterPhrases() && !!qpItem.isHelp;
}

function loadItemsForFilterPhrase(qpItem: QuickPickItem): void {
  const itemsFilterPhrases = quickPick.getItemsFilterPhrases();
  const filterPhrase = itemsFilterPhrases[qpItem.symbolKind];
  quickPick.setText(filterPhrase);
  quickPick.loadItems();
}

async function openItem(qpItem: QuickPickItem): Promise<void> {
  const document = await vscode.workspace.openTextDocument(
    qpItem.uri!.scheme === "file" ? (qpItem.uri!.fsPath as any) : qpItem.uri
  );
  const editor = await vscode.window.showTextDocument(document);
  selectQpItem(editor, qpItem);
}

function selectQpItem(editor: vscode.TextEditor, qpItem: QuickPickItem): void {
  editor.selection = getSelectionForQpItem(
    qpItem,
    fetchShouldHighlightSymbol()
  );

  editor.revealRange(
    qpItem.range as vscode.Range,
    vscode.TextEditorRevealType.Default
  );
}

function getSelectionForQpItem(
  qpItem: QuickPickItem,
  shouldHighlightSymbol: boolean
): vscode.Selection {
  const { range } = qpItem;
  const start = new vscode.Position(range!.start.line, range!.start.character);
  const end = new vscode.Position(range!.end.line, range!.end.character);

  return shouldHighlightSymbol
    ? new vscode.Selection(start, end)
    : new vscode.Selection(start, start);
}

function getHelpItems(): QuickPickItem[] {
  const items: QuickPickItem[] = [];
  const itemsFilterPhrases = quickPick.getItemsFilterPhrases();
  for (const kind in itemsFilterPhrases) {
    const filterPhrase = itemsFilterPhrases[kind];
    const item: QuickPickItem = getHelpItemForKind(kind, filterPhrase);
    items.push(item);
  }
  return items;
}

function getHelpItemForKind(
  symbolKind: string,
  itemFilterPhrase: string
): QuickPickItem {
  return {
    label: `${quickPick.getHelpPhrase()} Type ${itemFilterPhrase} for limit results to ${
      vscode.SymbolKind[parseInt(symbolKind)]
    } only`,
    symbolKind: Number(symbolKind),
    isHelp: true,
    uri: vscode.Uri.parse("#"),
  } as QuickPickItem;
}

function fetchConfig(): void {
  const shouldUseItemsFilterPhrases = fetchShouldUseItemsFilterPhrases();
  setShouldUseItemsFilterPhrases(shouldUseItemsFilterPhrases);

  const helpPhrase = fetchHelpPhrase();
  setHelpPhrase(helpPhrase);

  const itemsFilterPhrases = fetchItemsFilterPhrases();
  setItemsFilterPhrases(itemsFilterPhrases);
}

function fetchHelpData(): void {
  const helpItems = getHelpItems();
  setHelpItems(helpItems);
}

function handleDidChangeValueClearing() {
  const control = quickPick.getControl();
  control.items = [];
}

function handleDidChangeValue(text: string) {
  shouldLoadHelpItems(text) ? quickPick.loadItems(true) : quickPick.loadItems();
}

function shouldLoadHelpItems(text: string): boolean {
  const helpPhrase = quickPick.getHelpPhrase();
  return (
    quickPick.getShouldUseItemsFilterPhrases() &&
    !!helpPhrase &&
    text === helpPhrase
  );
}

async function handleDidAccept() {
  const control = quickPick.getControl();
  const selectedItem = control.selectedItems[0];
  selectedItem && (await openSelected(selectedItem));
}

function handleDidHide() {
  quickPick.setText("");
}

function init(): void {
  const control = vscode.window.createQuickPick<QuickPickItem>();
  setControl(control);
  control.matchOnDetail = true;
  control.matchOnDescription = true;

  quickPick.fetchConfig();
  fetchHelpData();

  registerEventListeners();
}

function registerEventListeners() {
  const control = quickPick.getControl();
  control.onDidHide(handleDidHide);
  control.onDidAccept(handleDidAccept);
  control.onDidChangeValue(handleDidChangeValue);

  registerOnDidChangeValueEventListeners();
}

function reloadOnDidChangeValueEventListener(): void {
  disposeOnDidChangeValueEventListeners();
  registerOnDidChangeValueEventListeners();
}

function reload(): void {
  quickPick.fetchConfig();
  fetchHelpData();
}

function isInitialized(): boolean {
  return !!quickPick.getControl();
}

function show(): void {
  const control = quickPick.getControl();
  control.show();
}

function loadItems(loadHelp: boolean = false): void {
  const control = quickPick.getControl();
  control.items = loadHelp
    ? quickPick.getHelpItemsProp()
    : quickPick.getItems();
}

function showLoading(value: boolean): void {
  const control = quickPick.getControl();
  control.busy = value;
}

function setText(text: string): void {
  const control = quickPick.getControl();
  control.value = text;
}

function setPlaceholder(isBusy: boolean): void {
  const control = quickPick.getControl();
  const helpPhrase = quickPick.getHelpPhrase();
  control.placeholder = isBusy
    ? "Please wait, loading..."
    : quickPick.getShouldUseItemsFilterPhrases()
    ? `${
        helpPhrase
          ? `Type ${helpPhrase} for help or start typing file or symbol name...`
          : `Help phrase not set. Start typing file or symbol name...`
      }`
    : "Start typing file or symbol name...";
}

let control: vscode.QuickPick<QuickPickItem>;
let items: QuickPickItem[] = [];
let shouldUseItemsFilterPhrases: boolean;
let helpPhrase: string;
let itemsFilterPhrases: ItemsFilterPhrases;
let helpItems: QuickPickItem[];
let onDidChangeValueEventListeners: vscode.Disposable[] = [];

function getControl() {
  return control;
}

function setControl(newControl: vscode.QuickPick<QuickPickItem>) {
  control = newControl;
}

function getItems() {
  return items;
}

function setItems(newItems: QuickPickItem[]): void {
  items = newItems;
}

function getShouldUseItemsFilterPhrases() {
  return shouldUseItemsFilterPhrases;
}

function setShouldUseItemsFilterPhrases(
  newShouldUseItemsFilterPhrases: boolean
) {
  shouldUseItemsFilterPhrases = newShouldUseItemsFilterPhrases;
}

function getHelpPhrase() {
  return helpPhrase;
}

function setHelpPhrase(newHelpPhrase: string) {
  helpPhrase = newHelpPhrase;
}

function getItemsFilterPhrases() {
  return itemsFilterPhrases;
}

function setItemsFilterPhrases(newItemsFilterPhrases: ItemsFilterPhrases) {
  itemsFilterPhrases = newItemsFilterPhrases;
}

function getHelpItemsProp() {
  return helpItems;
}

function setHelpItems(newHelpItems: QuickPickItem[]) {
  helpItems = newHelpItems;
}

function getOnDidChangeValueEventListeners() {
  return onDidChangeValueEventListeners;
}

function setOnDidChangeValueEventListeners(
  newOnDidChangeValueEventListeners: vscode.Disposable[]
) {
  onDidChangeValueEventListeners = newOnDidChangeValueEventListeners;
}

export const quickPick = {
  getControl,
  getItems,
  setItems,
  getShouldUseItemsFilterPhrases,
  getHelpPhrase,
  getItemsFilterPhrases,
  getHelpItemsProp,
  getOnDidChangeValueEventListeners,
  setOnDidChangeValueEventListeners,
  init,
  reloadOnDidChangeValueEventListener,
  reload,
  isInitialized,
  show,
  loadItems,
  showLoading,
  setText,
  setPlaceholder,
  fetchConfig,
  handleDidChangeValueClearing,
  handleDidChangeValue,
  handleDidAccept,
  handleDidHide,
};
