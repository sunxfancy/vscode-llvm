import { readFileSync } from 'fs';
import { CC1Command, ClangCommand, Command, CommandEnv } from './clang';
import { LLVMPipelineTreeDataProvider } from './pipeline-panel';
import { splitURI } from './utils';
import { AsmDocument } from './document';
import * as vscode from 'vscode';
import { on } from 'events';
import * as path from 'path';

export class Pass {
    public same: boolean;

    constructor(
        public parent: Pipeline,
        public name: string,
        public before_ir: string,
        public after_ir: string,
        public index: number,
        public backend: boolean) {
        this.same = before_ir == after_ir;
    }
}


export class Pipeline {
    public raw_command: string;
    public command: Command;

    public input: string = "";
    public output: string = "";
    public ast: string = "";
    public preprocessed: string = "";
    public llvm: string = "";

    public passList: Pass[] = [];
    public backendList: Pass[] = [];

    constructor(raw: string, cmd: Command,) {
        this.raw_command = raw;
        this.command = cmd;
    }

    public encodeCommand() {
        return encodeURIComponent(this.raw_command.replace(/\//g, "%2F"));
    }

    public async run() {
        const { stdout, stderr } = await this.command.run();
        
        // First, get the output ASM from the command
        // if the command has specified an output file, read that
        // otherwise, read the stdout
        let output_path = this.command.getOutputPath();
        if (output_path == '-' || output_path == undefined)
            this.output = stdout;
        else 
            this.output = readFileSync(output_path).toString();

        // Then, we should parse the LLVM dump data in stderr
        this.parseLLVMDumpChanged(stderr);

        // Get the human-readable LLVM IR 
        if (this.command instanceof ClangCommand) {
            let c = this.command as ClangCommand;
            c.subCommands.forEach(async (cmd) => {
                if (cmd instanceof CC1Command) {
                    let output = cmd.getOutputPath();
                    if (cmd.mode == "-E" && output) {
                        this.preprocessed = readFileSync(output).toString();
                    }
                    if (cmd.mode == "-emit-llvm-bc" && output) {
                        let convertCmd = await Command.createFromString(
                            'clang -S -emit-llvm "' + output + '" -o -');
                        if (convertCmd) {
                            const { stdout, stderr } = await convertCmd.run();
                            this.llvm = stdout;
                        }
                    }
                }
            });
        }

        // Get the AST
        if (this.command instanceof ClangCommand) {
            let c = this.command as ClangCommand;
            let cmd = await Command.createFromString(
                "clang -fsyntax-only " + c.args.join(" ") + " " + c.input.join(" "));
            if (cmd) {
                let clangCmd = cmd as ClangCommand;
                clangCmd.bDumpAST = true;
                clangCmd.bDebug = false;
                clangCmd.bDisableOptnone = false;
                clangCmd.bPrintAfter = false;
                clangCmd.bPrintBefore = false;
                clangCmd.bPrintModuleScope = false;
                clangCmd.bSaveTemps = false;
                const { stdout, stderr } = await cmd.run();
                this.ast = stdout;
            }
        }

        let input = this.command.getInputPath();
        let index = input?.lastIndexOf('.');
        let path = input?.substring(0, index);
        if (!path) { return; }
        this.preprocessed = readFileSync(path + ".i").toString();
        // this.llvm = readFileSync(path + ".ll").toString();
    }

    public parseLLVMDump(data: string) {
        const re = /^(# )?\*\*\* (.+) \*\*\*\s*(\(function\: ([^\)]+)\))?\:?\s*$/m;
        let pass = data.split(re);

        for (let i = 1; i < pass.length; i += 10) {
            let sharp = pass[i];
            let name = pass[i + 1];
            let func_name = pass[i + 3];
            let ir = pass[i + 4];
            let sharp2 = pass[i + 5];
            let name2 = pass[i + 6];
            let func_name2 = pass[i + 8];
            let ir2 = pass[i + 9];

            if (name.substring(15) !== name2.substring(14)) {
                console.log("name mismatch: " + name + " " + name2);
            }

            if (sharp === undefined) {
                if (sharp2 !== undefined) {
                    console.log("sharp mismatch: " + sharp + " " + sharp2);
                }
                this.passList.push(new Pass(
                    this, name.substring(15), ir, ir2, this.passList.length, false));
            } else {
                if (sharp !== "# ") {
                    console.log("sharp mismatch: " + sharp + " " + sharp2);
                }
                this.backendList.push(new Pass(
                    this, name.substring(15), ir, ir2, this.backendList.length, true));
            }
        }
    }

    public parseLLVMDumpChanged(data: string) {
        const re = /^(# )?\*\*\* (.+) \*\*\*\s*(\(function\: ([^\)]+)\))?\:?\s*$/m;
        const isMachineCode = /^# Machine code for function (.+)$/m;
        let pass = data.split(re);
        let last_ir = "";
        for (let i = 1; i < pass.length; i += 5) {
            let sharp = pass[i];
            let name = pass[i + 1];
            let func_name = pass[i + 3];
            let ir = pass[i + 4].trim();
            if (ir == '') ir = last_ir;

            if (!isMachineCode.test(ir)) {
                this.passList.push(new Pass(
                    this, name, last_ir, ir, this.passList.length, false));
            } else {
                this.backendList.push(new Pass(
                    this, name, last_ir, ir, this.backendList.length, true));
            }
            
            last_ir = ir;
        }
    }
    public isCompare() {
        return false;
    }
}

export class ComparedPipeline extends Pipeline {
    constructor(raw: string, cmd: Command,
        public linked_pipeline?: Pipeline, public linked_pipeline2?: Pipeline) {
        super(raw, cmd);
    }

    public isCompare() {
        return true;
    }
}

export class FileWatcher {
    public path: string;
    public watcher: vscode.FileSystemWatcher;
    public dependentDocuments: vscode.TextDocument[] = [];

    constructor(private core: Core, path: string) {
        this.path = path;
        this.watcher = vscode.workspace.createFileSystemWatcher(path, false, false, true);
        this.watcher.onDidChange(this.onDidChange, this);
        this.watcher.onDidCreate(this.onDidChange, this);
    }
    
    onDidChange() {
        console.log("onDidChange", this.path);
        this.dependentDocuments.forEach(doc => {
            let { pipeline, catergory, index } = splitURI(doc.uri);
            this.core.runWithProgress(this.core.get(pipeline) as Pipeline);
        });
    }
}

export class DocumentWatcher {
    private inputFiles = new Map<string, FileWatcher>();
    private openURIs : vscode.Uri[] = [];

    constructor(private core: Core, subscriptions: vscode.Disposable[]) {
        core.watcher = this;
        subscriptions.push(vscode.workspace.onDidOpenTextDocument(
            this.onDidOpenTextDocument, this));
        subscriptions.push(vscode.workspace.onDidCloseTextDocument(
            this.onDidCloseTextDocument, this));
    }

    onDidOpenTextDocument(doc: vscode.TextDocument) {
        if (doc.uri.scheme !== 'vscode-llvm') return;
        this.openURIs.push(doc.uri);

        let { pipeline, catergory, index } = splitURI(doc.uri);
        if (pipeline) {
            let file = this.core.get(pipeline)?.command.getInputPath() as string;
            file = path.resolve(file);
            if (this.inputFiles.has(file)) {
                this.inputFiles.get(file)?.dependentDocuments.push(doc);
            } else {
                console.log("create new watcher for " + file);
                let watcher = new FileWatcher(this.core, file);
                watcher.dependentDocuments.push(doc);
                this.inputFiles.set(file, watcher);
            }
        }
    }

    onDidCloseTextDocument(doc: vscode.TextDocument) {
        if (doc.uri.scheme !== 'vscode-llvm') return;
        let d = this.openURIs.indexOf(doc.uri);
        if (d >= 0) { this.openURIs.splice(d, 1); }

        let { pipeline, catergory, index } = splitURI(doc.uri);
        if (pipeline) {
            let file = this.core.get(pipeline)?.command.getInputPath() as string;
            file = path.resolve(file);
            let watcher = this.inputFiles.get(file);
            if (!watcher) { return; }
            let index = watcher.dependentDocuments.indexOf(doc);
            if (index >= 0) {
                watcher.dependentDocuments.splice(index, 1);
                if (watcher.dependentDocuments.length === 0) {
                    watcher.watcher.dispose();
                    this.inputFiles.delete(file);
                }
            }
        }
    }

}

export class Core {
    public watcher?: DocumentWatcher;
    private pipelines: Map<string, Pipeline> = new Map();
    public active?: Pipeline;
    private provider?: LLVMPipelineTreeDataProvider;
    public filter = "";

    public get(cmd: string) {
        return this.pipelines.get(cmd);
    }

    public setProvider(provider: LLVMPipelineTreeDataProvider) {
        this.provider = provider;
    }

    public async runPipeline(cmd: string, cenv?: CommandEnv) {
        let command = await Command.createFromString(cmd);
        if (!command) { return; }
        if (cenv) { command.env = cenv; }
        if (this.filter != "") { command.setFilter(this.filter); }
        let pipeline = new Pipeline(cmd, command);
        this.pipelines.set(cmd, pipeline);
        this.active = pipeline;
        await this.runWithProgress(this.active);
        this.provider?.refresh();
    }

    // This method is called when a command is selected from the command palette
    // It will ensure that the pipeline is running at once or already have been run
    public async ensurePipeline(cmd: string, cenv?: CommandEnv) {
        if (this.pipelines.has(cmd)) {
            this.active = this.pipelines.get(cmd);
            this.provider?.refresh();
            return;
        }
        await this.runPipeline(cmd, cenv);
    }

    public async comparePipeline(cmd1: string, cmd2: string, cenv?: CommandEnv) {
        let cmd = cmd1 + " vs " + cmd2;
        if (this.pipelines.has(cmd)) {
            this.active = this.pipelines.get(cmd);
            this.provider?.refresh();
            return;
        }

        await this.ensurePipeline(cmd1, cenv);
        await this.ensurePipeline(cmd2, cenv);
        let command = await Command.createFromString("compare");
        if (!command) { return; }

        let pipeline = new ComparedPipeline(cmd, command,
            this.pipelines.get(cmd1), this.pipelines.get(cmd2));
        this.pipelines.set(cmd, pipeline);
        this.active = pipeline;
        this.provider?.refresh();
    }

    public async runWithProgress(pipeline: Pipeline) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            cancellable: true,
            title: 'Run Clang Command'
        }, async (progress) => {
            progress.report({ increment: 0 });
            if (pipeline) await pipeline.run();
            progress.report({ increment: 100 });
        });
    }

    // run debug-only for a pass and filiter the output for that one
    public async debugOnePass(pass: Pass) {

    }

}


export class PipelineContentProvider implements vscode.TextDocumentContentProvider {
    constructor(private core: Core, subscriptions: vscode.Disposable[]) {
        subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(
            PipelineContentProvider.scheme, this));
    }

