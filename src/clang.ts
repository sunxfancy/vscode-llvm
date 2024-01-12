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
        let clangNames = RegExp("(clang|clang\\+\\+|clang-cpp)(-[0-9]+(\\.[0-9]+)?)?(\.exe)?$");
        let lldNames = RegExp("(ld.lld|ld64.lld|lld|lld-link)(\.exe)?$");
        let nvccNames = RegExp("(nvcc)(\.exe)?$");
        let gccNames = RegExp("(gcc|g\\+\\+)(-[0-9]+(\\.[0-9]+)?)?(\.exe)?$");
        let clNames = RegExp("(cl)(\.exe)?$");
        let ciccNames = RegExp("(cicc)(\.exe)?$");
        let ptxasNames = RegExp("(ptxas)(\.exe)?$");
        let cudafeNames = RegExp("(cudafe)(\\+\\+)?(\.exe)?$");
        let nvlinkNames = RegExp("(nvlink)(\.exe)?$");
        let fatbinaryNames = RegExp("(fatbinary)(\.exe)?$");
        let eraseNames = RegExp("(erase|rm)(\.exe)?$");
        let resourceNames = RegExp("(resource)(\.exe)?$");

        if (clangNames.test(commands[0])) {
            // if this is cc1 command, then we can directly create it
            if (commands.indexOf("-cc1") !== -1) {
                return new CC1Command(commands);
            }

            // for clang command, we need to get the real command by running with '-###'
            let clangCmd = new ClangCommand(commands);
            clangCmd.addSubCommands(await clangCmd.getRealCommands());
            return clangCmd;
        } else if (lldNames.test(commands[0])) {
            return new LLDCommand(commands);
        } else if (nvccNames.test(commands[0])) {
            let nvccCmd = new NVCCCommand(commands);
            nvccCmd.addSubCommands(await nvccCmd.getRealCommands());
            return nvccCmd;
        } else if (gccNames.test(commands[0])) {
            return new GCCCommand(commands);
        } else if (clNames.test(commands[0])) {
            return new CLCommand(commands);
        } else if (ciccNames.test(commands[0])) {
            return new CICCCommand(commands);
        } else if (ptxasNames.test(commands[0])) {
            return new PTXASCommand(commands);
        } else if (cudafeNames.test(commands[0])) {
            return new CUDAFECommand(commands);
        } else if (nvlinkNames.test(commands[0])) {
            return new NVLinkCommand(commands);
        } else if (fatbinaryNames.test(commands[0])) {
            return new FatbinaryCommand(commands);
        } else if (eraseNames.test(commands[0])) {
            return new EraseCommand(commands);
        } else if (resourceNames.test(commands[0])) {
            return new ResourceCommand(commands);
        } else {
            return new Command(commands);
        }
    }

    // This function will correctly parse the command string
    public static async createFromString(cmd: string): Promise<Command | undefined> {
        let commands = parseShellArg(cmd);
        if (!commands) { return undefined; }
        return Command.create(commands);
    }

    public async run(addition?: string[], stdin?: string): Promise<{ code: number | null, stdout: string, stderr: string }> {
        let env = this.env;
        if (env === undefined) {
            env = CommandEnv.getDefault();
        }
        let args = this.getArgs();
        if (addition) {
            args = args.concat(addition);
        }
        return env.run(this.exe, args, stdin);
    }
    public getInputPath(): string | undefined { return undefined; }
    public getOutputPath(): string | undefined { return undefined; }
    public setFilter(filter: string) { }

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

    public getType(): string {
        return "Command";
    }

    public async addSubCommands(realCommands: string[]) {
        for (let cmd of realCommands) {
            let args = parseShellArg(cmd);
            if (args) {
                let subCommand = await Command.create(args);
                if (subCommand) { this.pushSubCommand(subCommand); }
            }
        }
    }

    public pushSubCommand(command: Command) {
    }
}

export class CC1Command extends Command {
    public input?: string;
    public output?: string;
    public language?: string;
    public mode?: string;

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

        let modeRe = RegExp("-E|-S|-emit-llvm|-emit-llvm-bc");
        this.mode = commands.find((value) => { return value.match(modeRe); });
    }

    public getArgs(): string[] {
        let args = [];
        if (this.output) { args.push("-o", this.output); }
        if (this.language) { args.push("-x", this.language); }
        if (this.input) { args.push(this.input); }
        return this.args.concat(args);
    }

    public getInputPath() {
        return this.input;
    }

    public getOutputPath() {
        return this.output;
    }

    public toString() {
        return super.toString() +
            (this.output ? '"-o" "' + this.output + '"' : "") +
            (this.language ? '"-x" "' + this.language + '"' : "") +
            (this.input ? '"' + this.input + '"' : "");
    }

    public getType(): string {
        return "CC1Command";
    }
}

