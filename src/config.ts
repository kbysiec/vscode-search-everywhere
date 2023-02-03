import * as vscode from "vscode";
import { getConfigByKey, updateConfigByKey } from "./cache";
import { ExcludeMode, Icons, ItemsFilter, ItemsFilterPhrases } from "./types";

const defaultSection = "searchEverywhere";
const keys = {
  shouldDisplayNotificationInStatusBar: {
    name: "shouldDisplayNotificationInStatusBar",
    value: false,
  },
  shouldInitOnStartup: {
    name: "shouldInitOnStartup",
    value: false,
  },
  shouldHighlightSymbol: {
    name: "shouldHighlightSymbol",
    value: false,
  },
  shouldUseDebounce: {
    name: "shouldUseDebounce",
    value: false,
  },
  icons: {
    name: "icons",
    value: {} as Icons,
  },
  itemsFilter: {
    name: "itemsFilter",
    value: {
      allowedKinds: [],
      ignoredKinds: [],
      ignoredNames: [],
    } as ItemsFilter,
  },
  shouldUseItemsFilterPhrases: {
    name: "shouldUseItemsFilterPhrases",
    value: false,
  },
  itemsFilterPhrases: {
    name: "itemsFilterPhrases",
    value: {} as ItemsFilterPhrases,
  },
  helpPhrase: {
    name: "helpPhrase",
    value: "?",
  },
  shouldItemsBeSorted: {
    name: "shouldItemsBeSorted",
    value: true,
  },
  shouldSearchSelection: {
    name: "shouldSearchSelection",
    value: true,
  },
  exclude: {
    name: "exclude",
    value: [] as string[],
  },
  include: {
    name: "include",
    value: "",
  },
  excludeMode: {
    name: "excludeMode",
    value: ExcludeMode.SearchEverywhere,
  },
  shouldWorkspaceDataBeCached: {
    name: "shouldWorkspaceDataBeCached",
    value: true,
  },
};

function getConfigurationByKey<T>(
  key: string,
  defaultValue: T,
  customSection?: string
): T {
  return getConfiguration<T>(
    `${customSection ? customSection : defaultSection}.${key}`,
    defaultValue
  );
}

function get<T>(key: string, defaultValue: T, customSection?: string): T {
  const cacheKey = `${customSection ? customSection : defaultSection}.${key}`;
  let value = getConfigByKey<T>(cacheKey);
  if (!value) {
    value = getConfigurationByKey<T>(key, defaultValue, customSection);
    updateConfigByKey(cacheKey, value);
  }
  return value as T;
}

function getFilesExclude(): string[] {
  return get(keys.exclude.name, keys.exclude.value, "files");
}

function getSearchExclude(): string[] {
  return get(keys.exclude.name, keys.exclude.value, "search");
}

function getConfiguration<T>(section: string, defaultValue: T): T {
  const config = vscode.workspace.getConfiguration("");
  return config.get<T>(section, defaultValue);
}

export function fetchShouldDisplayNotificationInStatusBar(): boolean {
  return get(
    keys.shouldDisplayNotificationInStatusBar.name,
    keys.shouldDisplayNotificationInStatusBar.value
  );
}

export function fetchShouldInitOnStartup(): boolean {
  return get(keys.shouldInitOnStartup.name, keys.shouldInitOnStartup.value);
}

export function fetchShouldHighlightSymbol(): boolean {
  return get(keys.shouldHighlightSymbol.name, keys.shouldHighlightSymbol.value);
}

export function fetchShouldUseDebounce(): boolean {
  return get(keys.shouldUseDebounce.name, keys.shouldUseDebounce.value);
}

export function fetchIcons(): Icons {
  return get(keys.icons.name, keys.icons.value);
}

export function fetchItemsFilter(): ItemsFilter {
  return get(keys.itemsFilter.name, keys.itemsFilter.value);
}

export function fetchShouldUseItemsFilterPhrases(): boolean {
  return get(
    keys.shouldUseItemsFilterPhrases.name,
    keys.shouldUseItemsFilterPhrases.value
  );
}

export function fetchItemsFilterPhrases(): ItemsFilterPhrases {
  return get(keys.itemsFilterPhrases.name, keys.itemsFilterPhrases.value);
}

export function fetchHelpPhrase(): string {
  return get(keys.helpPhrase.name, keys.helpPhrase.value);
}

export function fetchShouldItemsBeSorted(): boolean {
  return get(keys.shouldItemsBeSorted.name, keys.shouldItemsBeSorted.value);
}

export function fetchShouldSearchSelection(): boolean {
  return get(keys.shouldSearchSelection.name, keys.shouldSearchSelection.value);
}

export function fetchExclude(): string[] {
  return get(keys.exclude.name, keys.exclude.value);
}

export function fetchInclude(): string {
  return get(keys.include.name, keys.include.value);
}

export function fetchFilesAndSearchExclude(): string[] {
  let excludePatterns: Array<string> = [];
  const filesExcludePatterns = getFilesExclude();
  const searchExcludePatterns = getSearchExclude();

  const allExcludePatterns = Object.assign(
    {},
    filesExcludePatterns,
    searchExcludePatterns
  );
  for (let [key, value] of Object.entries(allExcludePatterns)) {
    value && excludePatterns.push(key);
  }

  return excludePatterns;
}

export function fetchExcludeMode(): ExcludeMode {
  return get(keys.excludeMode.name, keys.excludeMode.value);
}

export function fetchShouldWorkspaceDataBeCached(): boolean {
  return get(
    keys.shouldWorkspaceDataBeCached.name,
    keys.shouldWorkspaceDataBeCached.value
  );
}
