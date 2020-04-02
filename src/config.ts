import * as vscode from "vscode";

class Config {
  getExclude(): string[] {
    return this.getConfigurationByKey<string[]>("exclude", []);
  }

  getInclude(): string[] {
    return this.getConfigurationByKey<string[]>("include", []);
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
