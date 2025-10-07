import * as vscode from 'vscode';

export class Logger {
  private static outputChannel: vscode.OutputChannel;
  private static isInitialized = false;

  /**
   * Initialize the logger with output channel
   */
  static initialize(): void {
    if (!this.isInitialized) {
      this.outputChannel = vscode.window.createOutputChannel(
        'Node Project Manager'
      );
      this.isInitialized = true;
      this.info('Logger initialized');
    }
  }

  /**
   * Log an info message
   */
  static info(message: string, data?: any): void {
    this.ensureInitialized();
    const timestamp = new Date().toISOString();
    const logMessage = `[INFO] ${timestamp}: ${message}`;

    this.outputChannel.appendLine(logMessage);

    if (data) {
      this.outputChannel.appendLine(`Data: ${JSON.stringify(data, null, 2)}`);
    }

    console.log(logMessage, data);
  }

  /**
   * Log a warning message
   */
  static warn(message: string, data?: any): void {
    this.ensureInitialized();
    const timestamp = new Date().toISOString();
    const logMessage = `[WARN] ${timestamp}: ${message}`;

    this.outputChannel.appendLine(logMessage);

    if (data) {
      this.outputChannel.appendLine(`Data: ${JSON.stringify(data, null, 2)}`);
    }

    console.warn(logMessage, data);
  }

  /**
   * Log an error message
   */
  static error(message: string, error?: Error | any): void {
    this.ensureInitialized();
    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR] ${timestamp}: ${message}`;

    this.outputChannel.appendLine(logMessage);

    if (error) {
      if (error instanceof Error) {
        this.outputChannel.appendLine(`Error: ${error.message}`);
        if (error.stack) {
          this.outputChannel.appendLine(`Stack: ${error.stack}`);
        }
      } else {
        this.outputChannel.appendLine(
          `Error: ${JSON.stringify(error, null, 2)}`
        );
      }
    }

    console.error(logMessage, error);
  }

  /**
   * Log a debug message (only in development)
   */
  static debug(message: string, data?: any): void {
    this.ensureInitialized();
    const timestamp = new Date().toISOString();
    const logMessage = `[DEBUG] ${timestamp}: ${message}`;

    this.outputChannel.appendLine(logMessage);

    if (data) {
      this.outputChannel.appendLine(`Data: ${JSON.stringify(data, null, 2)}`);
    }

    console.debug(logMessage, data);
  }

  /**
   * Show the output channel
   */
  static show(): void {
    this.ensureInitialized();
    this.outputChannel.show();
  }

  /**
   * Clear the output channel
   */
  static clear(): void {
    this.ensureInitialized();
    this.outputChannel.clear();
  }

  /**
   * Log command execution
   */
  static logCommand(command: string, args?: any): void {
    this.info(`Executing command: ${command}`, args);
  }

  /**
   * Log command result
   */
  static logCommandResult(
    command: string,
    success: boolean,
    result?: any
  ): void {
    if (success) {
      this.info(`Command completed successfully: ${command}`, result);
    } else {
      this.error(`Command failed: ${command}`, result);
    }
  }

  /**
   * Log package manager detection
   */
  static logPackageManagerDetection(
    detected: string,
    lockFiles: string[]
  ): void {
    this.info(`Package manager detected: ${detected}`, { lockFiles });
  }

  /**
   * Log validation result
   */
  static logValidation(
    input: string,
    type: string,
    isValid: boolean,
    error?: string
  ): void {
    const message = `Validation ${isValid ? 'passed' : 'failed'} for ${type}: ${input}`;
    if (isValid) {
      this.debug(message);
    } else {
      this.warn(message, { error });
    }
  }

  private static ensureInitialized(): void {
    if (!this.isInitialized) {
      this.initialize();
    }
  }

  /**
   * Dispose resources
   */
  static dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose();
    }
    this.isInitialized = false;
  }
}
