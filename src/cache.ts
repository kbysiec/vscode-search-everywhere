import * as vscode from "vscode";
import { appConfig } from "./appConfig";
import { QuickPickItem } from "./types";

let extensionContext: vscode.ExtensionContext;

export function initCache(context: vscode.ExtensionContext) {
  extensionContext = context;
}

export function getData(): QuickPickItem[] | undefined {
  const data: any = extensionContext.workspaceState.get(appConfig.dataCacheKey);

  return data && data.length ? data : [];
}

export function updateData(data: QuickPickItem[]): void {
  extensionContext.workspaceState.update(appConfig.dataCacheKey, data);
}

export function getNotSavedUriPaths(): string[] {
  const paths: string[] | undefined = extensionContext.workspaceState.get(
    appConfig.notSaveUriPathsKey
  );

  return paths || [];
}

export function updateNotSavedUriPaths(paths: string[]): void {
  extensionContext.workspaceState.update(appConfig.notSaveUriPathsKey, paths);
}

export function getConfigByKey<T>(key: string): T | undefined {
  const cache: any = extensionContext.workspaceState.get(
    appConfig.configCacheKey
  );

  return cache ? cache[key] : undefined;
}

export function updateConfigByKey<T>(key: string, value: T): void {
  let cache: any =
    extensionContext.workspaceState.get(appConfig.configCacheKey) || {};
  cache[key] = value;

  extensionContext.workspaceState.update(appConfig.configCacheKey, cache);
}

export function clear(): void {
  clearData();
  clearConfig();
}

export function clearConfig(): void {
  extensionContext.workspaceState.update(appConfig.configCacheKey, {});
}

function clearData(): void {
  extensionContext.workspaceState.update(appConfig.dataCacheKey, []);
}

export function clearNotSavedUriPaths(): void {
  extensionContext.workspaceState.update(appConfig.notSaveUriPathsKey, []);
}
