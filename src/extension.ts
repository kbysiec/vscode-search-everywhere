import * as vscode from "vscode";
import { extensionController } from "./extensionController";

export async function search() {
  await extensionController.search();
}

export async function reload() {
  await extensionController.reload();
}

export function deactivate() {
  console.log('Extension "vscode-search-everywhere" has been deactivated.');
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('Extension "vscode-search-everywhere" has been activated.');

  extensionController.init(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "searchEverywhere.search",
      search.bind(null, extensionController)
    ),
    vscode.commands.registerCommand(
      "searchEverywhere.reload",
      reload.bind(null, extensionController)
    )
  );

  await extensionController.startup();
}
