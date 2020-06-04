import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";
import Config from "./config";
const debounce = require("debounce");

class QuickPick {
  private quickPick!: vscode.QuickPick<QuickPickItem>;
  private items: QuickPickItem[];
  private onDidChangeValueEventListeners: vscode.Disposable[];

  constructor(private config: Config) {
    this.items = [];
    this.onDidChangeValueEventListeners = [];
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

  isInitialized(): boolean {
    return !!this.quickPick;
  }

  show(): void {
    this.quickPick.show();
  }

  loadItems(): void {
    this.quickPick.items = this.items;
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

  setPlaceholder(text: string): void {
    this.quickPick.placeholder = text;
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

  private submit(selectedItem: QuickPickItem): void {
    selectedItem && this.openSelected(selectedItem);
  }

  private async openSelected(qpItem: QuickPickItem): Promise<void> {
    const document = await vscode.workspace.openTextDocument(
      qpItem.uri!.scheme === "file" ? (qpItem.uri!.fsPath as any) : qpItem.uri
    );
    const editor = await vscode.window.showTextDocument(document);
    this.selectQpItem(editor, qpItem);
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

  private onDidChangeValueClearing = () => {
    this.quickPick.items = [];
  };

  private onDidChangeValue = (text: string): void => {
    this.loadItems();
  };

  private onDidAccept = (): void => {
    const selectedItem = this.quickPick.selectedItems[0];
    this.submit(selectedItem);
  };

  private onDidHide = (): void => {
    this.setText("");
  };
}

export default QuickPick;
