import * as assert from 'assert';
import { AsmFilter, AsmParser, BinaryAsmLine } from '../../asm';
import { AsmWorkerClient, ParseCancelledError } from '../../asm-worker-client';

suite('Background assembly parsing', () => {
    test('matches synchronous parsing across concurrent requests', async () => {
        const client = new AsmWorkerClient(0);
        try {
            const inputs = ['.file 1 "main.cpp"\n.loc 1 3 0\n.Ltarget:\n jmp .Ltarget', 'ret'];
            const results = await Promise.all(inputs.map(text => client.parse(text)));
            for (let i = 0; i < inputs.length; i++) {
                const expected = new AsmParser().process(inputs[i], new AsmFilter());
                assert.strictEqual(JSON.stringify(results[i]), JSON.stringify(expected));
                assert.deepStrictEqual(results[i].labelDefinitions, expected.labelDefinitions);
                assert.deepStrictEqual(results[i].asm.map(line => line.value), expected.asm.map(line => line.value));
            }
        } finally { client.dispose(); }
    });

    test('keeps only the newest queued version without dropping other documents', async () => {
        const client = new AsmWorkerClient(0);
        try {
            const active = client.parse('ret', undefined, 'a');
            const cancelledActive = assert.rejects(active, ParseCancelledError);
            const old = client.parse('nop', undefined, 'a');
            const cancelledOld = assert.rejects(old, ParseCancelledError);
            const other = client.parse('ret', undefined, 'b');
            const latest = client.parse('mov eax, 42', undefined, 'a');
            await Promise.all([cancelledActive, cancelledOld]);
            assert.strictEqual((await latest).asm[0].text, 'mov eax, 42');
            assert.strictEqual((await other).asm[0].text, 'ret');
        } finally { client.dispose(); }
    });

    test('cancels closed documents and allows reopening', async () => {
        const client = new AsmWorkerClient(0);
        try {
            const active = client.parse('ret', undefined, 'a');
            const queued = client.parse('nop', undefined, 'b');
            const checks = [assert.rejects(active, ParseCancelledError), assert.rejects(queued, ParseCancelledError)];
            client.cancel('a');
            client.cancel('b');
            await Promise.all(checks);
            assert.strictEqual((await client.parse('ret', undefined, 'b')).asm[0].text, 'ret');
        } finally { client.dispose(); }
    });

    test('restores binary getters and rejects work after disposal', async () => {
        const client = new AsmWorkerClient(0);
        try {
            const filter = new AsmFilter();
            filter.binary = true;
            const result = await client.parse('0000000000000010 <foo>:\n  10: 90 nop', filter);
            assert.ok(result.asm[1] instanceof BinaryAsmLine);
            assert.strictEqual(result.asm[1].value, '<00000010>  nop\n');
        } finally { client.dispose(); }
        await assert.rejects(client.parse('ret'), /disposed/);
    });
});
