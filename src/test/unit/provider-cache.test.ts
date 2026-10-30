import * as assert from 'assert';

suite('Assembly document cache lifecycle', () => {
    test('retains unchanged output and releases closed documents including in-flight results', async () => {
        class Emitter {
            private listeners: Array<(value: any) => void> = [];
            event = (listener: (value: any) => void) => {
                this.listeners.push(listener);
                return { dispose: () => { this.listeners = this.listeners.filter(item => item !== listener); } };
            };
            fire(value: any) { this.listeners.forEach(listener => listener(value)); }
            dispose() { this.listeners = []; }
        }
        const closed = new Emitter();
        const uri = { scheme: 'vscode-llvm', path: '/test/output', toString() { return this.path; } };
        const doc = { uri };
        const vscode = {
            EventEmitter: Emitter,
            workspace: {
                textDocuments: [doc], onDidCloseTextDocument: closed.event,
                registerTextDocumentContentProvider: () => ({ dispose() {} })
            },
            window: { visibleTextEditors: [{ document: doc }] }
        };
        const loader = require('module');
        const original = loader._load;
        const corePath = require.resolve('../../core');
        const cached = require.cache[corePath];
        delete require.cache[corePath];
        let classes: any;
        try {
            loader._load = function (id: string, ...args: unknown[]) {
                return id === 'vscode' ? vscode : original.call(this, id, ...args);
            };
            classes = require('../../core');
        } finally {
            loader._load = original;
            if (cached) { require.cache[corePath] = cached; } else { delete require.cache[corePath]; }
        }
        const core = new classes.Core();
        const pipeline = { raw_command: 'test', output: 'ret' };
        core.get = () => pipeline;
        const subscriptions: Array<{ dispose(): void }> = [];
        const provider = new classes.PipelineContentProvider(core, subscriptions);
        let updates = 0;
        provider.onDidChange(() => updates++);
        try {
            assert.strictEqual(await provider.provideTextDocumentContent(uri), 'ret\n');
            const initial = provider.provideAsmDocument(uri);
            core.updated(pipeline);
            assert.strictEqual(updates, 0);
            assert.strictEqual(provider.provideAsmDocument(uri), initial);
            pipeline.output = 'nop';
            core.updated(pipeline);
            assert.strictEqual(updates, 1);
            assert.strictEqual(await provider.provideTextDocumentContent(uri), 'nop\n');
            closed.fire(doc);
            assert.strictEqual(provider.provideAsmDocument(uri), undefined);
            assert.strictEqual(provider.parsing.size, 0);
            assert.strictEqual(await provider.provideTextDocumentContent(uri), 'nop\n');
            pipeline.output = 'ret\n'.repeat(70000);
            core.updated(pipeline);
            const pending = provider.provideTextDocumentContent(uri);
            closed.fire(doc);
            assert.strictEqual(await pending, undefined);
            assert.strictEqual(provider.provideAsmDocument(uri), undefined);
            assert.strictEqual(provider.parsing.size, 0);
        } finally { subscriptions.forEach(subscription => subscription.dispose()); }
    });
});
