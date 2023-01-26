import which = require("which");
import * as path from 'path';
import * as util from 'util';
import * as vscode from 'vscode';
import { exec, spawn } from 'child_process';


export class Command {
    public exe: string;
    public args: string[];
    public input: string; 
    public output: string; 
    public language: string;

    // this must be a real command
    constructor(commands: string[]) {
        this.exe = commands[0];
        this.language = commands[commands.indexOf("-x") + 1];
        this.input = commands[commands.indexOf("-x") + 2];
        this.output = commands[commands.indexOf("-o") + 1];
        commands.splice(commands.indexOf("-x"), 3);
        commands.splice(commands.indexOf("-o"), 2);
        commands.splice(0, 1);
        this.args = commands;
    }

    public redirectOutputToStdout() {
        this.output = '-';
    }

    public toString() {
        return this.exe + " " + this.args.join(" ") + " -o " + this.output 
                + " -x " + this.language + " " + this.input; 
    }
}

export class CommandEnv {
    constructor(llvmPath?: string, workDir?: string, env?: Map<string, string>) {
        if (llvmPath) { 
            this.llvmPath = llvmPath; 
        } else { 
            this.llvmPath = path.dirname(which.sync('clang')); 
        }
        if (workDir) { 
            this.workdir = workDir; 
        } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            this.workdir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        if (env) { this.env = env; }
    }


    public async runClang(cmd: Command, env?: Map<string, string>) {
        return this.runClangRaw(cmd.toString(), env);
    }

    public async runClangRaw(cmd: string, env?: Map<string, string>): Promise<{stdout: string, stderr: string}> {
        let args = cmd.split(" ");
        let exe = args[0];
        args.shift();
        return new Promise((resolve, reject) => {
            let stderr: string[] = [];
            let stdout: string[] = [];
            const run = spawn(exe, args);
            run.stderr.on('data', (data) => {
                stderr.push(data);
            });
            run.stdout.on('data', (data) => {
                stdout.push(data);
            });
            run.on('close', (code) => {
                resolve({stdout: stdout.join(""), stderr: stderr.join("")});
            });
            run.on('error', (err) => {
                reject(err);
            });
        });
    }

    public async runOPT(args: string[], output?: string, env?: Map<string, string>): Promise<any|undefined>  {
        
    }

    public async runLLC(args: string[], output?: string, env?: Map<string, string>): Promise<any|undefined> {
        
    }


    getLLVMOpt(): string[] {
        return ['-mllvm', '-print-after-all'];
    }

    public setDebug() {
        return ['-g', '-S'];
    }    

    private findCommand(cmd: string): string[] {
        let lines = cmd.split(/\r?\n/);
        let realCommand = lines[4].trim();
        let k = 5;
        while (!realCommand.startsWith("\"") && k < lines.length) {
            realCommand = lines[k++].trim();
        }
        console.log("realCommand: " + realCommand);
        return realCommand.split(" ").map((value) => { return value.substring(1, value.length - 1); });
    }

    public async getRealCommand(args: string, env?: Map<string, string>): Promise<string[]> {
        console.log("runClangRaw: " + args + " -###");
        const {stdout, stderr} = await this.runClangRaw(args + " -###", env);
        console.log("stderr of get real command: ", stdout, stderr);
        if (stderr !== "") {
            return this.findCommand(stderr);
        } else if (stdout !== "") {
            return this.findCommand(stdout);
        } else {
            return [];
        }
    }

    private llvmPath: string;
    private workdir?: string;
    private env?: Map<string, string>;
}
