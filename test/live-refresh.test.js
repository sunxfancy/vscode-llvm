// Run against compiled TypeScript without launching an Electron extension host.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('module');
const fs = require('node:fs/promises');
const path = require('node:path');
class Emitter {
    listeners = [];
    event = listener => { this.listeners.push(listener); return { dispose() {} }; };
    fire(value) { for (const listener of this.listeners) listener(value); }
    dispose() { this.listeners = []; }
}
const changed = new Emitter();
const visible = new Emitter();
const vscode = {
    EventEmitter: Emitter,
    RelativePattern: class {},
    workspace: {
        textDocuments: [],
        onDidChangeTextDocument: changed.event,
        createFileSystemWatcher: () => ({ onDidChange() {}, onDidCreate() {}, dispose() {} }),
        registerTextDocumentContentProvider: () => ({ dispose() {} })
    },
    window: { visibleTextEditors: [], onDidChangeVisibleTextEditors: visible.event }
};
const load = Module._load;
Module._load = function (name, ...args) {
    return name === 'vscode' ? vscode : load.call(this, name, ...args);
};
const { Pipeline, Core, DocumentWatcher, PipelineContentProvider } = require('../out/core');
const { ClangCommand, CommandEnv } = require('../out/clang');
Module._load = load;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const uri = category => ({ scheme: 'vscode-llvm', path: `/compile/${category}` });

test('lazy artifacts use unsaved VFS source, suppress pass dumps and clean temporary files', async () => {
    const command = new ClangCommand(['clang++', '-std=c++17', 'input.cpp']);
    const calls = [];
    let overlay;
    command.env = new CommandEnv('/workspace');
    command.env.run = async (exe, args) => {
        calls.push(args);
        overlay = args[args.indexOf('-ivfsoverlay') + 1];
        const config = JSON.parse(await fs.readFile(overlay, 'utf8'));
        assert.equal(config.roots[0].name, '/workspace/input.cpp');
        assert.equal(await fs.readFile(config.roots[0]['external-contents'], 'utf8'), 'int value = 42;');
        return { code: 0, stdout: 'fresh', stderr: '' };
    };
    const pipeline = new Pipeline('compile', command);
    await pipeline.run(new Set(['ast', 'preprocessed']), 'int value = 42;');
    assert.equal(calls.length, 2);
    assert(calls[0].includes('-fsyntax-only'));
    assert(calls[1].includes('-E'));
    assert(calls.every(args => !args.includes('-S') && !args.includes('-save-temps=obj') && !args.includes('-print-changed')));
    assert.equal(pipeline.ast, 'fresh');
    assert.equal(pipeline.preprocessed, 'fresh');
    await assert.rejects(fs.access(path.dirname(overlay)));
    assert.equal(command.bPrintChanged, true);
    assert.deepEqual(command.args, ['-std=c++17']);
});

test('live edits debounce, discard stale results, defer hidden views and invalidate assembly cache', async () => {
    const core = new Core();
    const command = new ClangCommand(['clang', 'input.c']);
    const pipeline = new Pipeline('compile', command);
    // Private in TypeScript; supply an existing pipeline without running a compiler.
    core.pipelines.set('compile', pipeline);
    const subscriptions = [];
    const watcher = new DocumentWatcher(core, subscriptions);
    const provider = new PipelineContentProvider(core, subscriptions);
    let source = 'first';
    const input = { uri: { scheme: 'file', fsPath: path.resolve('input.c') }, getText: () => source };
    const output = { uri: uri('output') };
    vscode.workspace.textDocuments = [input, output];
    vscode.window.visibleTextEditors = [{ document: output }];
    const original = Pipeline.prototype.run;
    const calls = [];
    let release;
    Pipeline.prototype.run = async function (categories, text) {
        calls.push({ categories: [...categories], text });
        if (calls.length === 1) await new Promise(resolve => release = resolve);
        this.output = text;
    };
    let notifications = 0;
    provider.onDidChange(() => notifications++);
    const edit = () => changed.fire({ document: input, contentChanges: [{}] });
    try {
        edit(); edit(); edit();
        await delay(350);
        assert.equal(calls.length, 1);
        source = 'latest';
        edit();
        release();
        await delay(350);
        assert.equal(calls.length, 2);
        assert.equal(pipeline.output, 'latest');
        assert.equal(notifications, 1);
        assert.deepEqual(calls[1].categories, ['output']);
        const cached = provider.provideAsmDocument(output.uri);
        vscode.window.visibleTextEditors = [];
        source = 'hidden'; edit();
        await delay(350);
        assert.equal(calls.length, 2);
        vscode.window.visibleTextEditors = [{ document: output }];
        visible.fire();
        await delay(350);
        assert.equal(pipeline.output, 'hidden');
        assert.notEqual(provider.provideAsmDocument(output.uri), cached);
        assert.equal(notifications, 2);
    } finally {
        Pipeline.prototype.run = original;
        subscriptions.forEach(subscription => subscription.dispose());
    }
});

