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
    await this.processIfIsNotBusy();
  }

  private add(action: Action): void {
    this.assignId(action);
    this.addToQueue(action);
  }

  private assignId(action: Action): void {
    action.id = this.actionId++;
  }

  private addToQueue(action: Action): void {
    this.queue.push(action);
  }

  private async processIfIsNotBusy(): Promise<void> {
    !this.isBusy && (await this.process());
  }

  private async process() {
    this.onWillProcessingEventEmitter.fire();
    this.setBusy(true);

    await this.processEachAction();

    this.setBusy(false);
    this.setPreviousAction(undefined);
    this.onDidProcessingEventEmitter.fire();
  }

  private async processEachAction() {
    while (this.queue.length) {
      this.reduce();
      const action = this.getNextActionFromQueue();
      this.setPreviousAction(action);
      this.onWillExecuteActionEventEmitter.fire(action);
      action && (await action.fn());
    }
  }

  private setBusy(value: boolean): void {
    this.isBusy = value;
  }

  private getNextActionFromQueue(): Action | undefined {
    return this.queue.shift();
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
    actionType === ActionType.Rebuild
      ? this.reduceRebuildAction(actionType, actions)
      : this.reduceUpdateRemoveAction(actionType, actions);
  }

  private reduceRebuildAction(actionType: ActionType, actions: Action[]) {
    if (this.isPreviousActionRebuildType()) {
      this.queue = [];
    } else if (this.isActionArrayNotEmpty(actions)) {
      const last = this.utils.getLastFromArray(
        this.queue,
        (action: Action) => action.type === actionType
      );
      this.queue = [last];
    }
  }

  private isPreviousActionRebuildType(): boolean {
    return (
      !!this.previousAction && this.previousAction.type === ActionType.Rebuild
    );
  }

  private isActionArrayNotEmpty(actions: Action[]): boolean {
    return actions.length > 0;
  }

  private reduceUpdateRemoveAction(actionType: ActionType, actions: Action[]) {
    const groupedActions = this.utils.groupBy(
      actions,
      (action: Action) => action.uri!.fsPath
    );

    groupedActions.forEach(this.reduceByFsPath.bind(this, actionType));
  }

  private reduceByFsPath(
    actionType: ActionType,
    actionsByFsPath: Action[],
    fsPath: string
  ) {
    const lastAction: Action = this.utils.getLastFromArray(
      this.queue,
      (action: Action) =>
        action.type === actionType && action.uri!.fsPath === fsPath
    );

    this.queue = this.queue.filter(
      this.shouldActionRemainInQueue.bind(this, actionType, fsPath, lastAction)
    );
  }

  private shouldActionRemainInQueue(
    actionType: ActionType,
    fsPath: string,
    lastAction: Action,
    action: Action
  ) {
    return (
      action.type !== actionType ||
      action.uri!.fsPath !== fsPath ||
      action.id === lastAction.id
    );
  }

  private getActionsFromQueueByType(actionType: ActionType): Action[] {
    return this.queue.filter((action: Action) => action.type === actionType);
  }

  private setPreviousAction(action: Action | undefined): void {
    this.previousAction = action;
  }
}

export default ActionProcessor;
