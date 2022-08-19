import * as vscode from "vscode";
import { controller } from "./controller";

export async function search() {
  await controller.search();
}

export async function reload() {
  await controller.reload();
}

export function deactivate() {
  console.log('Extension "vscode-search-everywhere" has been deactivated.');
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('Extension "vscode-search-everywhere" has been activated.');

  await controller.init(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "searchEverywhere.search",
      search.bind(null, controller)
    ),
    vscode.commands.registerCommand(
      "searchEverywhere.reload",
      reload.bind(null, controller)
    )
  );

  await controller.startup();
}
