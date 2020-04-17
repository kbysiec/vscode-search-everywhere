import * as vscode from "vscode";

interface Item {
  uri: vscode.Uri;
  elements: Array<vscode.DocumentSymbol | vscode.Uri>;
}

export default Item;
