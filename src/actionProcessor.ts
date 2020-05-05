import * as vscode from "vscode";
import Action from "./interface/action";

class ActionProcessor {
  private isBusy = false;
  private queue: Action[] = [];
  private onDidProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  readonly onDidProcessing: vscode.Event<void> = this
    .onDidProcessingEventEmitter.event;

  async register(action: Action): Promise<void> {
    this.add(action);
    if (!this.isBusy) {
      await this.process();
    }
  }

  private add(action: Action): void {
    this.queue.push(action);
  }

  private async process() {
    this.isBusy = true;

    while (this.queue.length) {
      const action = this.queue.shift();
      action && (await action.fn());
    }

    this.isBusy = false;

    this.onDidProcessingEventEmitter.fire();
  }
}

export default ActionProcessor;
