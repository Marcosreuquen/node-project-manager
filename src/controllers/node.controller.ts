import * as vscode from "vscode";
import * as fs from "fs";
import Terminal from "./terminal.controller";

declare type PackageManagerName = "npm" | "yarn" | "pnpm" | "bun";
declare type InstalledPackages = { name: string; version: any; isDev: boolean };
export default class Client {
  name: PackageManagerName;
  constructor(name?: PackageManagerName) {
    const packageLockPath = vscode.workspace.rootPath + "/package-lock.json";
    const yarnLockPath = vscode.workspace.rootPath + "/yarn.lock";
    const pnpmLockPath = vscode.workspace.rootPath + "/pnpm-lock.yaml";
    const bunLockPath = vscode.workspace.rootPath + "/bun.lockb";

    if (fs.existsSync(packageLockPath)) {
      this.name = "npm";
    } else if (fs.existsSync(yarnLockPath)) {
      this.name = "yarn";
    } else if (fs.existsSync(pnpmLockPath)) {
      this.name = "pnpm";
    } else if (fs.existsSync(bunLockPath)) {
      this.name = "bun";
    } else {
      if (name) {
        this.name = name;
      } else {
        this.name = "npm";
      }
    }
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

  audit() {
    new Terminal()
      .send({ command: `${this.name} audit}` })
      .then((t) => t.close());
  }
  add(packageNames: string) {
    let command = "";
    switch (this.name) {
      case "npm":
        command = "npm install";
        break;
      case "yarn":
        command = "yarn add";
        break;
      case "pnpm":
        command = "pnpm install";
        break;
      case "bun":
        command = "bun add";
        break;
    }
    new Terminal()
      .send({
        command: `${command} ${packageNames}`,
        message: "Packages installed successfully.",
      })
      .then((t) => t.close());
  }
  update(packageNames: string) {
    let command = "";
    switch (this.name) {
      case "npm":
        command = "npm update";
        break;
      case "yarn":
        command = "yarn upgrade";
        break;
      case "pnpm":
        command = "pnpm update";
        break;
      case "bun":
        command = "bun update";
        break;
    }
    new Terminal()
      .send({
        command: `${this.name} ${packageNames}`,
        message: "Packages updated successfully.",
      })
      .then((t) => t.close());
  }
  remove(packageNames: string) {
    let command = "";
    switch (this.name) {
      case "npm":
        command = "npm uninstall";
        break;
      case "yarn":
        command = "yarn remove";
        break;
      case "pnpm":
        command = "pnpm remove";
        break;
      case "bun":
        command = "bun remove";
        break;
    }
    new Terminal()
      .send({
        command: `${command} ${packageNames}`,
        message: `${packageNames} was successfully removed.`,
      })
      .then((t) => t.close());
  }
  install() {
    new Terminal()
      .send({
        command: `${this.name} install`,
        message: "Packages installed successfully.",
      })
      .then((t) => t.close());
  }

  addDevDependencies(packageNames: string) {
    let command = "";
    switch (this.name) {
      case "npm":
        command = "npm install --save-dev";
        break;
      case "yarn":
        command = "yarn add --dev";
        break;
      case "pnpm":
        command = "pnpm install --save-dev";
        break;
      case "bun":
        command = "bun add --development";
        break;
      default:
        throw new Error("Unsupported package manager");
    }
    new Terminal()
      .send({
        command: `${command} ${packageNames}`,
        message: `${packageNames} was successfully added.`,
      })
      .then((t) => t.close());
  }

  getScript(scriptName: string) {
    let command = "";
    switch (this.name) {
      case "npm":
        command = "npm run";
        break;
      case "yarn":
        command = "yarn";
        break;
      case "pnpm":
        command = "pnpm run";
        break;
      case "bun":
        command = "bun run";
        break;
      default:
        throw new Error("Unsupported package manager");
    }
    return `${command} ${scriptName}`;
  }
}