export class ClangCommand extends Command {
    public input: string[];
    public output?: string;
    public subCommands: Command[] = [];

    constructor(commands: string[]) {
        // get output file
        let outputIdx = commands.indexOf("-o");
        let output = undefined;
        if (outputIdx !== -1) {
            output = commands[outputIdx + 1];
            commands.splice(outputIdx, 2);
        }

        // get input files
        let input: string[] = [];
        let cppName = RegExp("\\.(C|c|cpp|cxx|cc|c\\+\\+)$");
        for (let i = 0; i < commands.length; i++) {
            if (cppName.test(commands[i])) {
                input.push(commands[i]);
                commands[i] = "";
            }
        }
        commands = commands.filter((value) => { return value !== ""; });

        // get mode configuration
        let modeRe = RegExp("-S|-c|-E");
        let mode = commands.find((value) => { return value.match(modeRe); });

        super(commands);
        this.output = output;
        this.input = input;
        
        if (mode) { this.mode = mode; }
        if (output != undefined) this.bOutputToStdout = false;
    }

    public async getRealCommands() {
        const { stdout, stderr } = await this.run(["-###"]);
        console.log("stderr of get real command: ", stdout, stderr);

        let cmd: string;
        if (stderr !== "") {
            cmd = stderr;
        } else if (stdout !== "") {
            cmd = stdout;
        } else {
            return [];
        }

        let lines = cmd.split(/\r?\n/);
        let k = 4;
        while (k < lines.length && !lines[k] && !lines[k].trim().startsWith("\"")) {
            k++;
        }
        return lines.slice(k);
    }

    public getArgs(): string[] {
        let args = this.args;

        if (args.indexOf("-S") === -1) {
            args = args.concat(["-S"]);
        }

        if (this.bDebug && args.indexOf('-g') === -1) {
            args = args.concat(["-g"]);
        }

        if (this.bDumpAST && args.indexOf('-ast-dump') === -1) {
            args = args.concat(["-Xclang", "-ast-dump"]);
        }

        if (this.bDisableOptnone && args.indexOf('-disable-O0-optnone') === -1) {
            args = args.concat(["-Xclang", "-disable-O0-optnone"]);
        }

        if (this.bSaveTemps && args.indexOf('-save-temps') === -1) {
                    args = args.concat(["-save-temps=obj"]);
        }

        if (this.sFilter) {
            args = args.concat(["-mllvm", "-filter-print-funcs=" + this.sFilter]);
        }

        if (this.bPrintModuleScope && args.indexOf('-print-module-scope') === -1) {
            args = args.concat(["-mllvm", "-print-module-scope"]);
        }

        if (this.bPrintBefore && args.indexOf('-print-before-all') === -1) {
            args = args.concat(["-mllvm", "-print-before-all"]);
        }

        if (this.bPrintAfter && args.indexOf('-print-after-all') === -1) {
            args = args.concat(["-mllvm", "-print-after-all"]);
        }

        if (this.bOutputToStdout)
            args = args.concat(["-o", "-"]);
        else {
            if (this.output === undefined) 
                this.output = this.input[0] + ".s";
            args = args.concat(["-o", this.output]);
        }

        if (this.bInputFromStdin == false && this.input.length > 0) {
            args = args.concat(this.input);
        }

        return args;
    }

    public getInputPath(): string | undefined {
        if (this.input.length > 0) {
            return this.input[0];
        }
        return undefined;
    }
    public getOutputPath(): string | undefined {
        if (this.bOutputToStdout) return '-';
        return this.output;
    }

    public isInputFromStdin(): boolean {
        return this.bInputFromStdin || this.input.length === 0;
    }

    public isOutputToStdout(): boolean {
        return this.bOutputToStdout || this.output === undefined;
    }

    public setFilter(filter: string) { this.sFilter = filter; }

    public getType(): string {
        return "ClangCommand";
    }

    public pushSubCommand(command: Command) {
        this.subCommands.push(command);
    }

