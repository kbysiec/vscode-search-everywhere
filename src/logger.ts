import * as vscode from "vscode";
import { Action, IndexStats, WorkspaceData } from "./types";
import { utils } from "./utils";

function init() {
  const channel = vscode.window.createOutputChannel("Search everywhere");
  setChannel(channel);
}

function log(message: string) {
  const timestamp = logger.getTimestamp();
  const channel = logger.getChannel();
  channel.appendLine(`[${timestamp}] ${message}`);
}

function logAction(action: Action) {
  const message = `Execute action - type: ${action.type} | fn: ${
    action.fn.name
  } | trigger: ${action.trigger} ${action.uri ? `| uri: ${action.uri}` : ""}`;
  logger.log(message);
}

function logScanTime(indexStats: IndexStats) {
  const message = `Workspace scan completed - elapsed time: ${indexStats.ElapsedTimeInSeconds}s | scanned files: ${indexStats.ScannedUrisCount} | indexed items: ${indexStats.IndexedItemsCount}`;
  logger.log(message);
}

function logStructure(data: WorkspaceData) {
  const message = `Scanned files:
  ${utils.getStructure(data)}`;
  logger.log(message);
}

function getTimestamp() {
  const date = new Date();

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

let channel: vscode.OutputChannel;

function setChannel(newChannel: vscode.OutputChannel) {
  channel = newChannel;
}

function getChannel() {
  return channel;
}

export const logger = {
  getTimestamp,
  getChannel,
  init,
  log,
  logAction,
  logScanTime,
  logStructure,
};
