import { parentPort } from 'worker_threads';
import { AsmFilter, AsmParser } from './asm';

parentPort!.on('message', ({ id, text, filter }: { id: number; text: string; filter: AsmFilter }) => {
    try {
        parentPort!.postMessage({ id, result: new AsmParser().process(text, filter) });
    } catch (error) {
        parentPort!.postMessage({ id, error: String(error) });
    }
});
