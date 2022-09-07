import * as vscode from "vscode";
import {
  fetchExclude,
  fetchExcludeMode,
  fetchFilesAndSearchExclude,
  fetchInclude,
} from "./config";
import { ExcludeMode } from "./types";

const endLineRegex = /[^\r\n]+/g;
const gitignoreFilePattern = "**/.gitignore";

async function getGitignoreExclude() {
  const gitignoreExcludePatterns = await getGitignoreOrFallbackExclude();
  return gitignoreExcludePatterns;
}

async function getGitignoreOrFallbackExclude(): Promise<string[]> {
  const gitignoreExclude = await fetchGitignoreExclude();
  const fallbackExclude = patternProvider.getFallbackExcludePatterns();

  return gitignoreExclude || fallbackExclude;
}

async function fetchGitignoreExclude(): Promise<string[] | null> {
  const gitignoreFile = await getGitignoreFile();
  if (gitignoreFile) {
    const text = await getGitignoreFileText(gitignoreFile);
    const lines = textToLines(text);
    return lines.length ? removeLinesWithComments(lines) : null;
  }
  return null;
}

async function getGitignoreFile(): Promise<vscode.Uri | null> {
  const files = await vscode.workspace.findFiles(gitignoreFilePattern);

  return files.length >= 1 ? files[0] : null;
}

async function getGitignoreFileText(uri: vscode.Uri): Promise<string> {
  const document = await vscode.workspace.openTextDocument(uri.path);
  return document.getText();
}

function textToLines(text: string): string[] {
  return text.match(endLineRegex) || [];
}

function removeLinesWithComments(lines: string[]): string[] {
  return lines.filter((line) => !line.startsWith("#"));
}

function getExcludePatternsAsString(patterns: string[]): string {
  const excludePatternsFormat: { [k: number]: string } = {
    0: "",
    1: patterns[0],
    [patterns.length > 1 ? patterns.length : -1]: `{${patterns.join(",")}}`,
  };

  return excludePatternsFormat[patterns.length];
}

async function getExcludePatterns(): Promise<string> {
  const excludePatterns: { [k: string]: string[] } = {
    [ExcludeMode.SearchEverywhere]:
      patternProvider.getExtensionExcludePatterns(),
    [ExcludeMode.FilesAndSearch]:
      patternProvider.getFilesAndSearchExcludePatterns(),
    [ExcludeMode.Gitignore]: patternProvider.getGitignoreExcludePatterns(),
  };

  return getExcludePatternsAsString(
    excludePatterns[patternProvider.getExcludeMode()]
  );
}

async function fetchConfig() {
  const excludeMode = fetchExcludeMode();
  setExcludeMode(excludeMode);

  const includePatterns = fetchInclude();
  setIncludePatterns(includePatterns);

  const extensionExcludePatterns = fetchExclude();
  setExtensionExcludePatterns(extensionExcludePatterns);

  const fallbackExcludePatterns = patternProvider.getExtensionExcludePatterns();
  setFallbackExcludePatterns(fallbackExcludePatterns);

  const filesAndSearchExcludePatterns = fetchFilesAndSearchExclude();
  setFilesAndSearchExcludePatterns(filesAndSearchExcludePatterns);

  const gitignoreExcludePatterns = await getGitignoreExclude();
  setGitignoreExcludePatterns(gitignoreExcludePatterns);
}

function getExcludeMode() {
  return excludeMode;
}

function setExcludeMode(newExcludeMode: ExcludeMode) {
  excludeMode = newExcludeMode;
}

function getIncludePatterns() {
  return includePatterns;
}

function setIncludePatterns(newIncludePatterns: string) {
  includePatterns = newIncludePatterns;
}

function getExtensionExcludePatterns() {
  return extensionExcludePatterns;
}

function setExtensionExcludePatterns(newExtensionExcludePatterns: string[]) {
  extensionExcludePatterns = newExtensionExcludePatterns;
}

function getFallbackExcludePatterns() {
  return fallbackExcludePatterns;
}

function setFallbackExcludePatterns(newFallbackExcludePatterns: string[]) {
  fallbackExcludePatterns = newFallbackExcludePatterns;
}

function getFilesAndSearchExcludePatterns() {
  return filesAndSearchExcludePatterns;
}

function setFilesAndSearchExcludePatterns(
  newFilesAndSearchExcludePatterns: string[]
) {
  filesAndSearchExcludePatterns = newFilesAndSearchExcludePatterns;
}

function getGitignoreExcludePatterns() {
  return gitignoreExcludePatterns;
}

function setGitignoreExcludePatterns(newGitignoreExcludePatterns: string[]) {
  gitignoreExcludePatterns = newGitignoreExcludePatterns;
}

let excludeMode = ExcludeMode.SearchEverywhere;
let includePatterns = "";
let extensionExcludePatterns: string[] = [];
let filesAndSearchExcludePatterns: string[] = [];
let gitignoreExcludePatterns: string[] = [];
let fallbackExcludePatterns: string[] = [];

export const patternProvider = {
  getExcludeMode,
  getIncludePatterns,
  getExtensionExcludePatterns,
  getFilesAndSearchExcludePatterns,
  getGitignoreExcludePatterns,
  getFallbackExcludePatterns,
  getExcludePatterns,
  fetchConfig,
};
