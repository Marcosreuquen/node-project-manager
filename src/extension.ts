import * as vscode from 'vscode';
import {
	extractAndDisplayScripts,
	addNewScript,
	runScript,
} from "./controllers/scripts.controller";
import Client from "./controllers/node.controller";
import { ValidationUtils } from "./utils/validation.utils";
import { PackageManagerDetector } from "./utils/package-manager-detector.utils";
import { QuickPickManager } from "./utils/quick-pick-manager.utils";

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "script-extractor" is now active!'
	);
	const client = new Client();

	// Register the main Node Project Manager command
	const mainMenuDisposable = vscode.commands.registerCommand(
		"extension.nodeProjectManager",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				const mainAction = await QuickPickManager.showMainMenu();
				if (!mainAction) return;

				switch (mainAction) {
					case "dependencies":
						await handleDependencyManagement(client);
						break;
					case "scripts":
						await handleScriptManagement();
						break;
				}
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to open main menu: ${error}`
				);
			}
		}
	);

	// Register the "Manage Project" command
	const useScriptsDisposable = vscode.commands.registerCommand(
		"extension.useScripts",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				// Extract and display the scripts when the command is executed
				extractAndDisplayScripts();
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to load scripts: ${error}`
				);
			}
		}
	);

	const installCommandDisposable = vscode.commands.registerCommand(
		"extension.installDependencies",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				await QuickPickManager.withProgress(
					"Installing dependencies...",
					async (progress) => {
						progress.report({ message: "Running install command..." });
						await client.install();
					}
				);
				await ValidationUtils.showSuccessMessage(
					"Installing all dependencies. Check terminal for results."
				);
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to install dependencies: ${error}`
				);
			}
		}
	);

	const addCommandDisposable = vscode.commands.registerCommand(
		"extension.addDependency",
		async () => {
			try {
				// Check if we have a valid workspace with package.json
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				const userInput = await ValidationUtils.getValidatedInput(
					"Enter the dependency to add",
					ValidationUtils.validatePackageNameInput,
					"e.g., lodash, @types/node"
				);

				if (userInput) {
					await QuickPickManager.withProgress(
						`Adding ${userInput}...`,
						async (progress) => {
							progress.report({ message: "Installing package..." });
							await client.add(userInput);
						}
					);
					await ValidationUtils.showSuccessMessage(
						`Installing dependency: ${userInput}. Check terminal for results.`
					);
				}
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to add dependency: ${error}`
				);
			}
		}
	);

	const removeCommandDisposable = vscode.commands.registerCommand(
		"extension.removeDependency",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				const packageToRemove =
					await QuickPickManager.showInstalledDependencies("remove");
				if (packageToRemove) {
					const confirmed = await QuickPickManager.showConfirmation(
						`Remove dependency "${packageToRemove}"?`,
						"Remove",
						"This will uninstall the package and remove it from package.json"
					);
					if (confirmed) {
						await QuickPickManager.withProgress(
							`Removing ${packageToRemove}...`,
							async (progress) => {
								progress.report({ message: "Uninstalling package..." });
								await client.remove(packageToRemove);
							}
						);
						await ValidationUtils.showSuccessMessage(
							`Removing dependency: ${packageToRemove}. Check terminal for results.`
						);
					}
				} else {
					// Fallback to manual input
					const userInput = await ValidationUtils.getValidatedInput(
						"Enter the dependency to remove",
						ValidationUtils.validatePackageNameInput,
						"e.g., lodash, @types/node"
					);
					if (userInput) {
						await client.remove(userInput);
						await ValidationUtils.showSuccessMessage(
							`Removing dependency: ${userInput}. Check terminal for results.`
						);
					}
				}
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to remove dependency: ${error}`
				);
			}
		}
	);

	const updateCommandDisposable = vscode.commands.registerCommand(
		"extension.updateDependency",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				const packageToUpdate =
					await QuickPickManager.showInstalledDependencies("update");
				if (packageToUpdate) {
					await QuickPickManager.withProgress(
						`Updating ${packageToUpdate}...`,
						async (progress) => {
							progress.report({ message: "Updating package..." });
							await client.update(packageToUpdate);
						}
					);
					await ValidationUtils.showSuccessMessage(
						`Updating dependency: ${packageToUpdate}. Check terminal for results.`
					);
				} else {
					// Fallback to manual input
					const userInput = await ValidationUtils.getValidatedInput(
						"Enter the dependency to update",
						ValidationUtils.validatePackageNameInput,
						"e.g., lodash, @types/node"
					);
					if (userInput) {
						await client.update(userInput);
						await ValidationUtils.showSuccessMessage(
							`Updated dependency: ${userInput}`
						);
					}
				}
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to update dependency: ${error}`
				);
			}
		}
	);

	const auditCommandDisposable = vscode.commands.registerCommand(
		"extension.auditDependencies",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				await client.audit();
				await ValidationUtils.showSuccessMessage("Security audit completed");
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to audit dependencies: ${error}`
				);
			}
		}
	);

	const addScriptDisposable = vscode.commands.registerCommand(
		"extension.addScript",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				const scriptName = await ValidationUtils.getValidatedInput(
					"Enter the script name to add",
					ValidationUtils.validateScriptNameInput,
					"e.g., build, test, start"
				);

				if (scriptName) {
					const scriptCommand = await ValidationUtils.getValidatedInput(
						"Enter the script command to add",
						ValidationUtils.validateScriptCommandInput,
						"e.g., tsc, jest, node server.js"
					);

					if (scriptCommand) {
						addNewScript(scriptName, scriptCommand);
						await ValidationUtils.showSuccessMessage(
							`Added script: ${scriptName}`
						);
					}
				}
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to add script: ${error}`
				);
			}
		}
	);

	const addDevCommandDisposable = vscode.commands.registerCommand(
		"extension.addDevDependency",
		async () => {
			try {
				if (!PackageManagerDetector.hasPackageJson()) {
					await ValidationUtils.showErrorMessage(
						"No package.json found in workspace"
					);
					return;
				}

				const userInput = await ValidationUtils.getValidatedInput(
					"Enter the dev dependency to add",
					ValidationUtils.validatePackageNameInput,
					"e.g., @types/node, jest, eslint"
				);

				if (userInput) {
					await QuickPickManager.withProgress(
						`Adding ${userInput}...`,
						async (progress) => {
							progress.report({ message: "Installing dev package..." });
							await client.addDevDependencies(userInput);
						}
					);
					await ValidationUtils.showSuccessMessage(
						`Installing dev dependency: ${userInput}. Check terminal for results.`
					);
				}
			} catch (error) {
				await ValidationUtils.showErrorMessage(
					`Failed to add dev dependency: ${error}`
				);
			}
		}
	);

	context.subscriptions.push(addDevCommandDisposable);
	context.subscriptions.push(addScriptDisposable);
	context.subscriptions.push(auditCommandDisposable);
	context.subscriptions.push(updateCommandDisposable);
	context.subscriptions.push(removeCommandDisposable);
	context.subscriptions.push(addCommandDisposable);
	context.subscriptions.push(installCommandDisposable);
	context.subscriptions.push(useScriptsDisposable);
	context.subscriptions.push(mainMenuDisposable);
}

