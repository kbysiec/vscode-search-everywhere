import * as vscode from "vscode";
import QuickPick from "./quickPick";
import QuickPickItem from "./interface/quickPickItem";
import DataService from "./dataService";
import Utils from "./utils";

class ExtensionController {
  private quickPick: QuickPick;
  private dataService: DataService;
  private utils: Utils;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.dataService = new DataService();
    this.utils = new Utils();
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
    const data = await this.dataService.getData();
    const qpData = this.utils.prepareQpData(data);
    return qpData;
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
