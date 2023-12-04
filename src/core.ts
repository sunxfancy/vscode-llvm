import { readFileSync } from 'fs';
import { CC1Command, ClangCommand, Command, CommandEnv } from './clang';
import { LLVMPipelineTreeDataProvider } from './pipeline-panel';
import { splitURI } from './utils';
import { AsmDocument } from './document';
import * as vscode from 'vscode';

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

    public async run() {
        const { stdout, stderr } = await this.command.run();
        this.output = stdout;
        this.parseLLVMDump(stderr);

        if (this.command instanceof ClangCommand) {
            let c = this.command as ClangCommand;
            c.subCommands.forEach(async (cmd) => {
                if (cmd instanceof CC1Command) {
                    let output = cmd.getOutputPath();
                    if (cmd.mode == "-E" && output) {
                        this.preprocessed = readFileSync(output).toString();
                    }
                    if (cmd.mode == "-emit-llvm-bc" && output) {
                        let convertCmd = await Command.createfromString(
                            'clang -S -emit-llvm "' + output + '" -o -');
                        if (convertCmd) {
                            const { stdout, stderr } = await convertCmd.run();
                            this.llvm = stdout;
                        }
                    }
                }
            });
        }

        let input = this.command.getInputPath();
        let index = input?.lastIndexOf('.');
        let path = input?.substring(0, index);
        if (!path) { return; }
        this.preprocessed = readFileSync(path + ".i").toString();
        this.llvm = readFileSync(path + ".ll").toString();
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

export class Core {

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
        let command = await Command.createfromString(cmd);
        if (!command) { return; }
        if (cenv) { command.env = cenv; }
        if (this.filter != "") { command.setFilter(this.filter); }
        let pipeline = new Pipeline(cmd, command);
        this.pipelines.set(cmd, pipeline);
        this.active = pipeline;
        await this.runWithProgress();
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
        let command = await Command.createfromString("compare");
        if (!command) { return; }

        let pipeline = new ComparedPipeline(cmd, command,
            this.pipelines.get(cmd1), this.pipelines.get(cmd2));
        this.pipelines.set(cmd, pipeline);
        this.active = pipeline;
        this.provider?.refresh();
    }

    public async runWithProgress() {
        let pipeline = this.active;
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