import {Command, CommandEnv} from './clang';
import {LLVMPipelineTreeDataProvider} from './pipeline-panel';

export class Pass {
    public name: string;
    public before_ir: string;
    public after_ir: string;
    constructor(name: string, before_ir: string, after_ir: string) {
        this.name = name;
        this.before_ir = before_ir;
        this.after_ir = after_ir;
    }
}

export class Pipeline {
    public isCompare: boolean = false;
    public cmdEnv: CommandEnv;
    public command: Command;

    public input: string = "";
    public output: string = "";
    public passList: Pass[] = [];
    
    constructor(cmd: string[], cmdEnv: CommandEnv) {
        this.cmdEnv = cmdEnv;
        this.command = new Command(cmd);
    }

    public async run() {
        const {stdout, stderr} = await this.cmdEnv.runClang(this.command);
        this.output = stdout;
        
        const re = /^\*\*\* (.+) \*\*\*$/i;
        let pass = stderr.split(re);

        console.log("run: " + this.output);
        console.log(stderr.substring(0, 1000));
        console.log(pass[0].substring(0,5000));
    }
}

export class Core {
    private pipelines: Map<string, Pipeline> = new Map();
    public active?: Pipeline;
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
        console.log("real: ",real);

        let pipeline = new Pipeline(real, cenv);
        this.pipelines.set(cmd + " -g -S " + path + " -o -", pipeline);
        await pipeline.run();
        this.active = pipeline;
        this.provider?.refresh();
    }

    public async ensureComparePipeline(cmd: Command, cmd2: Command) {

    }

}
