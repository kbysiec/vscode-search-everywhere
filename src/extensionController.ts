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

  async search(): Promise<void> {
    await this.loadQuickPickData();
    this.quickPick.show();
  }

  private async loadQuickPickData(): Promise<void> {
    this.quickPick.showLoading(true);
    const data = await this.getQuickPickData();
    this.quickPick.loadItems(data);
    this.quickPick.showLoading(false);
  }

  private async getQuickPickData(): Promise<QuickPickItem[]> {
    const qpItems: QuickPickItem[] = [
      {
        label: "fake-1.ts",
        uri: vscode.Uri.file("./test/mock/fake/fake-1.ts"),
        symbolKind: 0
      },
      {
        label: "fake-2.ts",
        uri: vscode.Uri.file("./test/mock/fake/fake-2.ts"),
        symbolKind: 0
      }
    ];

    return qpItems;
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
