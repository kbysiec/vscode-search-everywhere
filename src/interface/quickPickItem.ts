import * as vscode from "vscode";

interface QuickPickItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
  symbolKind: number;
  range?: Range;
  isHelp?: boolean;
}

interface Range {
  start: any;
  end: any;
}

export default QuickPickItem;
