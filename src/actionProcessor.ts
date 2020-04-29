import Action from "./interface/action";

class ActionProcessor {
  private isBusy = false;
  private queue: Action[] = [];

  constructor(private onDidProcessCallback: Function) {}

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

    await this.onDidProcessCallback();
  }
}

export default ActionProcessor;
