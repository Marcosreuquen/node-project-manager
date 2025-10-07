import * as vscode from 'vscode';
import * as fs from 'fs';
import Client from './node.controller';
import Terminal from './terminal.controller';
import { ValidationUtils } from '../utils/validation.utils';

export async function runScript(scriptName: string): Promise<void> {
  try {
    const client = new Client();
    const command = client.getScript(scriptName);

    // Check user preference for showing terminal
    const config = vscode.workspace.getConfiguration('nodeProjectManager');
    const showTerminal = config.get<boolean>('showTerminal', true);

    if (showTerminal) {
      // Use the reusable terminal for scripts
      await Terminal.executeInTerminal(command, `Run: ${scriptName}`);
      await ValidationUtils.showSuccessMessage(`Running script: ${scriptName}`);
    } else {
      // Run in background if user prefers
      const result = await Terminal.executeInBackground(command);
      if (result.success) {
        await ValidationUtils.showSuccessMessage(
          `Script ${scriptName} completed successfully`
        );
      } else {
        throw new Error(result.error || 'Script execution failed');
      }
    }
  } catch (error) {
    await ValidationUtils.showErrorMessage(`Failed to run script: ${error}`);
  }
}
export async function extractAndDisplayScripts() {
  // Get the path to the package.json file in the workspace
  const packageJsonPath = vscode.workspace.rootPath + '/package.json';
  const client = new Client();
  // Check if package.json exists
  if (fs.existsSync(packageJsonPath)) {
    // Read the contents of package.json
    fs.readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(
          'Error reading package.json file: ' + err.message
        );
        return;
      }

      try {
        // Parse package.json content to JSON object
        const packageJson = JSON.parse(data);

        // Check if scripts property exists
        if (packageJson.scripts) {
          // Extract script names and commands
          const scripts = Object.entries(packageJson.scripts).map(
            ([name, command]) => ({ name, command })
          );

          // Create a QuickPick to display the scripts
          const quickPick = vscode.window.createQuickPick();
          quickPick.placeholder = 'Select a script to run...';
          quickPick.items = scripts.map(script => ({
            label: script.name,
            detail: `${script.name} - ${script.command}`,
            picked: false,
          }));

          quickPick.onDidAccept(async () => {
            const selection = quickPick.selectedItems;
            if (selection[0]) {
              const selectedScript = selection[0];
              quickPick.hide();
              // Use the runScript function to maintain consistency
              await runScript(selectedScript.label);
            }
          });

          quickPick.onDidHide(() => quickPick.dispose());

          quickPick.show();
        } else {
          vscode.window.showInformationMessage(
            'No scripts found in package.json'
          );
        }
      } catch (parseError) {
        vscode.window.showErrorMessage(
          'Error parsing package.json file: ' + parseError
        );
      }
    });
  } else {
    vscode.window.showErrorMessage('No package.json found in the workspace');
  }
}

export async function addNewScript(scriptName: string, scriptCommand: string) {
  // Get the path to the package.json file in the workspace
  const packageJsonPath = vscode.workspace.rootPath + '/package.json';

  // Check if package.json exists
  if (fs.existsSync(packageJsonPath)) {
    // Read the contents of package.json
    fs.readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(
          'Error reading package.json file: ' + err.message
        );
        return;
      }

      try {
        // Parse package.json content to JSON object
        const packageJson = JSON.parse(data);

        // Check if scripts property exists
        if (packageJson.scripts) {
          // Extract script names and commands
          const scripts = packageJson.scripts;
          scripts[scriptName] = scriptCommand;
          packageJson.scripts = scripts;

          // Write updated package.json content
          fs.writeFile(
            packageJsonPath,
            JSON.stringify(packageJson, null, 2),
            'utf8',
            err => {
              if (err) {
                vscode.window.showErrorMessage(
                  'Error writing package.json file: ' + err.message
                );
                return;
              }
              vscode.window.showInformationMessage(
                'Script added to package.json'
              );
            }
          );
        } else {
          vscode.window.showInformationMessage(
            'No scripts found in package.json'
          );
        }
      } catch (parseError) {
        vscode.window.showErrorMessage(
          'Error parsing package.json file: ' + parseError
        );
      }
    });
  } else {
    vscode.window.showErrorMessage('No package.json found in the workspace');
  }
}
