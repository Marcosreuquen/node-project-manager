import * as vscode from "vscode";
import * as fs from "fs";
import Terminal from "./terminal.controller";
import {
	PackageManagerDetector,
	PackageManagerName,
} from "../utils/package-manager-detector.utils";
import { ValidationUtils } from "../utils/validation.utils";

declare type InstalledPackages = { name: string; version: any; isDev: boolean };
export default class Client {
	name: PackageManagerName;

	constructor(name?: PackageManagerName) {
		this.name = name || PackageManagerDetector.detect();
	}

	getPackages(): InstalledPackages[] {
		let result: InstalledPackages[] = [];
		const packageJsonPath = vscode.workspace.rootPath + "/package.json";
		if (fs.existsSync(packageJsonPath)) {
			fs.readFile(packageJsonPath, "utf8", (err, data) => {
				if (err) {
					vscode.window.showErrorMessage(
						"Error reading package.json file: " + err.message
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
						"Error parsing package.json file: " + parseError
					);
				}
			});
		} else {
			vscode.window.showErrorMessage("No package.json found in the workspace");
		}
		return result;
	}

	async add(packageNames: string): Promise<void> {
		try {
			const command = PackageManagerDetector.getInstallCommand(
				packageNames,
				false
			);
			const terminal = new Terminal();
			await terminal.send({
				command,
				show: true,
			});
			// Don't close terminal immediately to see potential errors
			// terminal.close();
		} catch (error) {
			await ValidationUtils.showErrorMessage(
				`Failed to install package: ${error}`
			);
			throw error;
		}
	}
	async update(packageNames: string): Promise<void> {
		try {
			const command = PackageManagerDetector.getUpdateCommand(packageNames);
			const terminal = new Terminal();
			await terminal.send({
				command,
				show: true,
			});
			// Don't close terminal immediately to see potential errors
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
			const terminal = new Terminal();
			await terminal.send({
				command,
				show: true,
			});
			// Don't close terminal immediately to see potential errors
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
			const terminal = new Terminal();
			await terminal.send({
				command,
				show: true,
			});
			// Don't close terminal immediately to see potential errors
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
			const terminal = new Terminal();
			await terminal.send({
				command,
				show: true,
			});
			// Don't close terminal immediately to see potential errors
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
			const terminal = new Terminal();
			await terminal.send({
				command,
				show: true,
			});
			// Don't close terminal immediately to see potential results
		} catch (error) {
			await ValidationUtils.showErrorMessage(
				`Failed to audit packages: ${error}`
			);
			throw error;
		}
	}
}
