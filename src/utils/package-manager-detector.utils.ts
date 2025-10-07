import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

export class PackageManagerDetector {
    /**
     * Detects the package manager used in the current workspace
     * @returns The detected package manager name
     */
    static detect(): PackageManagerName {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            console.log('No workspace folder found, defaulting to npm');
            return 'npm';
        }

        const rootPath = workspaceFolder.uri.fsPath;
        
        // Check for lock files in order of preference
        const lockFiles = [
            { file: 'pnpm-lock.yaml', manager: 'pnpm' as PackageManagerName },
            { file: 'yarn.lock', manager: 'yarn' as PackageManagerName },
            { file: 'bun.lockb', manager: 'bun' as PackageManagerName },
            { file: 'package-lock.json', manager: 'npm' as PackageManagerName },
        ];

        for (const { file, manager } of lockFiles) {
            if (fs.existsSync(path.join(rootPath, file))) {
                console.log(`Detected ${manager} from ${file}`);
                return manager;
            }
        }

        // Fallback to configuration if no lock file found
        const config = vscode.workspace.getConfiguration('nodeProjectManager');
        const configuredManager = config.get<PackageManagerName>('packageManager', 'npm');
        
        console.log(`No lock file found, using configured package manager: ${configuredManager}`);
        return configuredManager;
    }

    /**
     * Gets the install command for the detected package manager
     * @param packageName Optional package name to install
     * @param isDev Whether to install as dev dependency
     * @returns The install command
     */
    static getInstallCommand(packageName?: string, isDev = false): string {
        const manager = this.detect();
        
        if (!packageName) {
            // Install all dependencies
            switch (manager) {
                case 'yarn':
                    return 'yarn install';
                case 'pnpm':
                    return 'pnpm install';
                case 'bun':
                    return 'bun install';
                default:
                    return 'npm install';
            }
        }

        // Install specific package
        switch (manager) {
            case 'yarn':
                return `yarn add ${packageName}${isDev ? ' --dev' : ''}`;
            case 'pnpm':
                return `pnpm add ${packageName}${isDev ? ' --save-dev' : ''}`;
            case 'bun':
                return `bun add ${packageName}${isDev ? ' --dev' : ''}`;
            default:
                return `npm install ${packageName}${isDev ? ' --save-dev' : ''}`;
        }
    }

    /**
     * Gets the remove command for the detected package manager
     * @param packageName Package name to remove
     * @returns The remove command
     */
    static getRemoveCommand(packageName: string): string {
        const manager = this.detect();
        
        switch (manager) {
            case 'yarn':
                return `yarn remove ${packageName}`;
            case 'pnpm':
                return `pnpm remove ${packageName}`;
            case 'bun':
                return `bun remove ${packageName}`;
            default:
                return `npm uninstall ${packageName}`;
        }
    }

    /**
     * Gets the update command for the detected package manager
     * @param packageName Package name to update
     * @returns The update command
     */
    static getUpdateCommand(packageName: string): string {
        const manager = this.detect();
        
        switch (manager) {
            case 'yarn':
                return `yarn upgrade ${packageName}`;
            case 'pnpm':
                return `pnpm update ${packageName}`;
            case 'bun':
                return `bun update ${packageName}`;
            default:
                return `npm update ${packageName}`;
        }
    }

    /**
     * Gets the audit command for the detected package manager
     * @returns The audit command
     */
    static getAuditCommand(): string {
        const manager = this.detect();
        
        switch (manager) {
            case 'yarn':
                return 'yarn audit';
            case 'pnpm':
                return 'pnpm audit';
            case 'bun':
                return 'bun audit';
            default:
                return 'npm audit';
        }
    }

    /**
     * Gets the run script command for the detected package manager
     * @param scriptName Script name to run
     * @returns The run command
     */
    static getRunCommand(scriptName: string): string {
        const manager = this.detect();
        
        switch (manager) {
            case 'yarn':
                return `yarn ${scriptName}`;
            case 'pnpm':
                return `pnpm ${scriptName}`;
            case 'bun':
                return `bun run ${scriptName}`;
            default:
                return `npm run ${scriptName}`;
        }
    }

    /**
     * Checks if package.json exists in the workspace
     * @returns true if package.json exists
     */
    static hasPackageJson(): boolean {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return false;
        }

        const packageJsonPath = path.join(workspaceFolder.uri.fsPath, 'package.json');
        return fs.existsSync(packageJsonPath);
    }

    /**
     * Gets the path to package.json in the workspace
     * @returns The path to package.json or null if not found
     */
    static getPackageJsonPath(): string | null {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return null;
        }

        const packageJsonPath = path.join(workspaceFolder.uri.fsPath, 'package.json');
        return fs.existsSync(packageJsonPath) ? packageJsonPath : null;
    }
}