import * as vscode from "vscode";

export function getExtensionContext(): vscode.ExtensionContext {
  return {
    subscriptions: [],
    workspaceState: {
      get: () => {},
      update: () => Promise.resolve()
    },
    globalState: {
      get: () => {},
      update: () => Promise.resolve()
    },
    extensionPath: "",
    storagePath: "",
    globalStoragePath: "",
    logPath: "",
    asAbsolutePath: (relativePath: string) => relativePath
  } as vscode.ExtensionContext;
}
