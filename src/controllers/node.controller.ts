import * as vscode from 'vscode';
import * as fs from 'fs';
import Terminal from './terminal.controller';
import {
  PackageManagerDetector,
  PackageManagerName,
} from '../utils/package-manager-detector.utils';
import { ValidationUtils } from '../utils/validation.utils';

declare type InstalledPackages = { name: string; version: any; isDev: boolean };
export default class Client {
  name: PackageManagerName;

  constructor(name?: PackageManagerName) {
    this.name = name || PackageManagerDetector.detect();
  }

  getPackages(): InstalledPackages[] {
    let result: InstalledPackages[] = [];
    const packageJsonPath = vscode.workspace.rootPath + '/package.json';
    if (fs.existsSync(packageJsonPath)) {
      fs.readFile(packageJsonPath, 'utf8', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(
            'Error reading package.json file: ' + err.message
          );
          return;
        }
        try {
          const packageJson = JSON.parse(data);
          const dependencies = packageJson.dependencies
            ? Object.entries(packageJson.dependencies).map(
                ([name, version]) => ({ name, version, isDev: false })
              )
            : [];
          const devDependencies = packageJson.devDependencies
            ? Object.entries(packageJson.devDependencies).map(
                ([name, version]) => ({ name, version, isDev: true })
              )
            : [];
          result = [...dependencies, ...devDependencies];
        } catch (parseError) {
          vscode.window.showErrorMessage(
            'Error parsing package.json file: ' + parseError
          );
        }
      });
    } else {
      vscode.window.showErrorMessage('No package.json found in the workspace');
    }
    return result;
  }

  async add(packageNames: string): Promise<void> {
    try {
      const command = PackageManagerDetector.getInstallCommand(
        packageNames,
        false
      );

      // Show progress notification
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Installing ${packageNames}...`,
          cancellable: false,
        },
        async progress => {
          progress.report({
            increment: 0,
            message: 'Starting installation...',
          });

          const result = await Terminal.executeInBackground(command);

          if (result.success) {
            progress.report({ increment: 100, message: 'Complete!' });
            await ValidationUtils.showSuccessMessage(
              `Successfully installed ${packageNames}`
            );
          } else {
            throw new Error(result.error || 'Installation failed');
          }
        }
      );
    } catch (error) {
      await ValidationUtils.showErrorMessage(
        `Failed to install package: ${error}`
      );
      throw error;
    }
  }
  async update(packageNames: string, version?: string): Promise<void> {
    try {
      const command = PackageManagerDetector.getUpdateCommand(
        packageNames,
        version
      );
      const versionText = version
        ? `to version ${version}`
        : 'to latest version';

      // Show progress notification
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Updating ${packageNames} ${versionText}...`,
          cancellable: false,
        },
        async progress => {
          progress.report({ increment: 0, message: 'Starting update...' });

          const result = await Terminal.executeInBackground(command);

          if (result.success) {
            progress.report({ increment: 100, message: 'Complete!' });
            await ValidationUtils.showSuccessMessage(
              `Successfully updated ${packageNames} ${versionText}`
            );
          } else {
            throw new Error(result.error || 'Update failed');
          }
        }
      );
    } catch (error) {
      await ValidationUtils.showErrorMessage(
        `Failed to update package: ${error}`
      );
      throw error;
    }
  }
  async remove(packageNames: string): Promise<void> {
    try {
      const command = PackageManagerDetector.getRemoveCommand(packageNames);

      // Show progress notification
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Removing ${packageNames}...`,
          cancellable: false,
        },
        async progress => {
          progress.report({ increment: 0, message: 'Starting removal...' });

          const result = await Terminal.executeInBackground(command);

          if (result.success) {
            progress.report({ increment: 100, message: 'Complete!' });
            await ValidationUtils.showSuccessMessage(
              `Successfully removed ${packageNames}`
            );
          } else {
            throw new Error(result.error || 'Removal failed');
          }
        }
      );
    } catch (error) {
      await ValidationUtils.showErrorMessage(
        `Failed to remove package: ${error}`
      );
      throw error;
    }
  }
  async install(): Promise<void> {
    try {
      const command = PackageManagerDetector.getInstallCommand();

      // Show progress notification
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Installing dependencies...',
          cancellable: false,
        },
        async progress => {
          progress.report({
            increment: 0,
            message: 'Starting installation...',
          });

          const result = await Terminal.executeInBackground(command);

          if (result.success) {
            progress.report({ increment: 100, message: 'Complete!' });
            await ValidationUtils.showSuccessMessage(
              'Successfully installed all dependencies'
            );
          } else {
            throw new Error(result.error || 'Installation failed');
          }
        }
      );
    } catch (error) {
      await ValidationUtils.showErrorMessage(
        `Failed to install packages: ${error}`
      );
      throw error;
    }
  }

  async addDevDependencies(packageNames: string): Promise<void> {
    try {
      const command = PackageManagerDetector.getInstallCommand(
        packageNames,
        true
      );

      // Show progress notification
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Installing dev dependency ${packageNames}...`,
          cancellable: false,
        },
        async progress => {
          progress.report({
            increment: 0,
            message: 'Starting installation...',
          });

          const result = await Terminal.executeInBackground(command);

          if (result.success) {
            progress.report({ increment: 100, message: 'Complete!' });
            await ValidationUtils.showSuccessMessage(
              `Successfully installed dev dependency ${packageNames}`
            );
          } else {
            throw new Error(result.error || 'Installation failed');
          }
        }
      );
    } catch (error) {
      await ValidationUtils.showErrorMessage(
        `Failed to add dev dependency: ${error}`
      );
      throw error;
    }
  }

  getScript(scriptName: string): string {
    return PackageManagerDetector.getRunCommand(scriptName);
  }

  async audit(): Promise<void> {
    try {
      const command = PackageManagerDetector.getAuditCommand();

      // Show progress notification
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Auditing dependencies...',
          cancellable: false,
        },
        async progress => {
          progress.report({ increment: 0, message: 'Starting audit...' });

          const result = await Terminal.executeInBackground(command);

          if (result.success) {
            progress.report({ increment: 100, message: 'Complete!' });
            // For audit, show the results in an information dialog
            if (result.output) {
              const lines = result.output.split('\n');
              const summary = lines.slice(-5).join('\n'); // Show last 5 lines as summary
              await vscode.window.showInformationMessage(
                `Audit completed:\n${summary}`,
                { modal: false }
              );
            } else {
              await ValidationUtils.showSuccessMessage(
                'Audit completed successfully'
              );
            }
          } else {
            // For audit, errors might still contain useful information
            if (result.error) {
              await vscode.window.showWarningMessage(
                `Audit completed with warnings:\n${result.error.substring(0, 200)}...`,
                { modal: false }
              );
            } else {
              throw new Error('Audit failed');
            }
          }
        }
      );
    } catch (error) {
      await ValidationUtils.showErrorMessage(
        `Failed to audit packages: ${error}`
      );
      throw error;
    }
  }
}
