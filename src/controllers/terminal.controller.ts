import * as vscode from 'vscode';
import * as cp from 'child_process';
import { Logger } from '../utils/logger.utils';

export default class Terminal {
  private static scriptTerminal: vscode.Terminal | undefined;

  // Get or create a reusable terminal for scripts
  static getScriptTerminal(): vscode.Terminal {
    if (!Terminal.scriptTerminal || Terminal.scriptTerminal.exitStatus) {
      Terminal.scriptTerminal = vscode.window.createTerminal(
        'Node Project Manager'
      );
    }
    return Terminal.scriptTerminal;
  }

  // Execute command in terminal (visible) - for scripts only
  static async executeInTerminal(
    command: string,
    name?: string
  ): Promise<void> {
    const terminal = Terminal.getScriptTerminal();
    terminal.show();
    terminal.sendText(command);
    Logger.info(`Executing command in terminal: ${command}`);
  }

  // Execute command silently in background - for dependency management
  static async executeInBackground(
    command: string
  ): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise(resolve => {
      Logger.info(`Executing background command: ${command}`);

      const process = cp.exec(command, {
        cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
      });

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', data => {
        output += data.toString();
      });

      process.stderr?.on('data', data => {
        errorOutput += data.toString();
      });

      process.on('close', code => {
        const success = code === 0;
        Logger.info(`Background command completed with code ${code}`);

        if (!success) {
          Logger.error(`Command failed: ${errorOutput}`);
        }

        resolve({
          success,
          output: output.trim(),
          error: errorOutput.trim(),
        });
      });

      process.on('error', error => {
        Logger.error(`Command execution error: ${error.message}`);
        resolve({
          success: false,
          output: '',
          error: error.message,
        });
      });
    });
  }

  // Legacy method for backwards compatibility
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
      await Terminal.executeInTerminal(command);
    } else {
      await Terminal.executeInBackground(command);
    }

    if (message) {
      vscode.window.showInformationMessage(message);
    }

    return this;
  }

  close() {
    if (Terminal.scriptTerminal) {
      Terminal.scriptTerminal.dispose();
      Terminal.scriptTerminal = undefined;
    }
  }
}