test('failed compilation preserves the previously published result and cleans overlays', async () => {
    const command = new ClangCommand(['clang', 'input.c']);
    command.env = new CommandEnv('/workspace');
    let overlay;
    command.env.run = async (exe, args) => {
        overlay = args[args.indexOf('-ivfsoverlay') + 1];
        return { code: 1, stdout: '', stderr: 'syntax error' };
    };
    const pipeline = new Pipeline('compile', command);
    pipeline.output = 'previous';
    await assert.rejects(pipeline.run(new Set(['output']), 'invalid source'), /syntax error/);
    assert.equal(pipeline.output, 'previous');
    await assert.rejects(fs.access(path.dirname(overlay)));
});

test('repeated pass refresh replaces pass lists instead of appending', async () => {
    const command = new ClangCommand(['clang', 'input.c']);
    command.env = new CommandEnv('/workspace');
    command.env.run = async (exe, args) => {
        assert(args.includes('-print-changed'));
        return { code: 0, stdout: 'assembly', stderr: '*** IR Dump After ExamplePass ***\nnew ir\n' };
    };
    const pipeline = new Pipeline('compile', command);
    await pipeline.run(new Set(['passes']));
    await pipeline.run(new Set(['passes']));
    assert.equal(pipeline.passList.length, 1);
    assert.equal(pipeline.passList[0].after_ir, 'new ir');
});

test('process runner closes empty stdin and reports spawn failures', async () => {
    const env = new CommandEnv(process.cwd());
    const result = await env.run(process.execPath, ['-e',
        'let text="";process.stdin.on("data",chunk=>text+=chunk);process.stdin.on("end",()=>process.stdout.write(text || "eof"))'], '');
    assert.equal(result.stdout, 'eof');
    assert.equal(result.code, 0);
    await assert.rejects(env.run('vscode-llvm-missing-test-executable', []), /ENOENT/);
});

test('real Clang compiles unsaved C++ with relative includes and all result categories',
    { skip: !process.env.LLVM_TEST_CLANG }, async () => {
        const os = require('node:os');
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'llvm-integration-'));
        try {
            await fs.writeFile(path.join(directory, 'local.h'), '#define VALUE 42\n');
            const disk = '#include "local.h"\nint answer() { return 1; }\n';
            await fs.writeFile(path.join(directory, 'input.cpp'), disk);
            const source = '#include "local.h"\nint answer() { return VALUE; }\n';
            const command = new ClangCommand([process.env.LLVM_TEST_CLANG, '-O1', '-std=c++17', 'input.cpp']);
            command.env = new CommandEnv(directory);
            const pipeline = new Pipeline('compile', command);
            await pipeline.run(undefined, source);
            assert.match(pipeline.output, /42/);
            assert.match(pipeline.llvm, /ret i32 42/);
            assert.match(pipeline.ast, /IntegerLiteral.*42/);
            assert.match(pipeline.preprocessed, /return 42/);
            assert(pipeline.passList.length > 0, 'LLVM passes should be parsed');
            assert.equal(await fs.readFile(path.join(directory, 'input.cpp'), 'utf8'), disk);
            assert.deepEqual((await fs.readdir(directory)).sort(), ['input.cpp', 'local.h']);
            await assert.rejects(pipeline.run(new Set(['output']), 'int broken( {'), /error:/);
            await pipeline.run(new Set(['llvm']), source.replace('VALUE;', 'VALUE + 1;'));
            assert.match(pipeline.llvm, /ret i32 43/);
        } finally {
            await fs.rm(directory, { recursive: true, force: true });
        }
    });
