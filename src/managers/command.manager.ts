import * as vscode from 'vscode';
import {
  extractAndDisplayScripts,
  addNewScript,
  runScript,
} from '../controllers/scripts.controller';
import Client from '../controllers/node.controller';
import { ValidationUtils } from '../utils/validation.utils';
import { PackageManagerDetector } from '../utils/package-manager-detector.utils';
import { QuickPickManager } from '../utils/quick-pick-manager.utils';
import { Logger } from '../utils/logger.utils';

export class CommandManager {
  private client: Client;

  constructor() {
    this.client = new Client();
    Logger.info('CommandManager initialized');
  }

  /**
   * Register all commands with VS Code
   */
  registerCommands(context: vscode.ExtensionContext): void {
    Logger.info('Registering commands');

    const commands = [
      { command: 'extension.nodeProjectManager', handler: this.openMainMenu },
      { command: 'extension.useScripts', handler: this.useScripts },
      {
        command: 'extension.installDependencies',
        handler: this.installDependencies,
      },
      { command: 'extension.addDependency', handler: this.addDependency },
      { command: 'extension.removeDependency', handler: this.removeDependency },
      { command: 'extension.updateDependency', handler: this.updateDependency },
      {
        command: 'extension.auditDependencies',
        handler: this.auditDependencies,
      },
      { command: 'extension.addScript', handler: this.addScript },
      { command: 'extension.addDevDependency', handler: this.addDevDependency },
    ];

    commands.forEach(({ command, handler }) => {
      const disposable = vscode.commands.registerCommand(
        command,
        handler.bind(this)
      );
      context.subscriptions.push(disposable);
      Logger.debug(`Registered command: ${command}`);
    });

    Logger.info(`Registered ${commands.length} commands successfully`);
  }

  /**
   * Open the main Node Project Manager menu
   */
  private async openMainMenu(): Promise<void> {
    Logger.logCommand('openMainMenu');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('Command failed: No package.json found');
        return;
      }

      const mainAction = await QuickPickManager.showMainMenu();
      if (!mainAction) {
        Logger.debug('Main menu cancelled by user');
        return;
      }

      Logger.info(`Main menu action selected: ${mainAction}`);

      switch (mainAction) {
        case 'dependencies':
          await this.handleDependencyManagement();
          break;
        case 'scripts':
          await this.handleScriptManagement();
          break;
      }

