import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";

class QuickPick {
  private quickPick: vscode.QuickPick<QuickPickItem>;

  constructor() {
    this.quickPick = vscode.window.createQuickPick();
    this.quickPick.matchOnDetail = true;
    this.quickPick.matchOnDescription = true;

    this.quickPick.onDidHide(this.onDidHide);
    this.quickPick.onDidAccept(this.onDidAccept);
    this.quickPick.onDidChangeValue(this.onDidChangeValue);
  }

  show(): void {
    this.quickPick.show();
  }

  loadItems(items: QuickPickItem[]): void {
    this.quickPick.items = items;
  }

  showLoading(value: boolean): void {
    this.quickPick.busy = value;
  }

  setText(text: string): void {
    this.quickPick.value = text;
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
    const { range } = qpItem;
    const start = new vscode.Position(
      range!.start.line,
      range!.start.character
    );
    editor.selection = new vscode.Selection(start, start);

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
