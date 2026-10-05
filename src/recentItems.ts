import * as vscode from "vscode";
import { getRecentItems as getStoredRecentItems, updateRecentItems, clearRecentItems as clearStoredRecentItems } from "./cache";
import { dataConverter } from "./dataConverter";
import { QuickPickItem } from "./types";
import { utils } from "./utils";

export interface StoredRecentItem {
  uri: string;
  symbolKind: number;
  label: string;
  detail?: string;
  description?: string;
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

const MAX_STORED_ITEMS = 50;

function getItemKey(
  uri: string,
  symbolKind: number,
  line: number,
  character: number,
  label: string
): string {
  return `${uri}#${symbolKind}#${line}#${character}#${label}`;
}

export function addRecentItem(item: QuickPickItem): void {
  if (
    !item ||
    item.isHelp ||
    item.kind === vscode.QuickPickItemKind.Separator ||
    !item.uri
  ) {
    return;
  }

  const uriStr = item.uri.toString();
  const startLine = item.range?.start?.line ?? 0;
  const startChar = item.range?.start?.character ?? 0;
  const key = getItemKey(
    uriStr,
    item.symbolKind,
    startLine,
    startChar,
    item.label
  );

  const stored = getStoredRecentItems<StoredRecentItem>();
  const filtered = stored.filter(
    (it) =>
      getItemKey(
        it.uri,
        it.symbolKind,
        it.range?.start?.line ?? 0,
        it.range?.start?.character ?? 0,
        it.label
      ) !== key
  );

  const newItem: StoredRecentItem = {
    uri: uriStr,
    symbolKind: item.symbolKind,
    label: item.label,
    detail: item.detail,
    description: item.description,
    range: item.range
      ? {
          start: {
            line: item.range.start.line,
            character: item.range.start.character,
          },
          end: {
            line: item.range.end.line,
            character: item.range.end.character,
          },
        }
      : undefined,
  };

  filtered.unshift(newItem);
  if (filtered.length > MAX_STORED_ITEMS) {
    filtered.length = MAX_STORED_ITEMS;
  }

  updateRecentItems(filtered);
}

export function getRecentItems(limit: number = 10): QuickPickItem[] {
  const result: QuickPickItem[] = [];
  const seenKeys = new Set<string>();

  const stored = getStoredRecentItems<StoredRecentItem>();
  for (const it of stored) {
    if (result.length >= limit) {
      break;
    }
    try {
      const uri = vscode.Uri.parse(it.uri);
      const startLine = it.range?.start?.line ?? 0;
      const startChar = it.range?.start?.character ?? 0;
      const key = getItemKey(
        it.uri,
        it.symbolKind,
        startLine,
        startChar,
        it.label
      );
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        result.push({
          label: it.label,
          description: it.description,
          detail: it.detail,
          uri,
          symbolKind: it.symbolKind,
          range: it.range
            ? {
                start: new vscode.Position(
                  it.range.start.line,
                  it.range.start.character
                ),
                end: new vscode.Position(
                  it.range.end.line,
                  it.range.end.character
                ),
              }
            : undefined,
        });
      }
    } catch {}
  }

  // Supplement ONLY with physically open editor tabs (no background LS documents)
  if (result.length < limit) {
    const openUris: vscode.Uri[] = [];

    // 1. Preferred: real tabs visible in editor tab bars (VS Code >= 1.67)
    const tabGroups = (vscode.window as any).tabGroups;
    if (tabGroups && Array.isArray(tabGroups.all)) {
      for (const group of tabGroups.all) {
        if (group && Array.isArray(group.tabs)) {
          for (const tab of group.tabs) {
            const inputUri = (tab?.input as any)?.uri;
            if (inputUri instanceof vscode.Uri && inputUri.scheme === "file") {
              openUris.push(inputUri);
            }
          }
        }
      }
    } else if (vscode.window.visibleTextEditors) {
      // 2. Fallback: only actively visible text editors
      for (const editor of vscode.window.visibleTextEditors) {
        if (editor?.document?.uri && editor.document.uri.scheme === "file") {
          openUris.push(editor.document.uri);
        }
      }
    }

    for (const uri of openUris) {
      if (result.length >= limit) {
        break;
      }
      const uriStr = uri.toString();
      const fileKey = getItemKey(uriStr, 0, 0, 0, utils.getNameFromUri(uri));
      if (!seenKeys.has(fileKey)) {
        seenKeys.add(fileKey);
        try {
          const item = dataConverter.mapUriToQpItem(uri);
          result.push(item);
        } catch {}
      }
    }
  }

  return result;
}

export function clearRecentItems(): void {
  clearStoredRecentItems();
}

export const recentItems = {
  addRecentItem,
  getRecentItems,
  clearRecentItems,
};
