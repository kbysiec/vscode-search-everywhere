import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";

class QuickPick {
  private quickPick: vscode.QuickPick<QuickPickItem>;

  constructor(onSubmitCallback: Function, onChangeValueCallback: Function) {
    this.quickPick = vscode.window.createQuickPick();
    this.quickPick.matchOnDetail = true;
    this.quickPick.matchOnDescription = true;

    this.quickPick.onDidHide(this.onDidHide.bind(this));
    this.quickPick.onDidAccept(this.onDidAccept.bind(this, onSubmitCallback));
    this.quickPick.onDidChangeValue(
      this.onDidChangeValue.bind(this, onChangeValueCallback)
    );
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

  private submit(selectedItem: QuickPickItem, callback: Function): void {
    selectedItem && callback(selectedItem);
  }

  private onDidChangeValue(
    onChangeValueCallback: Function,
    text: string
  ): void {
    onChangeValueCallback(text);
  }

  private onDidAccept(onSubmitCallback: Function): void {
    const selectedItem = this.quickPick.selectedItems[0];
    this.submit(selectedItem, onSubmitCallback);
  }

  private onDidHide(): void {
    this.setText("");
  }
}

export default QuickPick;
