import * as vscode from "vscode";
import QuickPick from "./quickPick";
import QuickPickItem from "./interface/quickPickItem";

class ExtensionController {
  private quickPick: QuickPick;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.quickPick = new QuickPick(
      this.onQuickPickSubmit,
      this.onQuickPickChangeValue
    );
  }

  search(): void {
    this.quickPick.show();
  }

  private onQuickPickSubmit = (qpItem: QuickPickItem) => {
    vscode.window.showInformationMessage(
      `Selected qpItem label: ${qpItem.label}`
    );
  };

  private onQuickPickChangeValue = (text: string) => {
    vscode.window.showInformationMessage(`Current text: ${text}`);
  };
}

export default ExtensionController;
