import { promises as fs } from 'fs';
import * as os from 'os';
import { ClangCommand, Command, CommandEnv } from './clang';
import { LLVMPipelineTreeDataProvider } from './pipeline-panel';
import { splitURI } from './utils';
import { AsmDocument } from './document';
import { AsmWorkerClient, ParseCancelledError } from './asm-worker-client';
import * as vscode from 'vscode';
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

    // Each refresh builds an isolated result; only the scheduler publishes it.
    public async run(categories = new Set(['output', 'passes', 'ast', 'llvm', 'preprocessed']),
        source?: string) {
        const original = this.command;
        let temporary: string | undefined;
        let command = original;
        try {
            if (original instanceof ClangCommand) {
                const clang = new ClangCommand([original.exe, ...original.args,
                    ...original.input]);
                Object.assign(clang, original);
                clang.args = original.args.filter(arg => !['-S', '-c', '-E', '-emit-llvm'].includes(arg));
                clang.env = original.env || CommandEnv.getDefault();
                clang.bSaveTemps = false;
                clang.bOutputToStdout = true;
                clang.bPrintChanged = categories.has('passes');
                clang.bPrintBefore = false;
                clang.bPrintAfter = false;
                command = clang;
                if (source !== undefined && original.getInputPath()) {
                    temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'vscode-llvm-'));
                    const input = path.resolve(clang.env.workdir || process.cwd(), original.getInputPath()!);
                    const contents = path.join(temporary, 'source');
                    await fs.writeFile(contents, source);
                    const overlay = path.join(temporary, 'overlay.json');
                    await fs.writeFile(overlay, JSON.stringify({ version: 0,
                        roots: [{ type: 'file', name: input, 'external-contents': contents,
                            'use-external-name': false }] }));
                    clang.args.push('-ivfsoverlay', overlay);
                }
            }
            const execute = async (cmd: Command) => {
                const result = await cmd.run();
                if (result.code !== 0) throw new Error(result.stderr || 'Compiler command failed');
                return result;
            };
            if (categories.has('output') || categories.has('passes') || !(command instanceof ClangCommand)) {
                const { stdout, stderr } = await execute(command);
                const output = command.getOutputPath();
                this.output = !output || output === '-' ? stdout : await fs.readFile(output, 'utf8');
                this.passList = [];
                this.backendList = [];
                if (categories.has('passes')) this.parseLLVMDumpChanged(stderr);
            }
            if (command instanceof ClangCommand) {
                command.bPrintChanged = false;
                command.bPrintModuleScope = false;
                // Auxiliary views are compiled only when requested.
                if (categories.has('llvm')) {
                    const saved = command.args;
                    command.args = [...saved, '-emit-llvm'];
                    this.llvm = (await execute(command)).stdout;
                    command.args = saved;
                }
                if (categories.has('ast')) {
                    const saved = command.args;
                    command.args = saved.filter(arg => !['-S', '-c', '-E', '-emit-llvm'].includes(arg));
                    command.args.push('-fsyntax-only');
                    command.bDumpAST = true;
                    this.ast = (await execute(command)).stdout;
                    command.bDumpAST = false;
                    command.args = saved;
                }
                if (categories.has('preprocessed')) {
                    command.args = command.args.filter(arg => !['-S', '-c', '-emit-llvm'].includes(arg));
                    command.args.push('-E');
                    this.preprocessed = (await execute(command)).stdout;
                }
            }
        } finally {
            if (temporary) await fs.rm(temporary, { recursive: true, force: true });
        }
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
        this.passList = [];
        this.backendList = [];
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

export class DocumentWatcher implements vscode.Disposable {
    private timers = new Map<Pipeline, ReturnType<typeof setTimeout>>();
    private versions = new Map<Pipeline, number>();
    private running = new Set<Pipeline>();
    private dirty = new Set<Pipeline>();
    private files = new Map<string, vscode.FileSystemWatcher>();
    private disposed = false;

    constructor(private core: Core, subscriptions: vscode.Disposable[]) {
        core.watcher = this;
        subscriptions.push(this,
            vscode.workspace.onDidChangeTextDocument(event => {
                if (event.contentChanges.length) this.changed(event.document.uri.fsPath);
            }),
            vscode.window.onDidChangeVisibleTextEditors(() => this.refreshVisible()));
    }

