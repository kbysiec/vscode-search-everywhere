import * as vscode from "vscode";
import ActionType from "../enum/actionType";

interface Action {
  type: ActionType;
  fn: Function;
  comment?: string;
  uri?: vscode.Uri;
  id?: number;
}

export default Action;