    // Here is a list of configurable options
    public bInputFromStdin = false;
    public bSaveTemps = true;
    public bOutputToStdout = true;
    public bDisableOptnone = true;
    public bDebug = true;
    public sFilter?: string;
    public bPrintModuleScope = true;
    public bPrintBefore = true;
    public bPrintAfter = true;
    public bDumpAST = false;
    public mode?: string;
}

export class LLDCommand extends Command {
    public input: string[];
    public output?: string;

    constructor(commands: string[]) {
        // get output file
        let outputIdx = commands.indexOf("-o");
        let output = undefined;
        if (outputIdx !== -1) {
            output = commands[outputIdx + 1];
            commands.splice(outputIdx, 2);
        }

        // get input files
        let input: string[] = [];
        let obj = RegExp("\\.(o)$");
        for (let i = 0; i < commands.length; i++) {
            if (obj.test(commands[i])) {
                input.push(commands[i]);
                commands[i] = "";
            }
        }
        commands = commands.filter((value) => { return value !== ""; });

        super(commands);
        this.output = output;
        this.input = input;
    }

    public getType(): string {
        return "LLDCommand";
    }
}

export class CLCommand extends Command {
    public input: string[];
    public output?: string;

    constructor(commands: string[]) {
        // get output file
        let outputIdx = commands.indexOf(">");
        let output = undefined;
        if (outputIdx !== -1) {
            output = commands[outputIdx + 1];
            commands.splice(outputIdx, 2);
        } else {
            outputIdx = commands.findIndex((value) => value.startsWith("-Fo"));
            if (outputIdx !== -1) {
                output = commands[outputIdx].substring(3);
                commands.splice(outputIdx, 1);
            }
        }

        // get input files
        let input: string[] = [];
        let clInput = RegExp("\\.(cu|cpp|stub)$");
        for (let i = 0; i < commands.length; i++) {
            if (clInput.test(commands[i])) {
                input.push(commands[i]);
                commands[i] = "";
            }
        }
        commands = commands.filter((value) => { return value !== ""; });

        super(commands);
        this.output = output;
        this.input = input;
    }

}

export class GCCCommand extends Command {
    public input: string[];
    public output?: string;

    constructor(commands: string[]) {
        // get output file
        let outputIdx = commands.indexOf("-o");
        let output = undefined;
        if (outputIdx !== -1) {
            output = commands[outputIdx + 1];
            commands.splice(outputIdx, 2);
        }

        // get input files
        let input: string[] = [];
        let obj = RegExp("\\.(cu|cpp|stub)$");
        for (let i = 0; i < commands.length; i++) {
            if (obj.test(commands[i])) {
                input.push(commands[i]);
                commands[i] = "";
            }
        }
        commands = commands.filter(value => value !== "");

        super(commands);
        this.output = output;
        this.input = input;
    }
}

export class CICCCommand extends Command {
    public input?: string;
    public output?: string;

    public orig_src_path_name?: string;
    public include_file_name?: string;
    public module_id_file_name?: string;
    public gen_c_file_name?: string;
    public stub_file_name?: string;
    public gen_device_file_name?: string;

    constructor(commands: string[]) {
        let orig_src_path_name = commands[commands.indexOf("--orig_src_path_name") + 1];
        let include_file_name = commands[commands.indexOf("--include_file_name") + 1];
        let module_id_file_name = commands[commands.indexOf("--module_id_file_name") + 1];
        let gen_c_file_name = commands[commands.indexOf("--gen_c_file_name") + 1];
        let stub_file_name = commands[commands.indexOf("--stub_file_name") + 1];
        let gen_device_file_name = commands[commands.indexOf("--gen_device_file_name") + 1];

        commands.splice(commands.indexOf("--orig_src_path_name"), 2);
        commands.splice(commands.indexOf("--include_file_name"), 2);
        commands.splice(commands.indexOf("--module_id_file_name"), 2);
        commands.splice(commands.indexOf("--gen_c_file_name"), 2);
        commands.splice(commands.indexOf("--stub_file_name"), 2);
        commands.splice(commands.indexOf("--gen_device_file_name"), 2);

        // get input file
        let ii = RegExp("\\.cpp1.ii$");
        let idx = commands.findIndex(value => ii.test(value));
        let input = undefined;
        if (idx === -1) {
            input = commands[idx];
            commands.splice(idx, 1);
        }

        // get output file
        let outputIdx = commands.indexOf("-o");
        let output = undefined;
        if (outputIdx !== -1) {
            output = commands[outputIdx + 1];
            commands.splice(outputIdx, 2);
        }

        super(commands);
        this.input = input;
        this.orig_src_path_name = orig_src_path_name;
        this.include_file_name = include_file_name;
        this.module_id_file_name = module_id_file_name;
        this.gen_c_file_name = gen_c_file_name;
        this.stub_file_name = stub_file_name;
        this.gen_device_file_name = gen_device_file_name;
    }
}

