import * as vscode from "vscode";
import ExcludeMode from "../../enum/excludeMode";
import PatternProvider from "../../patternProvider";
import { getItems } from "../util/itemMockFactory";
import { getTextDocumentStub } from "../util/stubFactory";
import { restoreStubbedMultiple, stubMultiple } from "../util/stubHelpers";

export const getTestSetups = (patternProvider: PatternProvider) => {
  const patternProviderAny = patternProvider as any;

  return {
    getIncludePatterns1: () => {
      const patterns = "**/*.{js,ts}";
      stubMultiple([
        {
          object: patternProviderAny,
          method: "includePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return patterns;
    },
    getExcludePatterns1: () => {
      const patterns = ["**/.history/**", "**/.vscode/**"];
      const expected = `{${patterns.join(",")}}`;
      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.SearchEverywhere,
          isNotMethod: true,
        },
        {
          object: patternProviderAny,
          method: "extensionExcludePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return expected;
    },
    getExcludePatterns2: () => {
      const patterns = ["**/.history/**", "**/.vscode/**"];
      const expected = `{${patterns.join(",")}}`;
      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.FilesAndSearch,
          isNotMethod: true,
        },
        {
          object: patternProviderAny,
          method: "filesAndSearchExcludePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return expected;
    },
    getExcludePatterns3: () => {
      const patterns = ["**/.history/**", "**/.vscode/**"];
      const expected = `{${patterns.join(",")}}`;
      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.Gitignore,
          isNotMethod: true,
        },
        {
          object: patternProviderAny,
          method: "gitignoreExcludePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return expected;
    },

    getExcludePatterns4: () => {
      const patterns = ["dist", "out", ".vscode", ".history"];
      const expected = `{${patterns.join(",")}}`;
      const textDocument = getTextDocumentStub();

      restoreStubbedMultiple([
        {
          object: vscode.workspace,
          method: "findFiles",
        },
      ]);

      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.Gitignore,
          isNotMethod: true,
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: getItems(1),
        },
        {
          object: textDocument,
          method: "getText",
          returns:
            "# Project\ndist\nout\n\n# IDE config files\n\n.vscode\n.history\n\n",
        },
        {
          object: vscode.workspace,
          method: "openTextDocument",
          returns: textDocument,
        },
      ]);

      return expected;
    },
    getExcludePatterns5: () => {
      const patterns = [".vscode", ".history"];
      const expected = `{${patterns.join(",")}}`;
      const textDocument = getTextDocumentStub();

      restoreStubbedMultiple([
        {
          object: vscode.workspace,
          method: "findFiles",
        },
        {
          object: vscode.workspace,
          method: "openTextDocument",
        },
      ]);

      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.Gitignore,
          isNotMethod: true,
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: [],
        },
        {
          object: textDocument,
          method: "getText",
          returns:
            "# Project\ndist\nout\n\n# IDE config files\n\n.vscode\n.history\n\n",
        },
        {
          object: vscode.workspace,
          method: "openTextDocument",
          returns: textDocument,
        },
        {
          object: patternProviderAny,
          method: "fallbackExcludePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return expected;
    },
    getExcludePatterns6: () => {
      const patterns = [".vscode", ".history"];
      const expected = `{${patterns.join(",")}}`;
      const textDocument = getTextDocumentStub();

      restoreStubbedMultiple([
        {
          object: vscode.workspace,
          method: "findFiles",
        },
        {
          object: vscode.workspace,
          method: "openTextDocument",
        },
      ]);

      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.Gitignore,
          isNotMethod: true,
        },
        {
          object: vscode.workspace,
          method: "findFiles",
          returns: getItems(1),
        },
        {
          object: textDocument,
          method: "getText",
          returns: "",
        },
        {
          object: vscode.workspace,
          method: "openTextDocument",
          returns: textDocument,
        },
        {
          object: patternProviderAny,
          method: "fallbackExcludePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return expected;
    },
    getExcludePatterns7: () => {
      const patterns = ["**/.history/**", "**/.vscode/**"];
      const expected = `{${patterns.join(",")}}`;
      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.SearchEverywhere,
          isNotMethod: true,
        },
        {
          object: patternProviderAny,
          method: "extensionExcludePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return expected;
    },
    getExcludePatterns8: () => {
      const patterns = ["**/.history/**"];
      const expected = "**/.history/**";
      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.SearchEverywhere,
          isNotMethod: true,
        },
        {
          object: patternProviderAny,
          method: "extensionExcludePatterns",
          returns: patterns,
          isNotMethod: true,
        },
      ]);

      return expected;
    },
    getExcludePatterns9: () => {
      const expected = "";
      stubMultiple([
        {
          object: patternProviderAny,
          method: "excludeMode",
          returns: ExcludeMode.SearchEverywhere,
          isNotMethod: true,
        },
        {
          object: patternProviderAny,
          method: "extensionExcludePatterns",
          returns: [],
          isNotMethod: true,
        },
      ]);

      return expected;
    },
  };
};
