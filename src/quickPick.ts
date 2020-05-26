import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";
import Config from "./config";

class QuickPick {
  private quickPick!: vscode.QuickPick<QuickPickItem>;
  private items: QuickPickItem[];

  constructor(private config: Config) {
    this.items = [];
  }

  init(): void {
    this.quickPick = vscode.window.createQuickPick();
    this.quickPick.matchOnDetail = true;
    this.quickPick.matchOnDescription = true;

    this.quickPick.onDidHide(this.onDidHide);
    this.quickPick.onDidAccept(this.onDidAccept);
    this.quickPick.onDidChangeValue(this.onDidChangeValue);
  }

  isInitialized(): boolean {
    return !!this.quickPick;
  }

  show(): void {
    if (!this.isInitialized()) {
      this.init();
    }
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

  private onDidChangeValue = (text: string): void => {
    vscode.window.showInformationMessage(`Current text: ${text}`);
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