    track(pipeline: Pipeline) {
        const input = pipeline.command.getInputPath();
        if (!input) return;
        const file = this.inputPath(pipeline)!;
        if (!this.files.has(file)) {
            const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(path.dirname(file), path.basename(file)));
            watcher.onDidChange(() => this.changed(file));
            watcher.onDidCreate(() => this.changed(file));
            this.files.set(file, watcher);
        }
    }

    private inputPath(pipeline: Pipeline) {
        const input = pipeline.command.getInputPath();
        return input ? path.resolve(pipeline.command.env?.workdir || CommandEnv.getDefault().workdir || process.cwd(), input) : undefined;
    }

    private changed(file: string) {
        for (const pipeline of this.core.allPipelines()) {
            if (this.inputPath(pipeline) !== path.resolve(file)) continue;
            this.versions.set(pipeline, (this.versions.get(pipeline) || 0) + 1);
            this.dirty.add(pipeline);
            this.schedule(pipeline);
        }
    }

    private categories(pipeline: Pipeline) {
        return new Set(vscode.window.visibleTextEditors
            .filter(editor => editor.document.uri.scheme === PipelineContentProvider.scheme)
            .map(editor => splitURI(editor.document.uri))
            .filter(uri => uri.pipeline === pipeline.raw_command)
            .map(uri => /^(before|after)/.test(uri.catergory) ? 'passes' : uri.catergory));
    }

    private refreshVisible() {
        for (const pipeline of this.core.allPipelines()) {
            // A newly visible category may not have been computed on the last edit.
            if (this.categories(pipeline).size) {
                this.versions.set(pipeline, (this.versions.get(pipeline) || 0) + 1);
                this.dirty.add(pipeline);
                this.schedule(pipeline);
            }
        }
    }

    private schedule(pipeline: Pipeline) {
        const timer = this.timers.get(pipeline);
        if (timer) clearTimeout(timer);
        if (this.disposed || !this.categories(pipeline).size) return;
        this.timers.set(pipeline, setTimeout(() => {
            this.timers.delete(pipeline);
            void this.refresh(pipeline);
        }, 300));
    }

    private async refresh(pipeline: Pipeline) {
        if (this.disposed || this.running.has(pipeline) || !this.dirty.has(pipeline)) return;
        const categories = this.categories(pipeline);
        if (!categories.size) return;
        const version = this.versions.get(pipeline);
        this.running.add(pipeline);
        this.dirty.delete(pipeline);
        try {
            const input = this.inputPath(pipeline);
            const source = vscode.workspace.textDocuments.find(doc => doc.uri.scheme === 'file' && doc.uri.fsPath === input)?.getText();
            const result = new Pipeline(pipeline.raw_command, pipeline.command);
            await result.run(categories, source);
            if (this.disposed || version !== this.versions.get(pipeline)) return;
            for (const category of categories) {
                if (category === 'passes') {
                    pipeline.passList = result.passList;
                    pipeline.backendList = result.backendList;
                    [...pipeline.passList, ...pipeline.backendList].forEach(pass => pass.parent = pipeline);
                } else if (category === 'output') pipeline.output = result.output;
                else if (category === 'ast') pipeline.ast = result.ast;
                else if (category === 'llvm') pipeline.llvm = result.llvm;
                else if (category === 'preprocessed') pipeline.preprocessed = result.preprocessed;
            }
            this.core.updated(pipeline);
        } catch (error) {
            // Incomplete source is expected while typing; preserve the last successful result.
            console.log('LLVM live refresh failed:', error);
        } finally {
            this.running.delete(pipeline);
            if (this.dirty.has(pipeline)) this.schedule(pipeline);
        }
    }

    dispose() {
        this.disposed = true;
        this.timers.forEach(timer => clearTimeout(timer));
        this.files.forEach(watcher => watcher.dispose());
        this.timers.clear();
        this.files.clear();
    }
}

export class Core {
    public watcher?: DocumentWatcher;
    private pipelines: Map<string, Pipeline> = new Map();
    public active?: Pipeline;
    private provider?: LLVMPipelineTreeDataProvider;
    public filter = "";
    public readonly onUpdated = new vscode.EventEmitter<Pipeline>();

