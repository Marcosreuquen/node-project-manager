import { ValidationUtils } from '../utils/validation.utils';

// Mock VS Code API
jest.mock(
  'vscode',
  () => ({
    window: {
      showErrorMessage: jest.fn(),
      showInformationMessage: jest.fn(),
      showWarningMessage: jest.fn(),
      showInputBox: jest.fn(),
    },
  }),
  { virtual: true }
);

// Mock Logger to avoid dependencies
jest.mock('../utils/logger.utils', () => ({
  Logger: {
    logValidation: jest.fn(),
  },
}));

describe('ValidationUtils', () => {
  describe('validatePackageName', () => {
    test('should return true for valid package names', () => {
      const validNames = [
        'react',
        'lodash',
        '@types/node',
        '@angular/core',
        'my-package',
        'package_name',
        'package.name',
      ];

      validNames.forEach(name => {
        expect(ValidationUtils.validatePackageName(name)).toBe(true);
      });
    });

    test('should return false for invalid package names', () => {
      const invalidNames = [
        '',
        '   ',
        'package with spaces',
        'package!',
        'package#hash',
        'package$',
        'package%',
        '@',
        '@scope/',
        '@/package',
      ];

      invalidNames.forEach(name => {
        expect(ValidationUtils.validatePackageName(name)).toBe(false);
      });
    });
  });

  describe('validateScriptName', () => {
    test('should return true for valid script names', () => {
      const validNames = [
        'start',
        'build',
        'test',
        'dev',
        'build:prod',
        'test:watch',
        'script_name',
        'script-name',
      ];

      validNames.forEach(name => {
        expect(ValidationUtils.validateScriptName(name)).toBe(true);
      });
    });

    test('should return false for invalid script names', () => {
      const invalidNames = [
        '',
        '   ',
        'script with spaces',
        'script!',
        'script@version',
        'script#hash',
      ];

      invalidNames.forEach(name => {
        expect(ValidationUtils.validateScriptName(name)).toBe(false);
      });
    });
  });

  describe('validateScriptCommand', () => {
    test('should return true for non-empty commands', () => {
      const validCommands = [
        'node index.js',
        'npm start',
        'echo "hello"',
        'webpack --mode production',
      ];

      validCommands.forEach(command => {
        expect(ValidationUtils.validateScriptCommand(command)).toBe(true);
      });
    });

    test('should return false for empty commands', () => {
      const invalidCommands = ['', '   ', '\t', '\n'];

      invalidCommands.forEach(command => {
        expect(ValidationUtils.validateScriptCommand(command)).toBe(false);
      });
    });
  });

  describe('validatePackageNameInput', () => {
    test('should return null for valid package names', () => {
      const validNames = ['react', 'lodash', '@types/node', '@angular/core'];

      validNames.forEach(name => {
        expect(ValidationUtils.validatePackageNameInput(name)).toBeNull();
      });
    });

    test('should return error message for empty input', () => {
      expect(ValidationUtils.validatePackageNameInput('')).toBe(
        'Package name cannot be empty'
      );
      expect(ValidationUtils.validatePackageNameInput('   ')).toBe(
        'Package name cannot be empty'
      );
    });

    test('should return error message for invalid package names', () => {
      const invalidNames = [
        'package with spaces',
        'package!',
        'package$',
        'package%',
      ];

      invalidNames.forEach(name => {
        const result = ValidationUtils.validatePackageNameInput(name);
        expect(result).toContain('Invalid package name');
      });
    });
  });

  describe('validateScriptNameInput', () => {
    test('should return null for valid script names', () => {
      const validNames = ['start', 'build', 'test:watch'];

      validNames.forEach(name => {
        expect(ValidationUtils.validateScriptNameInput(name)).toBeNull();
      });
    });

    test('should return error message for empty input', () => {
      expect(ValidationUtils.validateScriptNameInput('')).toBe(
        'Script name cannot be empty'
      );
      expect(ValidationUtils.validateScriptNameInput('   ')).toBe(
        'Script name cannot be empty'
      );
    });

    test('should return error message for invalid script names', () => {
      const invalidNames = ['script with spaces', 'script!', 'script@version'];

      invalidNames.forEach(name => {
        const result = ValidationUtils.validateScriptNameInput(name);
        expect(result).toContain('Invalid script name');
      });
    });
  });

  describe('validateScriptCommandInput', () => {
    test('should return null for valid commands', () => {
      const validCommands = ['node index.js', 'npm start', 'echo "hello"'];

      validCommands.forEach(command => {
        expect(ValidationUtils.validateScriptCommandInput(command)).toBeNull();
      });
    });

    test('should return error message for empty commands', () => {
      expect(ValidationUtils.validateScriptCommandInput('')).toBe(
        'Script command cannot be empty'
      );
      expect(ValidationUtils.validateScriptCommandInput('   ')).toBe(
        'Script command cannot be empty'
      );
    });
  });

  describe('validatePackageNameWithVersion', () => {
    test('should return true for valid package names without version', () => {
      const validNames = [
        'react',
        'lodash',
        '@types/node',
        '@angular/core',
        'my-package',
      ];

      validNames.forEach(name => {
        expect(ValidationUtils.validatePackageNameWithVersion(name)).toBe(true);
      });
    });

    test('should return true for valid package names with version', () => {
      const validNamesWithVersion = [
        'react@18.0.0',
        'lodash@4.17.21',
        '@types/node@18.0.0',
        '@angular/core@15.1.0',
        'my-package@1.0.0',
        'package@^1.2.3',
        'package@~1.2.3',
        'package@>=1.2.3',
        'package@latest',
        'package@next',
        'package@beta',
      ];

      validNamesWithVersion.forEach(name => {
        expect(ValidationUtils.validatePackageNameWithVersion(name)).toBe(true);
      });
    });

    test('should return false for invalid package names with version', () => {
      const invalidNames = [
        '',
        '   ',
        'package with spaces@1.0.0',
        '@invalid@1.0.0',
        'package@',
        'package@invalid-version!',
        'package@@1.0.0',
      ];

      invalidNames.forEach(name => {
        expect(ValidationUtils.validatePackageNameWithVersion(name)).toBe(false);
      });
    });
  });

  describe('validatePackageNameWithVersionInput', () => {
    test('should return null for valid package names', () => {
      const validInputs = [
        'react',
        'lodash@4.17.21',
        '@types/node@18.0.0',
        'package@latest',
        'package@^1.2.3',
      ];

      validInputs.forEach(input => {
        expect(ValidationUtils.validatePackageNameWithVersionInput(input)).toBeNull();
      });
    });

    test('should return error message for invalid package names', () => {
      expect(ValidationUtils.validatePackageNameWithVersionInput('')).toBe(
        'Package name cannot be empty'
      );
      expect(ValidationUtils.validatePackageNameWithVersionInput('   ')).toBe(
        'Package name cannot be empty'
      );
      expect(ValidationUtils.validatePackageNameWithVersionInput('invalid package@1.0.0')).toBe(
        'Invalid package name or version. Examples: lodash, lodash@4.0.0, @types/node@latest'
      );
      expect(ValidationUtils.validatePackageNameWithVersionInput('package@')).toBe(
        'Invalid package name or version. Examples: lodash, lodash@4.0.0, @types/node@latest'
      );
    });
  });
});
