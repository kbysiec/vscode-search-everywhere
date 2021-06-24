import * as vscode from "vscode";
import Config from "./config";
import ExcludeMode from "./enum/excludeMode";

class PatternProvider {
  private gitignoreFilePattern = "**/.gitignore";
  private endLineRegex = /[^\r\n]+/g;

  private excludeMode!: ExcludeMode;
  private includePatterns!: string;
  private extensionExcludePatterns!: string[];
  private filesAndSearchExcludePatterns!: string[];
  private gitignoreExcludePatterns!: string[];
  private fallbackExcludePatterns = this.extensionExcludePatterns;

  constructor(private config: Config) {
    this.fetchConfig();
  }

  getIncludePatterns(): string {
    return this.includePatterns;
  }

  async getExcludePatterns(
    shouldfetchGitignoreExcludePatterns: boolean
  ): Promise<string> {
    let excludePatterns: string[] = [];

    if (this.excludeMode === ExcludeMode.SearchEverywhere) {
      excludePatterns = this.extensionExcludePatterns;
    } else if (this.excludeMode === ExcludeMode.FilesAndSearch) {
      excludePatterns = this.filesAndSearchExcludePatterns;
    } else {
      excludePatterns = await this.getGitignoreExclude(
        shouldfetchGitignoreExcludePatterns
      );
    }
    return this.getExcludePatternsAsString(excludePatterns);
  }

  private async getGitignoreExclude(
    shouldfetchGitignoreExcludePatterns: boolean
  ) {
    if (shouldfetchGitignoreExcludePatterns) {
      const excludePatterns = await this.getGitignoreOrFallbackExclude();
      this.cacheGitignoreExcludePatterns(excludePatterns);
    }
    return this.gitignoreExcludePatterns;
  }

  private cacheGitignoreExcludePatterns(excludePatterns: string[]) {
    this.gitignoreExcludePatterns = excludePatterns;
  }

  private async getGitignoreOrFallbackExclude(): Promise<string[]> {
    const gitignoreExclude = await this.fetchGitignoreExclude();
    const fallbackExclude = this.fallbackExcludePatterns;

    return gitignoreExclude || fallbackExclude;
  }

  private async fetchGitignoreExclude(): Promise<string[] | null> {
    const gitignoreFile = await this.getGitignoreFile();
    if (gitignoreFile) {
      const text = await this.getGitignoreFileText(gitignoreFile);
      const lines = this.textToLines(text);
      return lines.length ? this.removeLinesWithComments(lines) : null;
    }
    return null;
  }

  private async getGitignoreFile(): Promise<vscode.Uri | null> {
    const files = await vscode.workspace.findFiles(this.gitignoreFilePattern);

    return files.length >= 1 ? files[0] : null;
  }

  private async getGitignoreFileText(uri: vscode.Uri): Promise<string> {
    const document = await vscode.workspace.openTextDocument(uri.fsPath);
    return document.getText();
  }

  private textToLines(text: string): string[] {
    return text.match(this.endLineRegex) || [];
  }

  private removeLinesWithComments(lines: string[]): string[] {
    return lines.filter((line) => !line.startsWith("#"));
  }

  private getExcludePatternsAsString(patterns: string[]): string {
    if (patterns.length === 0) {
      return "";
    } else if (patterns.length === 1) {
      return patterns[0];
    } else {
      return `{${patterns.join(",")}}`;
    }
  }

  private fetchConfig() {
    this.excludeMode = this.config.getExcludeMode();
    this.includePatterns = this.config.getInclude();
    this.extensionExcludePatterns = this.config.getExclude();
    this.filesAndSearchExcludePatterns = this.config.getFilesAndSearchExclude();
    this.gitignoreExcludePatterns = [];
  }
}

export default PatternProvider;
