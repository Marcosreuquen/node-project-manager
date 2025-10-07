import * as vscode from 'vscode';
import * as fs from 'fs';
import { PackageManagerDetector } from './package-manager-detector.utils';

export interface QuickPickAction {
  label: string;
  description?: string;
  detail?: string;
  value: string;
  iconPath?: vscode.ThemeIcon;
}

export class QuickPickManager {
  /**
   * Shows the main dependency management menu
   */
  static async showDependencyActions(): Promise<string | undefined> {
    const packageManager = PackageManagerDetector.detect();

    const items: QuickPickAction[] = [
      {
        label: '$(package) Install All Dependencies',
        description: `Using ${packageManager}`,
        detail: 'Install all dependencies from package.json',
        value: 'install',
      },
      {
        label: '$(plus) Add Production Dependency',
        description: 'Add new package',
        detail: 'Install and save to dependencies',
        value: 'add',
      },
      {
        label: '$(tools) Add Development Dependency',
        description: 'Add new dev package',
        detail: 'Install and save to devDependencies',
        value: 'addDev',
      },
      {
        label: '$(trash) Remove Dependency',
        description: 'Uninstall package',
        detail: 'Remove from package.json and node_modules',
        value: 'remove',
      },
      {
        label: '$(arrow-up) Update Dependency',
        description: 'Update to latest version',
        detail: 'Update specific package to latest version',
        value: 'update',
      },
      {
        label: '$(shield) Security Audit',
        description: 'Check for vulnerabilities',
        detail: 'Run security audit on dependencies',
        value: 'audit',
      },
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Choose a dependency action',
      matchOnDescription: true,
      matchOnDetail: true,
      title: 'Node Project Manager - Dependencies',
    });

    return selected?.value;
  }

  /**
   * Shows the main scripts management menu
   */
  static async showScriptActions(): Promise<string | undefined> {
    const items: QuickPickAction[] = [
      {
        label: '$(play) Run Script',
        description: 'Execute package.json script',
        detail: 'Choose and run a script from package.json',
        value: 'run',
      },
      {
        label: '$(plus) Add New Script',
        description: 'Create custom script',
        detail: 'Add a new script to package.json',
        value: 'add',
      },
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Choose a script action',
      matchOnDescription: true,
      matchOnDetail: true,
      title: 'Node Project Manager - Scripts',
    });

    return selected?.value;
  }

  /**
   * Shows the main Node Project Manager menu
   */
  static async showMainMenu(): Promise<string | undefined> {
    const packageManager = PackageManagerDetector.detect();

    const items: QuickPickAction[] = [
      {
        label: '$(package) Dependencies',
        description: `Manage with ${packageManager}`,
        detail: 'Install, add, remove, update dependencies',
        value: 'dependencies',
      },
      {
        label: '$(code) Scripts',
        description: 'Package.json scripts',
        detail: 'Run or add scripts to your project',
        value: 'scripts',
      },
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'What would you like to manage?',
      matchOnDescription: true,
      matchOnDetail: true,
      title: 'Node Project Manager',
    });

    return selected?.value;
  }

  /**
   * Shows available dependencies for removal/update
   */
  static async showInstalledDependencies(
    action: 'remove' | 'update'
  ): Promise<string | undefined> {
    const packageJsonPath = PackageManagerDetector.getPackageJsonPath();
    if (!packageJsonPath) {
      return undefined;
    }

    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);

      const items: QuickPickAction[] = [];

      // Add production dependencies
      if (packageJson.dependencies) {
        Object.entries(packageJson.dependencies).forEach(([name, version]) => {
          items.push({
            label: `$(package) ${name}`,
            description: `v${version}`,
            detail: 'Production dependency',
            value: name,
          });
        });
      }

      // Add dev dependencies
      if (packageJson.devDependencies) {
        Object.entries(packageJson.devDependencies).forEach(
          ([name, version]) => {
            items.push({
              label: `$(tools) ${name}`,
              description: `v${version}`,
              detail: 'Development dependency',
              value: name,
            });
          }
        );
      }

      if (items.length === 0) {
        vscode.window.showInformationMessage(
          'No dependencies found in package.json'
        );
        return undefined;
      }

      // Sort items alphabetically
      items.sort((a, b) => a.value.localeCompare(b.value));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: `Select dependency to ${action}`,
        matchOnDescription: true,
        matchOnDetail: true,
        title: `Node Project Manager - ${action.charAt(0).toUpperCase() + action.slice(1)} Dependency`,
      });

      return selected?.value;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to read package.json: ${error}`);
      return undefined;
    }
  }

  /**
   * Shows available scripts from package.json
   */
  static async showAvailableScripts(): Promise<string | undefined> {
    const packageJsonPath = PackageManagerDetector.getPackageJsonPath();
    if (!packageJsonPath) {
      return undefined;
    }

    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);

      if (
        !packageJson.scripts ||
        Object.keys(packageJson.scripts).length === 0
      ) {
        vscode.window.showInformationMessage(
          'No scripts found in package.json'
        );
        return undefined;
      }

      const items: QuickPickAction[] = Object.entries(packageJson.scripts).map(
        ([name, command]) => ({
          label: `$(play) ${name}`,
          description: command as string,
          detail: `Run: ${PackageManagerDetector.getRunCommand(name)}`,
          value: name,
        })
      );

      // Sort items alphabetically
      items.sort((a, b) => a.value.localeCompare(b.value));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select script to run',
        matchOnDescription: true,
        matchOnDetail: true,
        title: 'Node Project Manager - Run Script',
      });

      return selected?.value;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to read package.json: ${error}`);
      return undefined;
    }
  }

  /**
   * Shows a confirmation dialog for destructive actions
   */
  static async showConfirmation(
    message: string,
    action: string,
    detail?: string
  ): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('nodeProjectManager');
    const confirmActions = config.get('confirmActions', true);

    if (!confirmActions) {
      return true;
    }

    const result = await vscode.window.showWarningMessage(
      message,
      {
        modal: true,
        detail: detail || `This action cannot be undone.`,
      },
      action,
      'Cancel'
    );

    return result === action;
  }

  /**
   * Shows progress for long-running operations
   */
  static async withProgress<T>(
    title: string,
    task: (
      progress: vscode.Progress<{ message?: string; increment?: number }>
    ) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: false,
      },
      task
    );
  }
}
