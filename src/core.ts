import {Command, CommandEnv} from './clang';


export class Pass {
    name: string;
    before_ir: string;
    after_ir: string;
    constructor(name: string, before_ir: string, after_ir: string) {
        this.name = name;
        this.before_ir = before_ir;
        this.after_ir = after_ir;
    }
}

export class Pipeline {
    public isCompare: boolean = false;
    private cmdEnv: CommandEnv;
    private command: Command;

    private input: string = "";
    private output: string = "";
    private passList: Pass[] = [];
    
    constructor(cmd:string[], cmdEnv: CommandEnv) {
        this.cmdEnv = cmdEnv;
        this.command = new Command(cmd);
    }

    public async run() {
        const {stdout, stderr} = await this.cmdEnv.runClang(this.command);
        this.output = stdout;
        console.log("run: " + this.output);
        console.log(stderr.substring(0, 1000));
    }
}

export class Core {
    private pipelines: Map<string, Pipeline> = new Map();

    // This method is called when a command is selected from the command palette
    // It will ensure that the pipeline is running at once or already have been run
    public async ensurePipeline(cmd: string, path: string, cenv: CommandEnv) {
        if (this.pipelines.has(cmd + " -g -S " + path + " -o -")) return;

        console.log("ensurePipeline: " + cmd + " " + path);
        let real = await cenv.getRealCommand(cmd + " -g -S -mllvm -print-before-all  -mllvm -print-after-all " + path + " -o -");
        console.log("real: ",real);

        let pipeline = new Pipeline(real, cenv);
        this.pipelines.set(cmd + " -g -S " + path + " -o -", pipeline);
        pipeline.run();
    }

    public async ensureComparePipeline(cmd: Command, cmd2: Command) {

    }

}
