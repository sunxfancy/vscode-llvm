import which = require("which");
import * as path from 'path';
import { parseShellArg } from './utils';
import * as vscode from 'vscode';
import { exec, spawn } from 'child_process';

// This class is an abstraction of clang/lld/llvm commands
// Or, may use to store other commands
export class Command {
    public exe: string;
    public args: string[];
    public env?: CommandEnv;

    // This should not be directly used
    protected constructor(commands: string[]) {
        this.exe = commands[0];
        commands.splice(0, 1);
        this.args = commands;
    }

    // This function create a command and automatically detect the type
    public static async create(commands: string[]): Promise<Command | undefined> {
        if (commands.length === 0) { return undefined; }
        let clangNames = RegExp("(clang|clang\\+\\+|clang-cl|clang-cpp)(-[0-9]+(\\.[0-9]+)?)?(\.exe)?$");
        let lldNames = RegExp("(ld.lld|ld64.lld|lld|lld-link)(\.exe)?$");
        let nvccNames = RegExp("(nvcc)(\.exe)?$");

        if (clangNames.test(commands[0])) {
            if (commands.indexOf("-cc1") !== -1) {
                return new CC1Command(commands);
            }
            let clangCmd = new ClangCommand(commands);
            return clangCmd;
        } else if (lldNames.test(commands[0])) {
            return new LLDCommand(commands);
        } else if (nvccNames.test(commands[0])) {
            return new NVCCCommand(commands);
        } else {
            return new Command(commands);
        }
    }

    // This function will correctly parse the command string
    public static async createfromString(cmd: string): Promise<Command | undefined> {
        let commands = parseShellArg(cmd);
        if (!commands) { return undefined; }
        return Command.create(commands);
    }

    public async run(addition: string[] | null | undefined): Promise<{ code: number | null, stdout: string, stderr: string }> {
        let env = this.env;
        if (env === undefined) {
            env = CommandEnv.getDefault();
        }
        let args = this.getArgs();
        if (addition) {
            args = args.concat(addition);
        }
        return env.run(this.exe, args);
    }


    public isExeAbsolute(): boolean {
        return path.isAbsolute(this.exe);
    }

    public isExeRelative(): boolean {
        return !this.isExeAbsolute();
    }

    public isExeOnlyName(): boolean {
        return this.exe.indexOf("/") === -1;
    }

    public isExeInPath(): boolean {
        return which.sync(this.exe, { nothrow: true }) !== null;
    }

    public getArgs(): string[] {
        return this.args;
    }

    public toString() {
        return '"' + this.exe + '" "' + this.args.join('" "') + '"';
    }
}

class CC1Command extends Command {
    public input?: string;
    public output?: string;
    public language?: string;

    constructor(commands: string[]) {
        let language = commands[commands.indexOf("-x") + 1];
        let input = commands[commands.indexOf("-x") + 2];
        let output = commands[commands.indexOf("-o") + 1];
        commands.splice(commands.indexOf("-x"), 3);
        commands.splice(commands.indexOf("-o"), 2);
        super(commands);
        this.input = input;
        this.output = output;
        this.language = language;
    }

    public getArgs(): string[] {
        let args = [];
        if (this.output) { args.push("-o", this.output); }
        if (this.language) { args.push("-x", this.language); }
        if (this.input) { args.push(this.input); }
        return this.args.concat();
    }

    public toString() {
        return super.toString() +
            (this.output ? '"-o" "' + this.output + '"' : "") +
            (this.language ? '"-x" "' + this.language + '"' : "") +
            (this.input ? '"' + this.input + '"' : "");
    }
}

class ClangCommand extends Command {
    public input: string[];
    public output?: string;
    public subCommands: Command[] = [];
    public linkCommand?: Command;

    constructor(commands: string[]) {
        // get output file
        let output = commands[commands.indexOf("-o") + 1];
        commands.splice(commands.indexOf("-o"), 2);

        // get input files
        let input: string[] = [];
        let cppName = RegExp("\.(C|c|cpp|cxx|cc|c\\+\\+)$");
        for (let i = 0; i < commands.length; i++) {
            if (cppName.test(commands[i])) {
                input.push(commands[i]);
                commands[i] = "";
            }
        }
        commands = commands.filter((value) => { return value !== ""; });

        // get mode configuaration
        let modeRe = RegExp("-fsyntax-only|-S|-c|-E");
        let mode = commands.find((value) => { return value.match(modeRe); });        

        super(commands);
        this.output = output;
        this.input = input;

        if (mode) { this.mode = mode; }
    }

    public async getRealCommands() {

        const { stdout, stderr } = await this.run(["-###"]);
        console.log("stderr of get real command: ", stdout, stderr);

        function findCommand(cmd: string): string[] {
            let lines = cmd.split(/\r?\n/);
            let realCommand = lines[4].trim();
            let k = 5;
            while (!realCommand.startsWith("\"") && k < lines.length) {
                realCommand = lines[k++].trim();
            }
            console.log("realCommand: " + realCommand);
            realCommand = realCommand.substring(1, realCommand.length - 1);
            return realCommand.split("\" \"");
        }

        if (stderr !== "") {
            return findCommand(stderr);
        } else if (stdout !== "") {
            return findCommand(stdout);
        } else {
            return [];
        }
    }

    public getArgs(): string[] {
        return [];
    }

    bOutputToStdout = false;
    bDebug = false;
    bFilter?:string; 
    bPrintBefore = false;
    bPrintAfter = false;
    mode?: string;
}

class LLDCommand extends Command {
}

class NVCCCommand extends Command {
}


export class CommandEnv {
    constructor(workDir?: string, env?: NodeJS.ProcessEnv) {
        // if not specified, use the first workspace folder
        // if not open any workspace folder, use the current working directory of process
        if (workDir) {
            this.workdir = workDir;
        } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            this.workdir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        } else {
            this.workdir = process.cwd();
        }

        // if not specified, use the current process env
        if (env) {
            this.env = env;
        } else { 
            this.env = process.env; 
        }
    }

    public async run(exe: string, args: string[]): Promise<{ code: number | null, stdout: string, stderr: string }> {
        return new Promise((resolve, reject) => {
            let stderr: string[] = [];
            let stdout: string[] = [];
            const run = spawn(exe, args, { cwd: this.workdir, env: this.env });
            run.stderr.on('data', (data) => {
                stderr.push(data);
            });
            run.stdout.on('data', (data) => {
                stdout.push(data);
            });
            run.on('close', (code) => {
                resolve({ code: code, stdout: stdout.join(""), stderr: stderr.join("") });
            });
            run.on('error', (err) => {
                reject(err);
            });
        });
    }

    static defaultEnv?: CommandEnv;
    static getDefault(): CommandEnv {
        if (!CommandEnv.defaultEnv) {
            CommandEnv.defaultEnv = new CommandEnv();
        }
        return CommandEnv.defaultEnv;
    }

    private workdir?: string;
    private env?: NodeJS.ProcessEnv;
}
