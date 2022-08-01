import * as vscode from "vscode";

export const onDidItemIndexedEventEmitter: vscode.EventEmitter<number> =
  new vscode.EventEmitter();
export const onDidItemIndexed: vscode.Event<number> =
  onDidItemIndexedEventEmitter.event;
