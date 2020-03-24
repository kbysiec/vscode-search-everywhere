import * as vscode from "vscode";

export async function search(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("search command invoked");
}

export async function reload(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("reload command invoked");
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('Extension "vscode-search-everywhere" has been deactivated.');
}

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-search-everywhere" is now active!'
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "searchEverywhere.search",
      search.bind(null, context)
    ),
    vscode.commands.registerCommand(
      "searchEverywhere.reload",
      reload.bind(null, context)
    )
  );
}
