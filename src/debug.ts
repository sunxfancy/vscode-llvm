import * as vscode from 'vscode';
import * as path from 'path';
import {Pipeline} from './core';

export class Debug {
    constructor() {}

    public async saveConfig(pipeline: Pipeline) {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            let launchConfig = vscode.workspace.getConfiguration('launch', vscode.workspace.workspaceFolders[0].uri);
            console.log("save Config: ", launchConfig);
            let c = {
                "type": "lldb",
                "request": "launch",
                "name": `(lldb) Launch ${pipeline.command.exe}`,
                "program": pipeline.command.exe,
                "args": pipeline.command.args,
                "cwd": "${workspaceFolder}"
            };
            console.log("config", c);
            launchConfig.configurations.push(c);

            launchConfig.update('configurations', launchConfig.configurations, false);

            // launchConfig.update('configurations', launchConfig, true);
        }
    }
}