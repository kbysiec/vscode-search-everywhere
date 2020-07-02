import * as vscode from "vscode";
import Action from "./interface/action";

class WorkspaceEventsEmitter {
  onWillProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  onDidProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  onWillExecuteActionEventEmitter: vscode.EventEmitter<
    Action
  > = new vscode.EventEmitter();
  onDidDebounceConfigToggleEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  onWillReindexOnConfigurationChangeEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  readonly onWillProcessing: vscode.Event<void> = this
    .onWillProcessingEventEmitter.event;
  readonly onDidProcessing: vscode.Event<void> = this
    .onDidProcessingEventEmitter.event;
  readonly onWillExecuteAction: vscode.Event<Action> = this
    .onWillExecuteActionEventEmitter.event;
  readonly onDidDebounceConfigToggle: vscode.Event<void> = this
    .onDidDebounceConfigToggleEventEmitter.event;
  readonly onWillReindexOnConfigurationChange: vscode.Event<void> = this
    .onWillReindexOnConfigurationChangeEventEmitter.event;
}

export default WorkspaceEventsEmitter;
