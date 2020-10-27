import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";
import Config from "./config";
import ItemsFilterPhrases from "./interface/itemsFilterPhrases";
const debounce = require("debounce");

class QuickPick {
  private quickPick!: vscode.QuickPick<QuickPickItem>;
  private items: QuickPickItem[];
  private shouldUseItemsFilterPhrases!: boolean;
  private helpPhrase!: string;
  private itemsFilterPhrases!: ItemsFilterPhrases;
  private helpItems!: QuickPickItem[];

  private onDidChangeValueEventListeners: vscode.Disposable[];

  constructor(private config: Config) {
    this.items = [];
    this.onDidChangeValueEventListeners = [];

    this.fetchConfig();
    this.fetchHelpData();
  }

  init(): void {
    this.quickPick = vscode.window.createQuickPick();
    this.quickPick.matchOnDetail = true;
    this.quickPick.matchOnDescription = true;

    this.quickPick.onDidHide(this.onDidHide);
    this.quickPick.onDidAccept(this.onDidAccept);
    this.quickPick.onDidChangeValue(this.onDidChangeValue);
    this.registerOnDidChangeValueEventListeners();
  }

  reloadOnDidChangeValueEventListener(): void {
    this.disposeOnDidChangeValueEventListeners();
    this.registerOnDidChangeValueEventListeners();
  }

  reload() {
    this.fetchConfig();
    this.fetchHelpData();
  }

  isInitialized(): boolean {
    return !!this.quickPick;
  }

  show(): void {
    this.quickPick.show();
  }

  loadItems(loadHelp: boolean = false): void {
    this.quickPick.items = loadHelp ? this.helpItems : this.items;
  }

  setItems(items: QuickPickItem[]): void {
    this.items = items;
  }

  showLoading(value: boolean): void {
    this.quickPick.busy = value;
  }

  setText(text: string): void {
    this.quickPick.value = text;
  }

  setPlaceholder(isBusy: boolean): void {
    this.quickPick.placeholder = isBusy
      ? "Please wait, loading..."
      : this.shouldUseItemsFilterPhrases
      ? `${
          this.helpPhrase
            ? `Type ${this.helpPhrase} for help or start typing file or symbol name...`
            : `Help phrase not set. Start typing file or symbol name...`
        }`
      : "Start typing file or symbol name...";
  }

  private disposeOnDidChangeValueEventListeners(): void {
    this.onDidChangeValueEventListeners.forEach(
      (eventListener: vscode.Disposable) => eventListener.dispose()
    );
    this.onDidChangeValueEventListeners = [];
  }

  private registerOnDidChangeValueEventListeners(): void {
    const shouldUseDebounce = this.config.shouldUseDebounce();

    if (shouldUseDebounce) {
      const onDidChangeValueClearingEventListener = this.quickPick.onDidChangeValue(
        this.onDidChangeValueClearing
      );
      const onDidChangeValueEventListener = this.quickPick.onDidChangeValue(
        debounce(this.onDidChangeValue, 400)
      );

      this.onDidChangeValueEventListeners.push(
        onDidChangeValueClearingEventListener
      );
      this.onDidChangeValueEventListeners.push(onDidChangeValueEventListener);
    } else {
      const onDidChangeValueEventListener = this.quickPick.onDidChangeValue(
        debounce(this.onDidChangeValue, 400)
      );

      this.onDidChangeValueEventListeners.push(onDidChangeValueEventListener);
    }
  }

  private async openSelected(qpItem: QuickPickItem): Promise<void> {
    if (this.shouldUseItemsFilterPhrases && qpItem.isHelp) {
      const text = this.itemsFilterPhrases[qpItem.kind];
      this.setText(text);
      this.loadItems();
    } else {
      const document = await vscode.workspace.openTextDocument(
        qpItem.uri!.scheme === "file" ? (qpItem.uri!.fsPath as any) : qpItem.uri
      );
      const editor = await vscode.window.showTextDocument(document);
      this.selectQpItem(editor, qpItem);
    }
  }

  private selectQpItem(editor: vscode.TextEditor, qpItem: QuickPickItem): void {
    const shouldHighlightSymbol = this.config.shouldHighlightSymbol();

    const { range } = qpItem;
    const start = new vscode.Position(
      range!.start.line,
      range!.start.character
    );
    const end = new vscode.Position(range!.end.line, range!.end.character);

    editor.selection = shouldHighlightSymbol
      ? new vscode.Selection(start, end)
      : new vscode.Selection(start, start);

    editor.revealRange(
      range as vscode.Range,
      vscode.TextEditorRevealType.Default
    );
  }

  private getHelpItems(): QuickPickItem[] {
    const items: QuickPickItem[] = [];
    for (const kind in this.itemsFilterPhrases) {
      const filterPhrase = this.itemsFilterPhrases[kind];
      const item: QuickPickItem = this.getHelpItemForKind(kind, filterPhrase);
      items.push(item);
    }
    return items;
  }

  private getHelpItemForKind(kind: string, itemFilterPhrase: string) {
    return {
      label: `${
        this.helpPhrase
      } Type ${itemFilterPhrase} for limit results to ${
        vscode.SymbolKind[parseInt(kind)]
      } only`,
      kind: Number(kind),
      isHelp: true,
      uri: vscode.Uri.parse("#"),
    } as QuickPickItem;
  }

  private fetchConfig(): void {
    this.shouldUseItemsFilterPhrases = this.config.shouldUseItemsFilterPhrases();
    this.helpPhrase = this.config.getHelpPhrase();
    this.itemsFilterPhrases = this.config.getItemsFilterPhrases();
  }

  private fetchHelpData(): void {
    this.helpItems = this.getHelpItems();
  }

  private onDidChangeValueClearing = () => {
    this.quickPick.items = [];
  };

  private onDidChangeValue = (text: string): void => {
    if (
      this.shouldUseItemsFilterPhrases &&
      this.helpPhrase &&
      text === this.helpPhrase
    ) {
      this.loadItems(true);
    } else {
      this.loadItems();
    }
  };

  private onDidAccept = async (): Promise<void> => {
    const selectedItem = this.quickPick.selectedItems[0];
    selectedItem && (await this.openSelected(selectedItem));
  };

  private onDidHide = (): void => {
    this.setText("");
  };
}

export default QuickPick;
