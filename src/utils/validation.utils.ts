import * as vscode from 'vscode';
import { Logger } from './logger.utils';

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
   * Validates if a package name with optional version follows npm conventions
   * @param nameWithVersion Package name with optional version (e.g., "lodash" or "lodash@4.0.0")
   * @returns true if valid, false otherwise
   */
  static validatePackageNameWithVersion(nameWithVersion: string): boolean {
    if (!nameWithVersion || !nameWithVersion.trim()) {
      return false;
    }

    const trimmed = nameWithVersion.trim();

    // Handle scoped packages starting with @
    if (trimmed.startsWith('@')) {
      const parts = trimmed.split('@');
      if (parts.length === 2) {
        // Just scoped package name like @types/node (parts: ['', 'types/node'])
        return ValidationUtils.validatePackageName(trimmed);
      } else if (parts.length === 3) {
        // Scoped package with version like @types/node@1.0.0 (parts: ['', 'types/node', '1.0.0'])
        const packageName = `@${parts[1]}`;
        const version = parts[2];

        if (!ValidationUtils.validatePackageName(packageName)) {
          return false;
        }

        // Validate version part
        const versionRegex =
          /^(\^|~|>=|<=|>|<)?[\d\w.-]+(\s*\|\|\s*[\d\w.-]+)*$|^latest$|^next$|^beta$|^alpha$/;
        return versionRegex.test(version);
      } else {
        return false;
      }
    } else {
      // Regular package (not scoped)
      const parts = trimmed.split('@');
      if (parts.length === 1) {
        // Just package name like lodash
        return ValidationUtils.validatePackageName(trimmed);
      } else if (parts.length === 2) {
        // Package with version like lodash@4.0.0
        const packageName = parts[0];
        const version = parts[1];

        if (!ValidationUtils.validatePackageName(packageName)) {
          return false;
        }

        // Validate version part
        const versionRegex =
          /^(\^|~|>=|<=|>|<)?[\d\w.-]+(\s*\|\|\s*[\d\w.-]+)*$|^latest$|^next$|^beta$|^alpha$/;
        return versionRegex.test(version);
      } else {
        return false;
      }
    }
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
    await vscode.window.showInformationMessage(
      `Node Project Manager: ${message}`
    );
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
      validateInput: validator,
    });
  }

  /**
   * Validates package name input
   * @param value Input value to validate
   * @returns Error message or null if valid
   */
  static validatePackageNameInput(value: string): string | null {
    if (!value.trim()) {
      Logger.logValidation(
        value,
        'package name',
        false,
        'Package name cannot be empty'
      );
      return 'Package name cannot be empty';
    }

    const isValid = ValidationUtils.validatePackageName(value);
    if (!isValid) {
      Logger.logValidation(
        value,
        'package name',
        false,
        'Invalid package name format'
      );
      return 'Invalid package name. Use lowercase letters, numbers, hyphens, and dots only';
    }

    Logger.logValidation(value, 'package name', true);
    return null;
  }

  /**
   * Validates package name with optional version input
   * @param value Input value to validate (e.g., "lodash" or "lodash@4.0.0")
   * @returns Error message or null if valid
   */
  static validatePackageNameWithVersionInput(value: string): string | null {
    if (!value.trim()) {
      Logger.logValidation(
        value,
        'package name with version',
        false,
        'Package name cannot be empty'
      );
      return 'Package name cannot be empty';
    }

    const isValid = ValidationUtils.validatePackageNameWithVersion(value);
    if (!isValid) {
      Logger.logValidation(
        value,
        'package name with version',
        false,
        'Invalid package name or version format'
      );
      return 'Invalid package name or version. Examples: lodash, lodash@4.0.0, @types/node@latest';
    }

    Logger.logValidation(value, 'package name with version', true);
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