// Helper functions for menu handling
async function handleDependencyManagement(client: Client): Promise<void> {
	const action = await QuickPickManager.showDependencyActions();
	if (!action) return;

	switch (action) {
		case "install":
			await QuickPickManager.withProgress(
				"Installing dependencies...",
				async (progress) => {
					progress.report({ message: "Running install command..." });
					await client.install();
				}
			);
			await ValidationUtils.showSuccessMessage(
				"All dependencies installed successfully"
			);
			break;

		case "add": {
			const addPackage = await ValidationUtils.getValidatedInput(
				"Enter the dependency to add",
				ValidationUtils.validatePackageNameInput,
				"e.g., lodash, @types/node"
			);
			if (addPackage) {
				await QuickPickManager.withProgress(
					`Adding ${addPackage}...`,
					async (progress) => {
						progress.report({ message: "Installing package..." });
						await client.add(addPackage);
					}
				);
				await ValidationUtils.showSuccessMessage(
					`Installing dependency: ${addPackage}. Check terminal for results.`
				);
			}
			break;
		}

		case "addDev": {
			const addDevPackage = await ValidationUtils.getValidatedInput(
				"Enter the dev dependency to add",
				ValidationUtils.validatePackageNameInput,
				"e.g., @types/node, jest, eslint"
			);
			if (addDevPackage) {
				await QuickPickManager.withProgress(
					`Adding ${addDevPackage}...`,
					async (progress) => {
						progress.report({ message: "Installing dev package..." });
						await client.addDevDependencies(addDevPackage);
					}
				);
				await ValidationUtils.showSuccessMessage(
					`Installing dev dependency: ${addDevPackage}. Check terminal for results.`
				);
			}
			break;
		}

		case "remove": {
			const packageToRemove = await QuickPickManager.showInstalledDependencies(
				"remove"
			);
			if (packageToRemove) {
				const confirmed = await QuickPickManager.showConfirmation(
					`Remove dependency "${packageToRemove}"?`,
					"Remove",
					"This will uninstall the package and remove it from package.json"
				);
				if (confirmed) {
					await QuickPickManager.withProgress(
						`Removing ${packageToRemove}...`,
						async (progress) => {
							progress.report({ message: "Uninstalling package..." });
							await client.remove(packageToRemove);
						}
					);
					await ValidationUtils.showSuccessMessage(
						`Removing dependency: ${packageToRemove}. Check terminal for results.`
					);
				}
			}
			break;
		}

		case "update": {
			const packageToUpdate = await QuickPickManager.showInstalledDependencies(
				"update"
			);
			if (packageToUpdate) {
				await QuickPickManager.withProgress(
					`Updating ${packageToUpdate}...`,
					async (progress) => {
						progress.report({ message: "Updating package..." });
						await client.update(packageToUpdate);
					}
				);
				await ValidationUtils.showSuccessMessage(
					`Updating dependency: ${packageToUpdate}. Check terminal for results.`
				);
			}
			break;
		}

		case "audit":
			await QuickPickManager.withProgress(
				"Running security audit...",
				async (progress) => {
					progress.report({ message: "Checking for vulnerabilities..." });
					await client.audit();
				}
			);
			await ValidationUtils.showSuccessMessage("Security audit completed");
			break;
	}
}

async function handleScriptManagement(): Promise<void> {
	const action = await QuickPickManager.showScriptActions();
	if (!action) return;

	switch (action) {
		case "run": {
			const scriptToRun = await QuickPickManager.showAvailableScripts();
			if (scriptToRun) {
				await runScript(scriptToRun);
			}
			break;
		}

		case "add": {
			const scriptName = await ValidationUtils.getValidatedInput(
				"Enter the script name to add",
				ValidationUtils.validateScriptNameInput,
				"e.g., build, test, start"
			);

			if (scriptName) {
				const scriptCommand = await ValidationUtils.getValidatedInput(
					"Enter the script command to add",
					ValidationUtils.validateScriptCommandInput,
					"e.g., tsc, jest, node server.js"
				);

				if (scriptCommand) {
					addNewScript(scriptName, scriptCommand);
					await ValidationUtils.showSuccessMessage(
						`Added script: ${scriptName}`
					);
				}
			}
			break;
		}
	}
}

export function deactivate() {}
