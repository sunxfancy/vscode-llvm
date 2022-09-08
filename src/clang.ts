import which = require("which");
import * as path from 'path';
import * as util from 'util';
const exec = util.promisify(require('child_process').exec);


export class Command {
    constructor(llvmPath?: string, env?: Map<string, string>) {
        if (llvmPath) { this.llvmPath = llvmPath; }
        else { this.llvmPath = path.dirname(which.sync('clang')); }

        if (env) { this.env = env; }
    }

    public async runClang(input: string, output: string, args: string[], env?: Map<string, string>) {
        try {
            const { stdout, stderr } = await exec("clang " + args.join(" ") + " " + input + " -o " + output);
            return stdout;
        } catch(e) {
            console.error(e);
        }
    }

    public async runOPT(input: string, output: string, args: string[], env?: Map<string, string>) {
        try {
            const { stdout, stderr } = await exec("opt " + args.join(" ") + " " + input + " -o " + output);
            return stdout;
        } catch(e) {
            console.error(e);
        }
    }

    public async runLLC(input: string, output: string, args: string[], env?: Map<string, string>) {
        try {
            const { stdout, stderr } = await exec("llc " + args.join(" ") + " " + input + " -o " + output);
            return stdout;
        } catch(e) {
            console.error(e);
        }
    }

    private llvmPath: string = "";
    private env?: Map<string, string> = undefined;
}
