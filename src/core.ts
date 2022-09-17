import {Command, CommandEnv} from './clang';
import {LLVMPipelineTreeDataProvider} from './pipeline-panel';
import * as vscode from 'vscode';
export class Pass {
    constructor(
        public name: string, 
        public before_ir: string, 
        public after_ir: string, 
        public index: number,
        public backend: boolean) {
    }
}


export class Pipeline {
    public isCompare: boolean = false;
    public cmdEnv: CommandEnv;
    public command: Command;

    public input: string = "";
    public output: string = "";
    public passList: Pass[] = [];
    public backendList: Pass[] = [];
    
    constructor(cmd: string[], cmdEnv: CommandEnv) {
        this.cmdEnv = cmdEnv;
        this.command = new Command(cmd);
    }

    public async run() {
        const {stdout, stderr} = await this.cmdEnv.runClang(this.command);
        this.output = stdout;
        this.parseLLVMDump(stderr);
    }

    public parseLLVMDump(data: string) {
        const re = /^(# )?\*\*\* (.+) \*\*\*\:?$/m;
        let pass = data.split(re);
    
        for (let i = 1; i < pass.length; i += 6) {
            let sharp = pass[i];
            let name = pass[i + 1];
            let ir = pass[i + 2];
            let sharp2 = pass[i + 3];
            let name2 = pass[i + 4];
            let ir2 = pass[i + 5];
    
            if (name.substring(15) !== name2.substring(14)) {
                console.log("name mismatch: " + name + " " + name2);
            }
    
            if (sharp === undefined) {
                if (sharp2 !== undefined) {
                    console.log("sharp mismatch: " + sharp + " " + sharp2);
                }
                this.passList.push(new Pass(name.substring(15), ir, ir2, this.passList.length, false));
            } else {
                if (sharp !== "# ") {
                    console.log("sharp mismatch: " + sharp + " " + sharp2);
                }
                this.backendList.push(new Pass(name.substring(15), ir, ir2, this.backendList.length, true));
            }
        }
    }
    
}

export class Core {
    private pipelines: Map<string, Pipeline> = new Map();
    public active?: Pipeline;
    public activeCmd: string | undefined;
    private provider?: LLVMPipelineTreeDataProvider;

    public setProvider(provider: LLVMPipelineTreeDataProvider) {
        this.provider = provider;
    }

    // This method is called when a command is selected from the command palette
    // It will ensure that the pipeline is running at once or already have been run
    public async ensurePipeline(cmd: string, path: string, cenv: CommandEnv) {
        if (this.pipelines.has(cmd + " -g -S " + path + " -o -")) {
            this.active = this.pipelines.get(cmd + " -g -S " + path + " -o -");
            this.provider?.refresh();
            return;
        }

        console.log("ensurePipeline: " + cmd + " " + path);
        let real = await cenv.getRealCommand(cmd + " -g -S -mllvm -print-before-all  -mllvm -print-after-all " + path + " -o -");

        let pipeline = new Pipeline(real, cenv);
        this.pipelines.set(cmd + " -g -S " + path + " -o -", pipeline);
        await pipeline.run();
        this.active = pipeline;
        this.provider?.refresh();
    }

    public async ensurePipelineLTO(cmd: string, cenv: CommandEnv) {
        if (this.pipelines.has(cmd + " -S ")) {
            this.active = this.pipelines.get(cmd + " -S ");
            this.provider?.refresh();
            return;
        }

        let index = cmd.indexOf(" ");
        let args0 = cmd.substring(0, index);
        let args = cmd.substring(index+1);
        cmd = args0 + " -save-temps -Wl,-mllvm -Wl,-print-before-all -Wl,-mllvm -Wl,-print-after-all" + args;

        console.log("ensurePipelineLTO: " + cmd); 
        
        let real = await cenv.getRealCommand(cmd);

        let pipeline = new Pipeline(real, cenv);
        this.pipelines.set(cmd + " -S ", pipeline);
        await pipeline.run();
        this.active = pipeline;
        this.provider?.refresh();
    }


    // run debug-only for a pass and filiter the output for that one
    public async debugOnePass(pass: Pass) {

    }

    public async ensureComparePipeline(cmd: Command, cmd2: Command) {

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
        if (uri.path === '/output') {
            return this.core.active?.output;
        } else if (uri.path.indexOf('/before/') === 0) {
            return this.core.active?.passList[Number(uri.path.slice(8))].before_ir;
        } else if (uri.path.indexOf('/after/') === 0) {
            return this.core.active?.passList[Number(uri.path.slice(7))].after_ir;
        } else if (uri.path.indexOf('/before-b/') === 0) {
            return this.core.active?.backendList[Number(uri.path.slice(10))].before_ir;
        } else if (uri.path.indexOf('/after-b/') === 0) {
            return this.core.active?.backendList[Number(uri.path.slice(9))].after_ir;
        }
    }
}