# Changelog

All notable changes to the Node Project Manager extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-10-12

- update dependencies to avoid vulnerability issues

## [1.0.0] - 2024-10-07

### 🚀 Major Features

#### Multi-Package Manager Support
- **Automatic Detection**: Smart detection of npm, yarn, pnpm, and bun based on lock files
- **Priority-based Selection**: Intelligent selection when multiple package managers are present
- **Dynamic Commands**: Generates appropriate commands for each package manager

#### Enhanced User Interface
- **QuickPick Menus**: Beautiful interface with icons, descriptions, and progress indicators
- **Keyboard Shortcuts**: Added `Ctrl+Alt+N` (`Cmd+Alt+N` on Mac) for quick access
- **Context Menu Integration**: Right-click on package.json files for direct access
- **Progress Feedback**: Visual indicators during long-running operations

#### Comprehensive Validation & Error Handling
- **Input Validation**: Robust validation for package names and script names
- **npm Package Standards**: Enforces npm package naming conventions
- **User-Friendly Messages**: Clear error messages with actionable guidance
- **Graceful Failures**: Proper error recovery and user notification

### 🏗️ Architecture Improvements

#### Code Organization
- **Command Manager**: Centralized command handling and registration
- **Controller Pattern**: Separated concerns with dedicated controllers
- **Utility Classes**: Reusable utilities for validation, detection, and UI
- **Logging System**: Comprehensive logging with VS Code OutputChannel integration

#### Developer Experience
- **TypeScript Strict Mode**: Full type safety and better IntelliSense
- **ESLint & Prettier**: Consistent code style and quality checks
- **Unit Testing**: Jest-based testing with 87%+ coverage for utilities
- **Development Scripts**: Quality checks, formatting, and testing automation

### 🔧 Technical Enhancements

#### Logging & Debugging
- **OutputChannel Integration**: Detailed logs in VS Code Output panel
- **Operation Tracking**: Logs for all user actions and system operations
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance Monitoring**: Command execution time tracking

#### Configuration Options
- **Package Manager Override**: Manual package manager selection
- **Terminal Visibility**: Option to show/hide terminal during operations
- **Confirmation Prompts**: Configurable confirmation for destructive actions
- **Workspace Settings**: Per-workspace configuration support

### 🐛 Bug Fixes

#### Critical Issues Fixed
- **Infinite Loop**: Fixed script execution causing infinite event loops
- **Double Menu Display**: Eliminated duplicate QuickPick menus
- **Premature Success Messages**: Fixed success notifications appearing before completion
- **Event Handler Memory Leaks**: Proper disposal of event listeners

#### Stability Improvements
- **Error Boundaries**: Better error containment and recovery
- **Resource Management**: Proper cleanup of VS Code resources
- **Async Operations**: Improved handling of asynchronous operations
- **Terminal Integration**: More reliable terminal command execution

### 📦 Dependencies

#### Development Dependencies Added
- `jest` and `@types/jest`: Unit testing framework
- `ts-jest`: TypeScript support for Jest
- `prettier`: Code formatting
- `eslint-config-prettier`: ESLint/Prettier integration
- `npm-run-all`: Script orchestration

#### Updated Dependencies
- Updated TypeScript to 5.3.2
- Updated ESLint configuration for better TypeScript support
- Enhanced VS Code API typings

### 📚 Documentation

#### Comprehensive Documentation
- **README**: Complete feature overview with usage examples
- **Development Guide**: Architecture decisions and development process
- **Changelog**: Detailed change history
- **Code Comments**: Extensive JSDoc documentation

#### Developer Resources
- **Testing Guide**: Unit testing strategies and examples
- **Architecture Documentation**: System design and component interactions
- **Contributing Guidelines**: Development setup and contribution process

### ⚠️ Breaking Changes

#### Configuration Changes
- Configuration key format updated for better organization
- Default package manager detection behavior changed
- Some command IDs may have changed (check your keybindings)

#### API Changes
- Internal APIs restructured (affects only extension developers)
- Event handling patterns updated for better performance
- Logging output format standardized

### 🔮 Migration Guide

#### From v1.x to v2.0
1. **Configuration**: Update your settings.json if you have custom configurations
2. **Keybindings**: Verify custom keybindings still work with new command structure
3. **Behavior**: New automatic package manager detection may change behavior

## [0.0.4] - Previous Version

### Features
- Basic script execution from package.json
- Simple dependency management (add/remove)
- Basic terminal integration
- Command palette integration

### Limitations
- Single package manager support (npm only)
- Limited error handling
- Basic UI without visual feedback
- No input validation