    public static readonly scheme = 'vscode-llvm';

    provideTextDocumentContent(uri: vscode.Uri) {
        console.log("provideTextDocumentContent", uri);
        let { pipeline, catergory, index } = splitURI(uri);

        if (catergory == 'output') {
            return this.provideAsmDocument(uri)?.value;
        } else if (catergory == 'ast') {
            return this.core.get(pipeline)?.ast;
        } else if (catergory == 'preprocessed') {
            return this.core.get(pipeline)?.preprocessed;
        } else if (catergory == 'llvm') {
            return this.core.get(pipeline)?.llvm;
        } else if (catergory == 'before') {
            return this.core.get(pipeline)?.passList[index].before_ir;
        } else if (catergory == 'after') {
            return this.core.get(pipeline)?.passList[index].after_ir;
        } else if (catergory == 'before-b') {
            return this.core.get(pipeline)?.backendList[index].before_ir;
        } else if (catergory == 'after-b') {
            return this.core.get(pipeline)?.backendList[index].after_ir;
        }
    }

    private _documents = new Map<string, AsmDocument>();
    provideAsmDocument(uri: vscode.Uri): AsmDocument | undefined{
        let document = this._documents.get(uri.path);
        if (!document) {
            let { pipeline, catergory, index } = splitURI(uri);

            if (catergory == 'output') {
                let output = this.core.get(pipeline)?.output;
                if (!output) { return; }
                document = new AsmDocument(uri, output);
                this._documents.set(uri.path, document);
            }
        }
        return document;
    }

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }
}