export class PTXASCommand extends Command {
    public input?: string;
    public output?: string;

    constructor(commands: string[]) {
        // get output file
        let outputIdx = commands.indexOf("-o");
        let output = undefined;
        if (outputIdx !== -1) {
            output = commands[outputIdx + 1];
            commands.splice(outputIdx, 2);
        }

        // get input file
        let ii = RegExp("\\.ptx$");
        let idx = commands.findIndex(value => ii.test(value));
        let input = undefined;
        if (idx === -1) {
            input = commands[idx];
            commands.splice(idx, 1);
        }

        super(commands);
        this.input = input;
        this.output = output;
    }

}

export class CUDAFECommand extends Command {
    public input: string;
    public gen_c_file_name: string;
    public stub_file_name: string;
    public module_id_file_name: string;

    constructor(commands: string[]) {
        // get output files
        let gen_c_file_name = commands[commands.indexOf("--gen_c_file_name") + 1];
        let stub_file_name = commands[commands.indexOf("--stub_file_name") + 1];
        let module_id_file_name = commands[commands.indexOf("--module_id_file_name") + 1];
        commands.splice(commands.indexOf("--gen_c_file_name"), 2);
        commands.splice(commands.indexOf("--stub_file_name"), 2);
        commands.splice(commands.indexOf("--module_id_file_name"), 2);

        // get input file
        let ii = RegExp("\\.cpp4.ii$");
        let idx = commands.findIndex(value => ii.test(value));
        let input = commands[idx];
        commands.splice(idx, 1);

        super(commands);
        this.input = input;
        this.gen_c_file_name = gen_c_file_name;
        this.stub_file_name = stub_file_name;
        this.module_id_file_name = module_id_file_name;

    }
}

export class NVLinkCommand extends Command {
    

}

export class FatbinaryCommand extends Command {
    public input: string[];
    public output?: string;

    constructor(commands: string[]) {

        // get output file
        let out = RegExp("^--embedded-fatbin=(.*)$");
        let idx = commands.findIndex(value => out.test(value));
        let output = undefined;
        if (idx !== -1) {
            output = commands[idx].substring(19);
            commands.splice(idx, 1);
        }
        
        // get input files
        let input: string[] = [];
        let obj = RegExp("\\.(cubin|ptx)$");
        for (let i = 0; i < commands.length; i++) {
            if (obj.test(commands[i])) {
                input.push(commands[i]);
                commands[i] = "";
            }
        }
        commands = commands.filter(value => value !== "");

        super(commands);
        this.input = input;
        this.output = output;
    }

}

export class EraseCommand extends Command {
    public path?: string;

}

export class ResourceCommand extends Command {
    public file: string;

    constructor(commands: string[]) {
        let path = commands[commands.indexOf('file')+1];
        path = path.substring(0, path.length-1);
        commands.splice(commands.indexOf('file'), 2);

        // remove the []
        commands[1] = commands[1].substring(1);
        let last = commands[commands.length-1];
        commands[commands.length-1] = last.substring(0, last.length-1);

        super(commands);
        this.file = path;
    }
}

export class NVCCCommand extends Command {

    public subCommands: Command[] = [];

    public getType(): string {
        return "NVCCCommand";
    }

    public pushSubCommand(command: Command) {
        this.subCommands.push(command);
    }

    public async getRealCommands() {
        const { stdout, stderr } = await this.run(["-v", "--dryrun"]);
        console.log("stderr of get real command: ", stdout, stderr);

        let cmd: string;
        if (stderr !== "") {
            cmd = stderr;
        } else if (stdout !== "") {
            cmd = stdout;
        } else {
            return [];
        }

        let lines = cmd.split(/\r?\n/);
        let k = 16;
        let results = [];
        while (k < lines.length && lines[k] && lines[k].startsWith("#$ ")) {
            results.push(lines[k].substring(3).trim());
            k++;
        }
        return results;
    }

    
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

    public async run(exe: string, args: string[], stdin?: string): Promise<{ code: number | null, stdout: string, stderr: string }> {
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
            if (stdin) {
                run.stdin.write(stdin);
                run.stdin.end();
            }
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
