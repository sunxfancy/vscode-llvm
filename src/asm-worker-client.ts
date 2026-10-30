import { Worker } from 'worker_threads';
import * as path from 'path';
import { AsmFilter, AsmLine, AsmParser, AsmParserResult, BinaryAsmLine } from './asm';

export class ParseCancelledError extends Error {
    constructor() { super('Assembly parsing superseded or cancelled'); }
}

type ParseJob = {
    key: string | symbol;
    text: string;
    filter: AsmFilter;
    resolve: (result: AsmParserResult) => void;
    reject: (error: Error) => void;
};

// Reuse one background thread; small documents avoid serialization overhead.
export class AsmWorkerClient {
    private worker?: Worker;
    private nextId = 0;
    private disposed = false;
    private pending = new Map<number, { resolve: (result: AsmParserResult) => void; reject: (error: Error) => void }>();

    private queue = new Map<string | symbol, ParseJob>();
    private active?: ParseJob;

    constructor(private threshold = 256 * 1024) {}

    parse(text: string, filter = new AsmFilter(), key: string | symbol = Symbol()): Promise<AsmParserResult> {
        if (this.disposed) { return Promise.reject(new Error('Assembly parser disposed')); }
        // Only the active request is sent to the worker. Replace queued versions
        // before paying serialization or parsing costs.
        this.queue.get(key)?.reject(new ParseCancelledError());
        if (this.active?.key === key) { this.active.reject(new ParseCancelledError()); }
        return new Promise((resolve, reject) => {
            this.queue.set(key, { key, text, filter: { ...filter }, resolve, reject });
            this.drain();
        });
    }

    cancel(key: string) {
        this.queue.get(key)?.reject(new ParseCancelledError());
        this.queue.delete(key);
        if (this.active?.key === key) { this.active.reject(new ParseCancelledError()); }
    }

    private drain() {
        if (this.active || this.disposed) { return; }
        const job = this.queue.values().next().value as ParseJob | undefined;
        if (!job) { return; }
        this.queue.delete(job.key);
        this.active = job;
        void this.run(job.text, job.filter).then(job.resolve, job.reject).finally(() => {
            this.active = undefined;
            this.drain();
        });
    }

    private async run(text: string, filter: AsmFilter): Promise<AsmParserResult> {
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
        this.active?.reject(new ParseCancelledError());
        for (const job of this.queue.values()) { job.reject(new ParseCancelledError()); }
        this.queue.clear();
        for (const request of this.pending.values()) { request.reject(new Error('Assembly parser disposed')); }
        this.pending.clear();
        void this.worker?.terminate();
        this.worker = undefined;
    }
}
