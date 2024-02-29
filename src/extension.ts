import * as vscode from 'vscode';
import { extractAndDisplayScripts, addNewScript } from './scriptsManager';
import Client from './nodeManager';


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "script-extractor" is now active!');
    const client = new Client();

    // Register the "Manage Project" command
    const useScriptsDisposable = vscode.commands.registerCommand('extension.useScripts', () => {
            // Extract and display the scripts when the command is executed
            extractAndDisplayScripts();
        });

    const installCommandDisposable = vscode.commands.registerCommand('extension.installDependencies', () => {
        // Run "npm install" command when the command is executed
        client.install();
    });

    const addCommandDisposable = vscode.commands.registerCommand('extension.addDependency', async () => {
        // Run "client.add" command with the input from the user
        const userInput = await vscode.window.showInputBox({ prompt: 'Enter the dependency to add' });
        if (userInput) {
            client.add(userInput);
        }
    }); 
    
    const removeCommandDisposable = vscode.commands.registerCommand('extension.removeDependency', async () => {
        // Run "client.remove" command with the input from the user
        const userInput = await vscode.window.showInputBox({ prompt: 'Enter the dependency to remove' });
        if (userInput) {
            client.remove(userInput);
        }
    });

    const updateCommandDisposable = vscode.commands.registerCommand('extension.updateDependency', async () => {
        // Run "client.update" command with the input from the user
        const userInput = await vscode.window.showInputBox({ prompt: 'Enter the dependency to update' });
        if (userInput) {
            client.update(userInput);
        }
    });


    const auditCommandDisposable = vscode.commands.registerCommand('extension.auditDependencies', () => {
        // Run "client.audit" command when the command is executed
        client.audit();
    });

    const addScriptDisposable = vscode.commands.registerCommand('extension.addScript', async () => {
        // Run "client.add" command with the input from the user
        const scriptName = await vscode.window.showInputBox({ prompt: 'Enter the script name to add' });
        if (scriptName) {
            const scriptCommand = await vscode.window.showInputBox({ prompt: 'Enter the script command to add' });
            if (scriptCommand) {
                addNewScript(scriptName, scriptCommand);
            }
        }
    }); 

    const addDevCommandDisposable = vscode.commands.registerCommand('extension.addDevDependency', async () => {
        // Run "client.add" command with the input from the user
        const userInput = await vscode.window.showInputBox({ prompt: 'Enter the dependency to add' });
        if (userInput) {
            client.addDevDependencies(userInput);
        }
    }); 

    context.subscriptions.push(addDevCommandDisposable);
    context.subscriptions.push(addScriptDisposable);
    context.subscriptions.push(auditCommandDisposable);
    context.subscriptions.push(updateCommandDisposable);
    context.subscriptions.push(removeCommandDisposable);
    context.subscriptions.push(addCommandDisposable);
    context.subscriptions.push(installCommandDisposable);
    context.subscriptions.push(useScriptsDisposable);
}


export function deactivate() {}
