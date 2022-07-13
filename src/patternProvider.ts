import * as vscode from "vscode";
import {
  getExclude,
  getExcludeMode,
  getFilesAndSearchExclude,
  getInclude,
} from "./config";
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

  constructor() {
    this.fetchConfig();
  }

  getIncludePatterns(): string {
    return this.includePatterns;
  }

  async getExcludePatterns(
    shouldfetchGitignoreExcludePatterns: boolean
  ): Promise<string> {
    const excludePatterns: { [k: string]: string[] } = {
      [ExcludeMode.SearchEverywhere]: this.extensionExcludePatterns,
      [ExcludeMode.FilesAndSearch]: this.filesAndSearchExcludePatterns,
      [ExcludeMode.Gitignore]: await this.getGitignoreExclude(
        shouldfetchGitignoreExcludePatterns
      ),
    };

    return this.getExcludePatternsAsString(excludePatterns[this.excludeMode]);
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
    const excludePatternsFormat: { [k: number]: string } = {
      0: "",
      1: patterns[0],
      [patterns.length > 1 ? patterns.length : -1]: `{${patterns.join(",")}}`,
    };

    return excludePatternsFormat[patterns.length];
  }

  private fetchConfig() {
    this.excludeMode = getExcludeMode();
    this.includePatterns = getInclude();
    this.extensionExcludePatterns = getExclude();
    this.filesAndSearchExcludePatterns = getFilesAndSearchExclude();
    this.gitignoreExcludePatterns = [];
  }
}

export default PatternProvider;
