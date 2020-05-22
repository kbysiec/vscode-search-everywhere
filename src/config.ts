import * as vscode from "vscode";
import Cache from "./cache";
import ConfigKey from "./enum/configKey";

class Config {
  private default = {
    shouldDisplayNotificationInStatusBar: false,
    shouldInitOnStartup: false,
    exclude: [] as string[],
    include: [] as string[],
  };
  private readonly defaultSection = "searchEverywhere";

  constructor(private cache: Cache) {}

  shouldDisplayNotificationInStatusBar(): boolean {
    return this.get(
      ConfigKey.shouldDisplayNotificationInStatusBar,
      this.default.shouldDisplayNotificationInStatusBar
    );
  }

  shouldInitOnStartup(): boolean {
    return this.get(
      ConfigKey.shouldInitOnStartup,
      this.default.shouldInitOnStartup
    );
  }

  getExclude(): string[] {
    return this.get(ConfigKey.exclude, this.default.exclude);
  }

  getInclude(): string[] {
    return this.get(ConfigKey.include, this.default.include);
  }

  private get<T>(key: string, defaultValue: T, customSection?: string): T {
    const cacheKey = `${
      customSection ? customSection : this.defaultSection
    }.${key}`;
    let value = this.cache.getConfigByKey<T>(cacheKey);
    if (!value) {
      value = this.getConfigurationByKey<T>(key, defaultValue, customSection);
      this.cache.updateConfigByKey(cacheKey, value);
    }
    return value as T;
  }

  private getConfigurationByKey<T>(
    key: string,
    defaultValue: T,
    customSection?: string
  ): T {
    const value = this.getConfiguration<T>(
      `${customSection ? customSection : this.defaultSection}.${key}`,
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
