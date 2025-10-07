import * as vscode from 'vscode';

export class ValidationUtils {
    /**
     * Validates if a package name follows npm naming conventions
     * @param name Package name to validate
     * @returns true if valid, false otherwise
     */
    static validatePackageName(name: string): boolean {
        if (!name || !name.trim()) {
            return false;
        }
        
        // npm package name rules:
        // - can contain lowercase letters, numbers, hyphens, underscores, dots
        // - can be scoped (@scope/package)
        // - must be between 1-214 characters
        const regex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
        return regex.test(name.toLowerCase()) && name.length <= 214;
    }

    /**
     * Validates if a script name is valid for package.json
     * @param name Script name to validate
     * @returns true if valid, false otherwise
     */
    static validateScriptName(name: string): boolean {
        if (!name || !name.trim()) {
            return false;
        }
        
        // Script names should be alphanumeric with hyphens, underscores, colons
        const regex = /^[a-zA-Z0-9:_-]+$/;
        return regex.test(name);
    }

    /**
     * Validates if a script command is not empty
     * @param command Script command to validate
     * @returns true if valid, false otherwise
     */
    static validateScriptCommand(command: string): boolean {
        return !!(command && command.trim());
    }

    /**
     * Shows a standardized error message
     * @param message Error message to display
     */
    static async showErrorMessage(message: string): Promise<void> {
        await vscode.window.showErrorMessage(`Node Project Manager: ${message}`);
    }

    /**
     * Shows a standardized success message
     * @param message Success message to display
     */
    static async showSuccessMessage(message: string): Promise<void> {
        await vscode.window.showInformationMessage(`Node Project Manager: ${message}`);
    }

    /**
     * Shows a standardized warning message
     * @param message Warning message to display
     */
    static async showWarningMessage(message: string): Promise<void> {
        await vscode.window.showWarningMessage(`Node Project Manager: ${message}`);
    }

    /**
     * Gets user input with validation
     * @param prompt Prompt message for the user
     * @param validator Validation function
     * @param placeholder Placeholder text
     * @returns Promise resolving to user input or undefined if cancelled
     */
    static async getValidatedInput(
        prompt: string,
        validator: (value: string) => string | null,
        placeholder?: string
    ): Promise<string | undefined> {
        return vscode.window.showInputBox({
            prompt,
            placeHolder: placeholder,
            validateInput: validator
        });
    }

    /**
     * Validates package name input
     * @param value Input value to validate
     * @returns Error message or null if valid
     */
    static validatePackageNameInput(value: string): string | null {
        if (!value.trim()) {
            return 'Package name cannot be empty';
        }
        
        if (!ValidationUtils.validatePackageName(value)) {
            return 'Invalid package name. Use lowercase letters, numbers, hyphens, and dots only';
        }
        
        return null;
    }

    /**
     * Validates script name input
     * @param value Input value to validate
     * @returns Error message or null if valid
     */
    static validateScriptNameInput(value: string): string | null {
        if (!value.trim()) {
            return 'Script name cannot be empty';
        }
        
        if (!ValidationUtils.validateScriptName(value)) {
            return 'Invalid script name. Use alphanumeric characters, hyphens, underscores, and colons only';
        }
        
        return null;
    }

    /**
     * Validates script command input
     * @param value Input value to validate
     * @returns Error message or null if valid
     */
    static validateScriptCommandInput(value: string): string | null {
        if (!value.trim()) {
            return 'Script command cannot be empty';
        }
        
        return null;
    }
}