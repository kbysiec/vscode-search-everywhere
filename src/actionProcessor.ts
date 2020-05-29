import * as vscode from "vscode";
import Action from "./interface/action";
import ActionType from "./enum/actionType";
import Utils from "./utils";

class ActionProcessor {
  private actionId: number = 0;
  private isBusy = false;
  private queue: Action[] = [];
  private previousAction: Action | undefined = undefined;

  private onDidProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  private onWillProcessingEventEmitter: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter();
  private onWillExecuteActionEventEmitter: vscode.EventEmitter<
    Action
  > = new vscode.EventEmitter();
  readonly onDidProcessing: vscode.Event<void> = this
    .onDidProcessingEventEmitter.event;
  readonly onWillProcessing: vscode.Event<void> = this
    .onWillProcessingEventEmitter.event;
  readonly onWillExecuteAction: vscode.Event<Action> = this
    .onWillExecuteActionEventEmitter.event;

  constructor(private utils: Utils) {}

  async register(action: Action): Promise<void> {
    this.add(action);
    // this.reduce(); // here is slower - executed every time
    if (!this.isBusy) {
      await this.process();
    }
  }

  private add(action: Action): void {
    action.id = this.actionId++;
    this.queue.push(action);
  }

  private async process() {
    this.onWillProcessingEventEmitter.fire();
    this.isBusy = true;

    while (this.queue.length) {
      this.reduce();
      const action = this.queue.shift();
      this.setPreviousAction(action);
      this.onWillExecuteActionEventEmitter.fire(action);
      action && (await action.fn());
    }

    this.isBusy = false;
    this.setPreviousAction(undefined);

    this.onDidProcessingEventEmitter.fire();
  }

  private reduce(): void {
    this.reduceRebuilds();
    this.reduceUpdates();
    this.reduceRemoves();
  }

  private reduceRebuilds(): void {
    this.reduceByActionType(ActionType.Rebuild);
  }

  private reduceUpdates(): void {
    this.reduceByActionType(ActionType.Update);
  }

  private reduceRemoves(): void {
    this.reduceByActionType(ActionType.Remove);
  }

  private reduceByActionType(actionType: ActionType) {
    const actions = this.getActionsFromQueueByType(actionType);

    if (actionType === ActionType.Rebuild) {
      if (
        this.previousAction &&
        this.previousAction.type === ActionType.Rebuild
      ) {
        this.queue = [];
      } else if (actions.length > 0) {
        const last = this.utils.getLastFromArray(
          this.queue,
          (action: Action) => action.type === actionType
        );
        this.queue = [last];
      }
    } else {
      const groupedActions = this.utils.groupBy(
        actions,
        (action: Action) => action.uri!.fsPath
      );

      groupedActions.forEach(this.reduceByFsPath.bind(this, actionType));
    }
  }

  private reduceByFsPath(
    actionType: ActionType,
    actionsByFsPath: Action[],
    fsPath: string
  ) {
    if (actionsByFsPath.length > 0) {
      const last: Action = this.utils.getLastFromArray(
        this.queue,
        (action: Action) =>
          action.type === actionType && action.uri!.fsPath === fsPath
      );

      this.queue = this.queue.filter(
        (action: Action) =>
          action.type !== actionType ||
          action.uri!.fsPath !== fsPath ||
          action.id === last.id
      );
    }
  }

  private getActionsFromQueueByType(actionType: ActionType): Action[] {
    return this.queue.filter((action: Action) => action.type === actionType);
  }

  private setPreviousAction(action: Action | undefined): void {
    this.previousAction = action;
  }
}

export default ActionProcessor;
