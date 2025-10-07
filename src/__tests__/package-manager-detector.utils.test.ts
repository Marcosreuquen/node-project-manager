import {
  PackageManagerDetector,
  PackageManagerName,
} from '../utils/package-manager-detector.utils';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock VS Code API
jest.mock(
  'vscode',
  () => ({
    workspace: {
      workspaceFolders: [
        {
          uri: {
            fsPath: '/mock/workspace/path',
          },
        },
      ],
      getConfiguration: jest.fn(() => ({
        get: jest.fn((key: string, defaultValue: any) => {
          if (key === 'packageManager') {
            return defaultValue;
          }
          return defaultValue;
        }),
      })),
    },
  }),
  { virtual: true }
);

// Mock Logger to avoid dependencies
jest.mock('../utils/logger.utils', () => ({
  Logger: {
    logPackageManagerDetection: jest.fn(),
    info: jest.fn(),
  },
}));

describe('PackageManagerDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detect', () => {
    test('should detect npm when package-lock.json exists', () => {
      mockFs.existsSync.mockImplementation(filePath => {
        return path.basename(filePath.toString()) === 'package-lock.json';
      });

      const result = PackageManagerDetector.detect();
      expect(result).toBe('npm');
    });

    test('should detect yarn when yarn.lock exists', () => {
      mockFs.existsSync.mockImplementation(filePath => {
        return path.basename(filePath.toString()) === 'yarn.lock';
      });

      const result = PackageManagerDetector.detect();
      expect(result).toBe('yarn');
    });

    test('should detect pnpm when pnpm-lock.yaml exists', () => {
      mockFs.existsSync.mockImplementation(filePath => {
        return path.basename(filePath.toString()) === 'pnpm-lock.yaml';
      });

      const result = PackageManagerDetector.detect();
      expect(result).toBe('pnpm');
    });

    test('should detect bun when bun.lockb exists', () => {
      mockFs.existsSync.mockImplementation(filePath => {
        return path.basename(filePath.toString()) === 'bun.lockb';
      });

      const result = PackageManagerDetector.detect();
      expect(result).toBe('bun');
    });

    test('should return npm as default when no lock files exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = PackageManagerDetector.detect();
      expect(result).toBe('npm');
    });

    test('should prioritize pnpm over others when multiple exist', () => {
      mockFs.existsSync.mockImplementation(filePath => {
        const filename = path.basename(filePath.toString());
        return ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'].includes(
          filename
        );
      });

      const result = PackageManagerDetector.detect();
      expect(result).toBe('pnpm');
    });
  });

  describe('getInstallCommand', () => {
    beforeEach(() => {
      // Mock detect to return npm by default
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
    });

    test('should return correct install commands when no package name provided', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
      expect(PackageManagerDetector.getInstallCommand()).toBe('npm install');

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getInstallCommand()).toBe('yarn install');

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('pnpm');
      expect(PackageManagerDetector.getInstallCommand()).toBe('pnpm install');

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('bun');
      expect(PackageManagerDetector.getInstallCommand()).toBe('bun install');
    });

    test('should return correct install commands with package name', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
      expect(PackageManagerDetector.getInstallCommand('react')).toBe(
        'npm install react'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getInstallCommand('react')).toBe(
        'yarn add react'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('pnpm');
      expect(PackageManagerDetector.getInstallCommand('react')).toBe(
        'pnpm add react'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('bun');
      expect(PackageManagerDetector.getInstallCommand('react')).toBe(
        'bun add react'
      );
    });

    test('should return correct dev install commands', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
      expect(PackageManagerDetector.getInstallCommand('typescript', true)).toBe(
        'npm install typescript --save-dev'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getInstallCommand('typescript', true)).toBe(
        'yarn add typescript --dev'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('pnpm');
      expect(PackageManagerDetector.getInstallCommand('typescript', true)).toBe(
        'pnpm add typescript --save-dev'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('bun');
      expect(PackageManagerDetector.getInstallCommand('typescript', true)).toBe(
        'bun add typescript --dev'
      );
    });
  });

  describe('getRemoveCommand', () => {
    test('should return correct remove commands', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
      expect(PackageManagerDetector.getRemoveCommand('react')).toBe(
        'npm uninstall react'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getRemoveCommand('react')).toBe(
        'yarn remove react'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('pnpm');
      expect(PackageManagerDetector.getRemoveCommand('react')).toBe(
        'pnpm remove react'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('bun');
      expect(PackageManagerDetector.getRemoveCommand('react')).toBe(
        'bun remove react'
      );
    });
  });

  describe('getUpdateCommand', () => {
    test('should return correct update commands without version (latest)', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
      expect(PackageManagerDetector.getUpdateCommand('react')).toBe(
        'npm install react@latest'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getUpdateCommand('react')).toBe(
        'yarn add react@latest'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('pnpm');
      expect(PackageManagerDetector.getUpdateCommand('react')).toBe(
        'pnpm add react@latest'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('bun');
      expect(PackageManagerDetector.getUpdateCommand('react')).toBe(
        'bun add react@latest'
      );
    });

    test('should return correct update commands with specific version', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
      expect(PackageManagerDetector.getUpdateCommand('react', '18.2.0')).toBe(
        'npm install react@18.2.0'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getUpdateCommand('react', '18.2.0')).toBe(
        'yarn add react@18.2.0'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('pnpm');
      expect(PackageManagerDetector.getUpdateCommand('react', '18.2.0')).toBe(
        'pnpm add react@18.2.0'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('bun');
      expect(PackageManagerDetector.getUpdateCommand('react', '18.2.0')).toBe(
        'bun add react@18.2.0'
      );
    });

    test('should handle version ranges and keywords', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');

      expect(PackageManagerDetector.getUpdateCommand('react', '^18.0.0')).toBe(
        'npm install react@^18.0.0'
      );

      expect(PackageManagerDetector.getUpdateCommand('react', '~18.2.0')).toBe(
        'npm install react@~18.2.0'
      );

      expect(PackageManagerDetector.getUpdateCommand('react', 'latest')).toBe(
        'npm install react@latest'
      );

      expect(PackageManagerDetector.getUpdateCommand('react', 'next')).toBe(
        'npm install react@next'
      );
    });

    test('should use @latest for true latest version updates', () => {
      // This test documents the fix for the npm update limitation
      // npm update respects semver ranges, but @latest forces true latest
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');

      // Without version should use @latest (not just 'npm update')
      expect(PackageManagerDetector.getUpdateCommand('lodash')).toBe(
        'npm install lodash@latest'
      );

      // This ensures packages like lodash ^4.0.0 can update to 5.x if available
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getUpdateCommand('lodash')).toBe(
        'yarn add lodash@latest'
      );
    });
  });

  describe('getRunCommand', () => {
    test('should return correct run commands', () => {
      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('npm');
      expect(PackageManagerDetector.getRunCommand('start')).toBe(
        'npm run start'
      );

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('yarn');
      expect(PackageManagerDetector.getRunCommand('start')).toBe('yarn start');

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('pnpm');
      expect(PackageManagerDetector.getRunCommand('start')).toBe('pnpm start');

      jest.spyOn(PackageManagerDetector, 'detect').mockReturnValue('bun');
      expect(PackageManagerDetector.getRunCommand('start')).toBe(
        'bun run start'
      );
    });
  });

  describe('hasPackageJson', () => {
    test('should return true when package.json exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      expect(PackageManagerDetector.hasPackageJson()).toBe(true);
    });

    test('should return false when package.json does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(PackageManagerDetector.hasPackageJson()).toBe(false);
    });
  });

  describe('getPackageJsonPath', () => {
    test('should return path when package.json exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      const result = PackageManagerDetector.getPackageJsonPath();
      expect(result).toBe('/mock/workspace/path/package.json');
    });

    test('should return null when package.json does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      const result = PackageManagerDetector.getPackageJsonPath();
      expect(result).toBeNull();
    });
  });
});
