import * as vscode from "vscode";

export default class Terminal {
  terminal = vscode.window.createTerminal();
  async send({
    command,
    show = false,
    message,
  }: {
    command: string;
    show?: boolean;
    message?: string;
  }): Promise<Terminal> {
    if (show) {
      this.terminal.show();
    }
    return new Promise<Terminal>((resolve, reject) => {
      try {
        this.terminal.sendText(command);
        if (message) {
          vscode.window.showInformationMessage(message);
        }
        resolve(this);
      } catch (error) {
        vscode.window.showErrorMessage("Ups, something went wrong");
        reject(error);
      }
    });
  }

  close() {
    this.terminal.sendText("exit");
  }
}