    public allPipelines() { return this.pipelines.values(); }
    public updated(pipeline: Pipeline) {
        this.provider?.refresh();
        this.onUpdated.fire(pipeline);
    }

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
        this.watcher?.track(pipeline);
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
            if (pipeline) {
                const input = pipeline.command.getInputPath();
                const file = input ? path.resolve(pipeline.command.env?.workdir || CommandEnv.getDefault().workdir || process.cwd(), input) : undefined;
                const source = vscode.workspace.textDocuments.find(doc => doc.uri.scheme === 'file' && doc.uri.fsPath === file)?.getText();
                await pipeline.run(undefined, source);
                this.updated(pipeline);
            }
            progress.report({ increment: 100 });
        });
    }

    // run debug-only for a pass and filiter the output for that one
    public async debugOnePass(pass: Pass) {

    }

}


export class PipelineContentProvider implements vscode.TextDocumentContentProvider {
    private parser = new AsmWorkerClient();
    private parsing = new Map<string, { output: string; promise: Promise<AsmDocument> }>();
    constructor(private core: Core, subscriptions: vscode.Disposable[]) {
        subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(
            PipelineContentProvider.scheme, this), this._onDidChange,
            core.onUpdated.event(pipeline => {
                for (const doc of vscode.workspace.textDocuments) {
                    if (doc.uri.scheme === PipelineContentProvider.scheme && splitURI(doc.uri).pipeline === pipeline.raw_command) {
                        if (splitURI(doc.uri).catergory === 'output') {
                            if (this.parsing.get(doc.uri.path)?.output === pipeline.output) { continue; }
                            this.release(doc.uri.path);
                        }
                        if (vscode.window.visibleTextEditors.some(editor => editor.document.uri.toString() === doc.uri.toString())) {
                            this._onDidChange.fire(doc.uri);
                        }
                    }
                }
            }));
        subscriptions.push(this.parser, vscode.workspace.onDidCloseTextDocument(doc => {
            if (doc.uri.scheme === PipelineContentProvider.scheme) { this.release(doc.uri.path); }
        }), { dispose: () => { this.parsing.clear(); this._documents.clear(); } });
    }

    private release(key: string) {
        this.parsing.delete(key);
        this._documents.delete(key);
        this.parser.cancel(key);
    }

    public static readonly scheme = 'vscode-llvm';

    async provideTextDocumentContent(uri: vscode.Uri) {
        console.log("provideTextDocumentContent", uri);
        let { pipeline, catergory, index } = splitURI(uri);

        if (catergory == 'output') {
            const { pipeline } = splitURI(uri);
            const output = this.core.get(pipeline)?.output;
            if (output === undefined) { return undefined; }
            let pending = this.parsing.get(uri.path);
            if (!pending || pending.output !== output) {
                const promise = this.parser.parse(output, undefined, uri.path).then(result => {
                    const document = new AsmDocument(uri, '', false, result.asm);
                    if (this.parsing.get(uri.path)?.promise === promise) {
                        this._documents.set(uri.path, document);
                    }
                    return document;
                });
                pending = { output, promise };
                this.parsing.set(uri.path, pending);
                void promise.catch(() => {
                    if (this.parsing.get(uri.path)?.promise === promise) { this.parsing.delete(uri.path); }
                });
            }
            try {
                const document = await pending.promise;
                return this.parsing.get(uri.path) === pending ? document.value : undefined;
            } catch (error) {
                if (error instanceof ParseCancelledError) { return undefined; }
                throw error;
            }
        } else if (catergory == 'ast') {
            return this.core.get(pipeline)?.ast;
        } else if (catergory == 'preprocessed') {
            return this.core.get(pipeline)?.preprocessed;
        } else if (catergory == 'llvm') {
            return this.core.get(pipeline)?.llvm;
        } else if (catergory == 'before') {
            return this.core.get(pipeline)?.passList[index]?.before_ir;
        } else if (catergory == 'after') {
            return this.core.get(pipeline)?.passList[index]?.after_ir;
        } else if (catergory == 'before-b') {
            return this.core.get(pipeline)?.backendList[index]?.before_ir;
        } else if (catergory == 'after-b') {
            return this.core.get(pipeline)?.backendList[index]?.after_ir;
        }
    }

    private _documents = new Map<string, AsmDocument>();
    provideAsmDocument(uri: vscode.Uri): AsmDocument | undefined{
        return this._documents.get(uri.path);
    }

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }
}
