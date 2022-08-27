import * as sinon from "sinon";
import * as vscode from "vscode";
import { logger } from "../../logger";
import { utils } from "../../utils";
import {
  getAction,
  getIndexStats,
  getWorkspaceData,
} from "../util/mockFactory";
import { stubMultiple } from "../util/stubHelpers";

export const getTestSetups = () => {
  const sandbox = sinon.createSandbox();

  const now = new Date("2022-01-01");
  const outputChannelInner =
    vscode.window.createOutputChannel("Search everywhere");

  return {
    beforeEach: () => {
      stubMultiple(
        [
          {
            object: logger,
            method: "getChannel",
            returns: outputChannelInner,
          },
        ],
        sandbox
      );
    },
    afterEach: () => {
      sandbox.restore();
    },
    init1: () => {
      return stubMultiple(
        [
          {
            object: vscode.window,
            method: "createOutputChannel",
          },
        ],
        sandbox
      );
    },
    log1: () => {
      const fakeTimer = sandbox.useFakeTimers(now);
      const timestamp = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const expectedMessage = `[${timestamp}] test message`;

      const stubs = stubMultiple(
        [
          {
            object: outputChannelInner,
            method: "appendLine",
          },
        ],
        sandbox
      );

      return { stubs, expectedMessage, fakeTimer };
    },
    logAction1: () => {
      const fakeTimer = sandbox.useFakeTimers(now);
      const timestamp = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const action = getAction(undefined, undefined, undefined, true);
      const expectedMessage = `[${timestamp}] Execute action - type: ${action.type} | fn: ${action.fn.name} | trigger: ${action.trigger} | uri: ${action.uri}`;

      const stubs = stubMultiple(
        [
          {
            object: outputChannelInner,
            method: "appendLine",
          },
        ],
        sandbox
      );

      return { stubs, expectedMessage, fakeTimer, action };
    },
    logScanTime1: () => {
      const fakeTimer = sandbox.useFakeTimers(now);
      const timestamp = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const indexStats = getIndexStats();
      const expectedMessage = `[${timestamp}] Workspace scan completed - elapsed time: ${indexStats.ElapsedTimeInSeconds}s | scanned files: ${indexStats.ScannedUrisCount} | indexed items: ${indexStats.IndexedItemsCount}`;

      const stubs = stubMultiple(
        [
          {
            object: outputChannelInner,
            method: "appendLine",
          },
        ],
        sandbox
      );

      return { stubs, expectedMessage, fakeTimer, indexStats };
    },
    logStructure1: () => {
      const fakeTimer = sandbox.useFakeTimers(now);
      const timestamp = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const workspaceDataItems = [
        {
          uri: vscode.Uri.file("/fake/fake-1.ts"),
          get elements() {
            return [
              this.uri,
              {
                name: "fake-1.ts§&§test name",
                detail: "test details",
                kind: 1,
                range: new vscode.Range(
                  new vscode.Position(0, 0),
                  new vscode.Position(3, 0)
                ),
                selectionRange: new vscode.Range(
                  new vscode.Position(0, 0),
                  new vscode.Position(3, 0)
                ),
                children: [],
              },
              {
                name: "fake-1.ts§&§test name 2",
                detail: "test details 2",
                kind: 1,
                range: new vscode.Range(
                  new vscode.Position(4, 0),
                  new vscode.Position(5, 0)
                ),
                selectionRange: new vscode.Range(
                  new vscode.Position(4, 0),
                  new vscode.Position(5, 0)
                ),
                children: [],
              },
              {
                name: "test name 3",
                detail: "test details 3",
                kind: 1,
                range: new vscode.Range(
                  new vscode.Position(9, 0),
                  new vscode.Position(9, 0)
                ),
                selectionRange: new vscode.Range(
                  new vscode.Position(9, 0),
                  new vscode.Position(9, 0)
                ),
                children: [],
              },
            ];
          },
        },
        {
          uri: vscode.Uri.file("/fake-other/fake-2.ts"),
          get elements() {
            return [this.uri];
          },
        },
        {
          uri: vscode.Uri.file("/fake-another/fake-3.ts"),
          get elements() {
            return [];
          },
        },
      ];

      const workspaceData = getWorkspaceData(workspaceDataItems);
      const structure = `{
  "fake": {
    "fake-1.ts": "4 items"
  },
  "fake-other": {
    "fake-2.ts": "1 item"
  },
  "fake-another": {
    "fake-3.ts": "0 items"
  }
}`.replaceAll(" ", "");

      const expectedMessage = `[${timestamp}] Scanned files:
  ${structure}`;

      const stubs = stubMultiple(
        [
          {
            object: outputChannelInner,
            method: "appendLine",
          },
          {
            object: utils,
            method: "getStructure",
            returns: structure,
          },
        ],
        sandbox
      );

      return { stubs, expectedMessage, fakeTimer, workspaceData };
    },
  };
};
