import * as vscode from "vscode";
import Config from "./config";

class DataService {
  private config: Config;

  constructor() {
    this.config = new Config();
  }

  async getData(): Promise<vscode.Uri[]> {
    const includePatterns = this.getIncludePatterns();
    const excludePatterns = this.getExcludePatterns();
    const files = await vscode.workspace.findFiles(
      includePatterns,
      excludePatterns
    );
    return files;
  }

  private getIncludePatterns(): string {
    const includePatterns = this.config.getInclude();
    return this.patternsAsString(includePatterns);
  }

  private getExcludePatterns(): string {
    const excludePatterns = this.config.getExclude();
    return this.patternsAsString(excludePatterns);
  }

  private patternsAsString(patterns: string[]): string {
    if (patterns.length === 0) {
      return "";
    } else if (patterns.length === 1) {
      return patterns[0];
    } else {
      return `{${patterns.join(",")}}`;
    }
  }
}

export default DataService;
