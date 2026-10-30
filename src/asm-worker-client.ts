import { Worker } from 'worker_threads';
import * as path from 'path';
import { AsmFilter, AsmLine, AsmParser, AsmParserResult, BinaryAsmLine } from './asm';

// Reuse one background thread; small documents avoid serialization overhead.
export class AsmWorkerClient {
    private worker?: Worker;
    private nextId = 0;
    private disposed = false;
    private pending = new Map<number, { resolve: (result: AsmParserResult) => void; reject: (error: Error) => void }>();

    constructor(private threshold = 256 * 1024) {}

    async parse(text: string, filter = new AsmFilter()): Promise<AsmParserResult> {
        if (this.disposed) { throw new Error('Assembly parser disposed'); }
        if (text.length < this.threshold) { return new AsmParser().process(text, filter); }
        if (!this.worker) {
            const worker = new Worker(path.join(__dirname, 'asm-worker.js'));
            this.worker = worker;
            worker.on('message', ({ id, result, error }) => {
                const request = this.pending.get(id);
                if (!request) { return; }
                this.pending.delete(id);
                if (error) { request.reject(new Error(error)); }
                else {
                    // Structured cloning removes prototypes, including the value getter.
                    result.asm = result.asm.map((line: AsmLine & Partial<BinaryAsmLine>) =>
                        line.address === undefined ? new AsmLine(line.text, line.source, line.labels) :
                            new BinaryAsmLine(line.text, line.source, line.labels, line.address, line.opcodes!));
                    request.resolve(new AsmParserResult(result.asm, result.labelDefinitions));
                }
            });
            const fail = (error: Error) => {
                if (this.worker !== worker) { return; }
                this.worker = undefined;
                for (const request of this.pending.values()) { request.reject(error); }
                this.pending.clear();
            };
            worker.on('error', fail);
            worker.on('exit', code => fail(new Error(`Assembly worker exited (${code})`)));
        }
        const id = this.nextId++;
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            try { this.worker!.postMessage({ id, text, filter }); }
            catch (error) { this.pending.delete(id); reject(error); }
        });
    }

    dispose() {
        this.disposed = true;
        for (const request of this.pending.values()) { request.reject(new Error('Assembly parser disposed')); }
        this.pending.clear();
        void this.worker?.terminate();
        this.worker = undefined;
    }
}
