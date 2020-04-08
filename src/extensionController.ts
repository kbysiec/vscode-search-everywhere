import * as vscode from "vscode";
import QuickPick from "./quickPick";
import QuickPickItem from "./interface/quickPickItem";
import DataService from "./dataService";
import Utils from "./utils";
import Cache from "./cache";

class ExtensionController {
  private quickPick!: QuickPick;
  private dataService!: DataService;
  private utils!: Utils;
  private cache!: Cache;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.initComponents();

    this.cache.clearCache();
  }

  async search(): Promise<void> {
    if (this.utils.hasWorkspaceAnyFolder()) {
      await this.loadQuickPickData();
      this.quickPick.show();
    } else {
      this.printNoFolderOpenedMessage();
    }
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

  private printNoFolderOpenedMessage(): void {
    vscode.window.showInformationMessage(
      "Workspace doesn't contain any folder opened"
    );
  }

  private initComponents(): void {
    this.cache = new Cache(this.extensionContext);
    this.dataService = new DataService(this.cache);
    this.utils = new Utils();
    this.quickPick = new QuickPick(
      this.onQuickPickSubmit,
      this.onQuickPickChangeValue
    );
  }

  private onQuickPickSubmit = async (qpItem: QuickPickItem): Promise<void> => {
    await this.openSelected(qpItem);
  };

  private onQuickPickChangeValue = (text: string): void => {
    vscode.window.showInformationMessage(`Current text: ${text}`);
  };
}

export default ExtensionController;
