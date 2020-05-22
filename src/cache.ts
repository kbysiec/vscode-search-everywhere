import * as vscode from "vscode";
import QuickPickItem from "./interface/quickPickItem";
import { appConfig } from "./appConfig";

class Cache {
  constructor(private extensionContext: vscode.ExtensionContext) {}

  getData(): QuickPickItem[] | undefined {
    const cache: any = this.extensionContext.workspaceState.get(
      appConfig.dataCacheKey
    );
    let data: QuickPickItem[] | undefined = [];
    if (cache && cache.length) {
      data = cache;
    }
    return data;
  }

  updateData(data: QuickPickItem[]): void {
    this.extensionContext.workspaceState.update(appConfig.dataCacheKey, data);
  }

  getConfigByKey<T>(key: string): T | undefined {
    const cache: any = this.extensionContext.workspaceState.get(
      appConfig.configCacheKey
    );
    let config: T | undefined;
    if (cache) {
      config = cache[key];
    }
    return config;
  }

  updateConfigByKey<T>(key: string, value: T): void {
    let cache: any = this.extensionContext.workspaceState.get(
      appConfig.dataCacheKey
    );
    if (!cache) {
      cache = {};
    }
    cache[key] = value;
    this.extensionContext.workspaceState.update(
      appConfig.configCacheKey,
      cache
    );
  }

  clear(): void {
    this.clearData();
    this.clearConfig();
  }

  clearConfig(): void {
    this.extensionContext.workspaceState.update(appConfig.configCacheKey, {});
  }

  private clearData(): void {
    this.extensionContext.workspaceState.update(appConfig.dataCacheKey, []);
  }
}

export default Cache;
