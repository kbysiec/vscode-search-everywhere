import * as vscode from "vscode";
import Cache from "./cache";

class Config {
  constructor(private cache: Cache) {}

  getExclude(): string[] {
    const key = "exclude";
    let value = this.cache.getConfigFromCacheByKey<string[]>(key);
    if (!value) {
      value = this.getConfigurationByKey<string[]>(key, []);
      this.cache.updateConfigCacheByKey(key, value);
    }
    return value as string[];
  }

  getInclude(): string[] {
    const key = "include";
    let value = this.cache.getConfigFromCacheByKey<string[]>(key);
    if (!value) {
      value = this.getConfigurationByKey<string[]>(key, []);
      this.cache.updateConfigCacheByKey(key, value);
    }
    return value as string[];
  }

  private getConfigurationByKey<T>(key: string, defaultValue: T): T {
    const value = this.getConfiguration<T>(
      `searchEverywhere.${key}`,
      defaultValue
    );
    return value as T;
  }

  private getConfiguration<T>(section: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration("");
    return config.get<T>(section, defaultValue);
  }
}

export default Config;
