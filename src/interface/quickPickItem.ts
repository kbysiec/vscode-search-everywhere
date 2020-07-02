import * as vscode from "vscode";

interface QuickPickItem extends vscode.QuickPickItem {
  uri: vscode.Uri;
  kind: number;
  range?: Range;
  isHelp?: boolean;
}

interface Range {
  start: any;
  end: any;
}

export default QuickPickItem;