      Logger.logCommandResult('openMainMenu', true);
    } catch (error) {
      Logger.error('Failed to open main menu', error);
      await ValidationUtils.showErrorMessage(
        `Failed to open main menu: ${error}`
      );
      Logger.logCommandResult('openMainMenu', false, error);
    }
  }

  /**
   * Handle dependency management submenu
   */
  private async handleDependencyManagement(): Promise<void> {
    Logger.logCommand('handleDependencyManagement');

    const action = await QuickPickManager.showDependencyActions();
    if (!action) {
      Logger.debug('Dependency management cancelled by user');
      return;
    }

    Logger.info(`Dependency action selected: ${action}`);

    try {
      switch (action) {
        case 'install':
          await this.installDependencies();
          break;
        case 'add':
          await this.addDependency();
          break;
        case 'addDev':
          await this.addDevDependency();
          break;
        case 'remove':
          await this.removeDependency();
          break;
        case 'update':
          await this.updateDependency();
          break;
        case 'audit':
          await this.auditDependencies();
          break;
      }
    } catch (error) {
      Logger.error(`Dependency management action failed: ${action}`, error);
      throw error;
    }
  }

  /**
   * Handle script management submenu
   */
  private async handleScriptManagement(): Promise<void> {
    Logger.logCommand('handleScriptManagement');

    const action = await QuickPickManager.showScriptActions();
    if (!action) {
      Logger.debug('Script management cancelled by user');
      return;
    }

    Logger.info(`Script action selected: ${action}`);

    try {
      switch (action) {
        case 'run': {
          const scriptToRun = await QuickPickManager.showAvailableScripts();
          if (scriptToRun) {
            Logger.info(`Running script: ${scriptToRun}`);
            await runScript(scriptToRun);
          }
          break;
        }
        case 'add':
          await this.addScript();
          break;
      }
    } catch (error) {
      Logger.error(`Script management action failed: ${action}`, error);
      throw error;
    }
  }

  /**
   * Use project scripts (legacy command)
   */
  private async useScripts(): Promise<void> {
    Logger.logCommand('useScripts');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('useScripts failed: No package.json found');
        return;
      }

      extractAndDisplayScripts();
      Logger.logCommandResult('useScripts', true);
    } catch (error) {
      Logger.error('Failed to load scripts', error);
      await ValidationUtils.showErrorMessage(
        `Failed to load scripts: ${error}`
      );
      Logger.logCommandResult('useScripts', false, error);
    }
  }

  /**
   * Install all dependencies
   */
  private async installDependencies(): Promise<void> {
    Logger.logCommand('installDependencies');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('installDependencies failed: No package.json found');
        return;
      }

      await QuickPickManager.withProgress(
        'Installing dependencies...',
        async progress => {
          progress.report({ message: 'Running install command...' });
          await this.client.install();
        }
      );

      await ValidationUtils.showSuccessMessage(
        'Installing all dependencies. Check terminal for results.'
      );
      Logger.logCommandResult('installDependencies', true);
    } catch (error) {
      Logger.error('Failed to install dependencies', error);
      await ValidationUtils.showErrorMessage(
        `Failed to install dependencies: ${error}`
      );
      Logger.logCommandResult('installDependencies', false, error);
    }
  }

  /**
   * Add a production dependency
   */
  private async addDependency(): Promise<void> {
    Logger.logCommand('addDependency');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('addDependency failed: No package.json found');
        return;
      }

      const userInput = await ValidationUtils.getValidatedInput(
        'Enter the dependency to add',
        ValidationUtils.validatePackageNameWithVersionInput,
        'e.g., lodash, lodash@4.0.0, @types/node@latest'
      );

      if (userInput) {
        Logger.info(`Adding dependency: ${userInput}`);
        await QuickPickManager.withProgress(
          `Adding ${userInput}...`,
          async progress => {
            progress.report({ message: 'Installing package...' });
            await this.client.add(userInput);
          }
        );

        await ValidationUtils.showSuccessMessage(
          `Installing dependency: ${userInput}. Check terminal for results.`
        );
        Logger.logCommandResult('addDependency', true, { package: userInput });
      } else {
        Logger.debug('addDependency cancelled by user');
      }
    } catch (error) {
      Logger.error('Failed to add dependency', error);
      await ValidationUtils.showErrorMessage(
        `Failed to add dependency: ${error}`
      );
      Logger.logCommandResult('addDependency', false, error);
    }
  }

  /**
   * Add a development dependency
   */
  private async addDevDependency(): Promise<void> {
    Logger.logCommand('addDevDependency');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('addDevDependency failed: No package.json found');
        return;
      }

      const userInput = await ValidationUtils.getValidatedInput(
        'Enter the dev dependency to add',
        ValidationUtils.validatePackageNameWithVersionInput,
        'e.g., @types/node, jest@29.0.0, eslint@^8.0.0'
      );

      if (userInput) {
        Logger.info(`Adding dev dependency: ${userInput}`);
        await QuickPickManager.withProgress(
          `Adding ${userInput}...`,
          async progress => {
            progress.report({ message: 'Installing dev package...' });
            await this.client.addDevDependencies(userInput);
          }
        );

        await ValidationUtils.showSuccessMessage(
          `Installing dev dependency: ${userInput}. Check terminal for results.`
        );
        Logger.logCommandResult('addDevDependency', true, {
          package: userInput,
        });
      } else {
        Logger.debug('addDevDependency cancelled by user');
      }
    } catch (error) {
      Logger.error('Failed to add dev dependency', error);
      await ValidationUtils.showErrorMessage(
        `Failed to add dev dependency: ${error}`
      );
      Logger.logCommandResult('addDevDependency', false, error);
    }
  }

  /**
   * Remove a dependency
   */
  private async removeDependency(): Promise<void> {
    Logger.logCommand('removeDependency');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('removeDependency failed: No package.json found');
        return;
      }

      const packageToRemove =
        await QuickPickManager.showInstalledDependencies('remove');
      if (packageToRemove) {
        const confirmed = await QuickPickManager.showConfirmation(
          `Remove dependency "${packageToRemove}"?`,
          'Remove',
          'This will uninstall the package and remove it from package.json'
        );

        if (confirmed) {
          Logger.info(`Removing dependency: ${packageToRemove}`);
          await QuickPickManager.withProgress(
            `Removing ${packageToRemove}...`,
            async progress => {
              progress.report({ message: 'Uninstalling package...' });
              await this.client.remove(packageToRemove);
            }
          );

          await ValidationUtils.showSuccessMessage(
            `Removing dependency: ${packageToRemove}. Check terminal for results.`
          );
          Logger.logCommandResult('removeDependency', true, {
            package: packageToRemove,
          });
        } else {
          Logger.debug('removeDependency cancelled by user confirmation');
        }
      } else {
        Logger.debug('removeDependency cancelled - no package selected');
      }
    } catch (error) {
      Logger.error('Failed to remove dependency', error);
      await ValidationUtils.showErrorMessage(
        `Failed to remove dependency: ${error}`
      );
      Logger.logCommandResult('removeDependency', false, error);
    }
  }

  /**
   * Update a dependency
   */
  private async updateDependency(): Promise<void> {
    Logger.logCommand('updateDependency');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('updateDependency failed: No package.json found');
        return;
      }

      const packageToUpdate =
        await QuickPickManager.showInstalledDependencies('update');
      if (packageToUpdate) {
        // Ask user if they want to specify a version
        const versionChoice = await vscode.window.showQuickPick(
          [
            {
              label: '$(arrow-up) Update to latest version',
              description: 'Update to the latest available version',
              detail: 'Recommended for most cases',
              version: undefined,
            },
            {
              label: '$(edit) Specify version',
              description: 'Install a specific version',
              detail: 'Choose exact version to install',
              version: 'custom',
            },
          ],
          {
            placeHolder: `How would you like to update ${packageToUpdate}?`,
            matchOnDescription: true,
            matchOnDetail: true,
          }
        );

        if (!versionChoice) {
          Logger.debug(
            'updateDependency cancelled - no version choice selected'
          );
          return;
        }

        let targetVersion: string | undefined;

        if (versionChoice.version === 'custom') {
          // Ask for specific version
          targetVersion = await vscode.window.showInputBox({
            prompt: `Enter version for ${packageToUpdate}`,
            placeHolder: 'e.g., 1.2.3, ^2.0.0, ~1.5.0, latest',
            validateInput: (value: string) => {
              if (!value.trim()) {
                return 'Version cannot be empty';
              }
              // Basic version format validation
              const versionRegex =
                /^(\^|~|>=|<=|>|<)?[\d\w.-]+(\s*\|\|\s*[\d\w.-]+)*$|^latest$|^next$/;
              if (!versionRegex.test(value.trim())) {
                return 'Invalid version format. Examples: 1.2.3, ^2.0.0, ~1.5.0, latest';
              }
              return null;
            },
          });

          if (!targetVersion) {
            Logger.debug('updateDependency cancelled - no version specified');
            return;
          }
        }

        Logger.info(
          `Updating dependency: ${packageToUpdate}${targetVersion ? ` to version ${targetVersion}` : ' to latest'}`
        );

        await this.client.update(packageToUpdate, targetVersion);

        Logger.logCommandResult('updateDependency', true, {
          package: packageToUpdate,
          version: targetVersion || 'latest',
        });
      } else {
        Logger.debug('updateDependency cancelled - no package selected');
      }
    } catch (error) {
      Logger.error('Failed to update dependency', error);
      await ValidationUtils.showErrorMessage(
        `Failed to update dependency: ${error}`
      );
      Logger.logCommandResult('updateDependency', false, error);
    }
  }

  /**
   * Run security audit
   */
  private async auditDependencies(): Promise<void> {
    Logger.logCommand('auditDependencies');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('auditDependencies failed: No package.json found');
        return;
      }

      await QuickPickManager.withProgress(
        'Running security audit...',
        async progress => {
          progress.report({ message: 'Checking for vulnerabilities...' });
          await this.client.audit();
        }
      );

      await ValidationUtils.showSuccessMessage(
        'Running security audit. Check terminal for results.'
      );
      Logger.logCommandResult('auditDependencies', true);
    } catch (error) {
      Logger.error('Failed to audit dependencies', error);
      await ValidationUtils.showErrorMessage(
        `Failed to audit dependencies: ${error}`
      );
      Logger.logCommandResult('auditDependencies', false, error);
    }
  }

  /**
   * Add a new script
   */
  private async addScript(): Promise<void> {
    Logger.logCommand('addScript');

    try {
      if (!PackageManagerDetector.hasPackageJson()) {
        await ValidationUtils.showErrorMessage(
          'No package.json found in workspace'
        );
        Logger.warn('addScript failed: No package.json found');
        return;
      }

      const scriptName = await ValidationUtils.getValidatedInput(
        'Enter the script name to add',
        ValidationUtils.validateScriptNameInput,
        'e.g., build, test, start'
      );

      if (scriptName) {
        const scriptCommand = await ValidationUtils.getValidatedInput(
          'Enter the script command to add',
          ValidationUtils.validateScriptCommandInput,
          'e.g., tsc, jest, node server.js'
        );

        if (scriptCommand) {
          Logger.info(`Adding script: ${scriptName} -> ${scriptCommand}`);
          addNewScript(scriptName, scriptCommand);
          await ValidationUtils.showSuccessMessage(
            `Added script: ${scriptName}`
          );
          Logger.logCommandResult('addScript', true, {
            name: scriptName,
            command: scriptCommand,
          });
        } else {
          Logger.debug('addScript cancelled - no command provided');
        }
      } else {
        Logger.debug('addScript cancelled - no name provided');
      }
    } catch (error) {
      Logger.error('Failed to add script', error);
      await ValidationUtils.showErrorMessage(`Failed to add script: ${error}`);
      Logger.logCommandResult('addScript', false, error);
    }
  }
}
