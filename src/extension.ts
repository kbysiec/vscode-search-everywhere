import * as vscode from "vscode";
import ExtensionController from "./extensionController";

export async function search(extensionController: ExtensionController) {
  await extensionController.search();
}

export async function reload(extensionController: ExtensionController) {
  vscode.window.showInformationMessage("reload command invoked");
}

export function deactivate() {
  console.log('Extension "vscode-search-everywhere" has been deactivated.');
}

export async function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-search-everywhere" is now active!'
  );

  const extensionController: ExtensionController = new ExtensionController(
    context
  );

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
