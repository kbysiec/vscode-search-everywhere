import * as vscode from "vscode";
import ActionType from "../enum/actionType";

interface Action {
  type: ActionType;
  fn: Function;
  comment?: string;
}

export default Action;
