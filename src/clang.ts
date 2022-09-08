import which = require("which");
import * as path from 'path';
import * as util from 'util';
import * as vscode from 'vscode';
const exec = util.promisify(require('child_process').exec);


export class Command {
    private args?: string[];
    private input?: string; 
    private output?: string; 
    private env?: Map<string, string>;
}

export class CommandEnv {
    constructor(llvmPath?: string, workDir?: string, env?: Map<string, string>) {
        if (llvmPath) { this.llvmPath = llvmPath; }
        else { this.llvmPath = path.dirname(which.sync('clang')); }
        if (workDir) { this.workdir = workDir; }
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            this.workdir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        if (env) { this.env = env; }
    }

    public async runClang(args: string[], output?: string, env?: Map<string, string>): Promise<string|undefined> {
        try {
            const { stdout, stderr } = await exec("clang " + args.join(" ") + " -o " + output);
            return <string>stdout;
        } catch(e) {
            console.error(e);
        }
    }

    public async runOPT(args: string[], output?: string, env?: Map<string, string>) {
        try {
            const { stdout, stderr } = await exec("opt " + args.join(" ") + " -o " + output);
            return stdout;
        } catch(e) {
            console.error(e);
        }
    }

    public async runLLC(args: string[], output?: string, env?: Map<string, string>) {
        try {
            const { stdout, stderr } = await exec("llc " + args.join(" ") + " -o " + output);
            return stdout;
        } catch(e) {
            console.error(e);
        }
    }


    public getLLVMOpt(): string[] {
        return ['-mllvm', '-print-after-all'];
    }

    public async getRealCommand(args: string[], output?: string, env?: Map<string, string>): Promise<string> {
        let stdout = await this.runClang(args, output, env);
        if (stdout) {
            let lines = stdout.split("\n");
            let realCommand = lines.slice(5).join(" ");
            console.log("realCommand: " + realCommand);
            return realCommand;
        } else {
            return "";
        }
    }

    public deposition(command: string) {
        let commands = command.split(" ");
        let output = commands[commands.indexOf("-o") + 1];
        let language = commands[commands.indexOf("-x") + 1];
        let input = commands[commands.indexOf("-x") + 2];
    }

    private llvmPath: string;
    private workdir?: string;
    private env?: Map<string, string>;
}
