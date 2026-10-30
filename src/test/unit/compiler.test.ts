import * as assert from 'assert';
import { parseShellArg } from '../../utils';

// Only the workspace lookup needs a VS Code boundary. Compiler execution is
// replaced per test; the real command and pipeline parsers are exercised.
const loader = require('module');
const originalLoad = loader._load;
let commands: typeof import('../../clang');
let pipelines: typeof import('../../core');
try {
    loader._load = function (id: string, ...args: unknown[]) {
        if (id === 'vscode') { return { workspace: {} }; }
        return originalLoad.call(this, id, ...args);
    };
    commands = require('../../clang');
    pipelines = require('../../core');
} finally {
    loader._load = originalLoad;
}

suite('Compiler argument regressions', () => {
    const cases: [string, string[] | undefined][] = [
        ['clang -DNAME="hello world" main.cpp', ['clang', '-DNAME=hello world', 'main.cpp']],
        ['clang "" \'\' main.cpp', ['clang', '', '', 'main.cpp']],
        ['clang src\\ dir/main.cpp', ['clang', 'src dir/main.cpp']],
        ['clang "a\\"b.cpp"', ['clang', 'a"b.cpp']],
        [String.raw`clang "C:\src\main.cpp"`, ['clang', String.raw`C:\src\main.cpp`]],
        ['clang ab"cd ef"gh.cpp', ['clang', 'abcd efgh.cpp']],
        [String.raw`clang 'literal\path "quoted".cpp'`, ['clang', String.raw`literal\path "quoted".cpp`]],
        ['clang "unterminated', undefined],
        ['clang trailing\\', undefined]
    ];
    for (const [input, expected] of cases) {
        test(`tokenizes ${JSON.stringify(input)}`, () => {
            assert.deepStrictEqual(parseShellArg(input), expected);
        });
    }

    test('extracts Clang inputs and output while preserving compiler options', () => {
        const cmd = new commands.ClangCommand(parseShellArg('clang++ -O2 -std=c++17 "src dir/a.cpp" b.cc -o "out dir/a.s"')!);
        assert.deepStrictEqual(cmd.input, ['src dir/a.cpp', 'b.cc']);
        assert.strictEqual(cmd.getOutputPath(), 'out dir/a.s');
        const args = cmd.getArgs();
        assert.ok(args.includes('-O2'));
        assert.ok(args.includes('-std=c++17'));
        assert.deepStrictEqual(args.slice(-4), ['-o', 'out dir/a.s', 'src dir/a.cpp', 'b.cc']);
        assert.deepStrictEqual(cmd.getArgs(), args);
    });

    test('reconstructs cc1 preprocessing and IR command arguments', async () => {
        for (const mode of ['-E', '-emit-llvm-bc', '-S']) {
            const cmd = await commands.Command.createFromString(`"/tools/clang-17" -cc1 ${mode} -o "out dir/main.bc" -x c++ "src dir/main.cpp"`);
            assert.ok(cmd instanceof commands.CC1Command);
            const cc1 = cmd as import('../../clang').CC1Command;
            assert.strictEqual(cc1.mode, mode);
            assert.strictEqual(cc1.getInputPath(), 'src dir/main.cpp');
            assert.strictEqual(cc1.getOutputPath(), 'out dir/main.bc');
            assert.deepStrictEqual(cc1.getArgs(), ['-cc1', mode, '-o', 'out dir/main.bc', '-x', 'c++', 'src dir/main.cpp']);
        }
    });

    test('handles cc1 without optional output or language arguments', async () => {
        const cmd = await commands.Command.createFromString('clang -cc1 -fsyntax-only main.cpp');
        assert.ok(cmd instanceof commands.CC1Command);
        assert.strictEqual(cmd!.getOutputPath(), undefined);
        assert.strictEqual(cmd!.getInputPath(), 'main.cpp');
        assert.deepStrictEqual(cmd!.getArgs(), ['-cc1', '-fsyntax-only', 'main.cpp']);
    });

    test('does not mistake an option following -x for the cc1 input', async () => {
        const cmd = await commands.Command.createFromString('clang -cc1 -x c++ -O2 -emit-llvm -o main.ll main.cpp');
        assert.strictEqual(cmd!.getInputPath(), 'main.cpp');
        assert.ok(cmd!.getArgs().includes('-O2'));
        assert.strictEqual((cmd as import('../../clang').CC1Command).language, 'c++');
    });

    test('applies Clang filtering and stdout configuration without accumulating flags', () => {
        const cmd = new commands.ClangCommand(['clang', '-S', '-g', 'main.cpp']);
        cmd.setFilter('foo,bar');
        cmd.bPrintBefore = true;
        cmd.bPrintAfter = true;
        const args = cmd.getArgs();
        assert.strictEqual(cmd.getOutputPath(), '-');
        assert.ok(args.includes('-filter-print-funcs=foo,bar'));
        assert.ok(args.includes('-print-before-all'));
        assert.ok(args.includes('-print-after-all'));
        assert.strictEqual(args.filter(arg => arg === '-S').length, 1);
        assert.strictEqual(args.filter(arg => arg === '-g').length, 1);
        assert.deepStrictEqual(cmd.getArgs(), args);
    });
});

suite('Compiler dry-run intermediate commands', () => {
    let savedRun: typeof commands.Command.prototype.run;
    setup(() => { savedRun = commands.Command.prototype.run; });
    teardown(() => { commands.Command.prototype.run = savedRun; });

    function dryRun(output: string, stdout = false) {
        commands.Command.prototype.run = async function (extra) {
            assert.deepStrictEqual(extra, this instanceof commands.NVCCCommand ? ['-v', '--dryrun'] : ['-###']);
            return { code: 0, stdout: stdout ? output : '', stderr: stdout ? '' : output };
        };
    }

    for (const newline of ['\n', '\r\n']) {
        test(`parses Clang preprocessing and IR stages (${JSON.stringify(newline)})`, async () => {
            dryRun(['clang version 17', 'Target: x86_64', 'Thread model: posix', 'InstalledDir: /tools',
                ' (in-process)', ' "/tools/clang-17" "-cc1" "-E" "-o" "main.ii" "-x" "c++" "src dir/main.cpp"',
                ' "/tools/clang-17" "-cc1" "-emit-llvm-bc" "-o" "main.bc" "-x" "c++-cpp-output" "main.ii"', ''].join(newline));
            const cmd = await commands.Command.createFromString('clang++ "src dir/main.cpp"');
            const stages = (cmd as import('../../clang').ClangCommand).subCommands;
            assert.strictEqual(stages.length, 2);
            assert.ok(stages.every(stage => stage instanceof commands.CC1Command));
            assert.strictEqual(stages[0].getOutputPath(), stages[1].getInputPath());
            assert.strictEqual(stages[1].getOutputPath(), 'main.bc');
        });
    }

    test('accepts a short Clang stdout dry run without a fixed banner length', async () => {
        dryRun(' "/tools/clang" "-cc1" "-E" "-o" "main.ii" "-x" "c++" "main.cpp"\n', true);
        const cmd = await commands.Command.createFromString('clang main.cpp');
        assert.strictEqual((cmd as import('../../clang').ClangCommand).subCommands.length, 1);
    });

    test('does not interpret Clang diagnostics as commands', async () => {
        dryRun('clang version 17\nclang: error: no input files\n');
        const cmd = await commands.Command.createFromString('clang');
        assert.deepStrictEqual((cmd as import('../../clang').ClangCommand).subCommands, []);
    });

    test('returns only after all intermediate commands are constructed', async () => {
        dryRun(Array.from({ length: 8 }, (_, i) =>
            ` "clang" "-cc1" "-E" "-o" "stage${i}.ii" "-x" "c++" "main.cpp"`).join('\n'));
        const cmd = await commands.Command.createFromString('clang main.cpp');
        const stages = (cmd as import('../../clang').ClangCommand).subCommands;
        assert.deepStrictEqual(stages.map(stage => stage.getOutputPath()),
            Array.from({ length: 8 }, (_, i) => `stage${i}.ii`));
    });

    test('parses NVCC stages after variable assignments and diagnostic lines', async () => {
        dryRun('#$ PATH=/cuda/bin\r\n#$ TOP=/cuda\r\n#$ "/cuda/bin/ptxas" -o "out dir/main.cubin" "tmp dir/main.ptx"\r\nwarning: example\r\n#$ nvlink -o main.out main.o\r\n');
        const cmd = await commands.Command.createFromString('nvcc main.cu');
        const stages = (cmd as import('../../clang').NVCCCommand).subCommands;
        assert.strictEqual(stages.length, 2);
        assert.ok(stages[0] instanceof commands.PTXASCommand);
        assert.strictEqual((stages[0] as import('../../clang').PTXASCommand).input, 'tmp dir/main.ptx');
        assert.strictEqual((stages[0] as import('../../clang').PTXASCommand).output, 'out dir/main.cubin');
        assert.ok(stages[1] instanceof commands.NVLinkCommand);
    });
});

suite('LLVM intermediate pass states', () => {
    async function pipeline() {
        return new pipelines.Pipeline('opt', (await commands.Command.createFromString('opt'))!);
    }

    test('links changed IR, unchanged passes and backend machine code', async () => {
        const pipe = await pipeline();
        pipe.parseLLVMDumpChanged('diagnostic\n*** IR Dump At Start ***\ndefine void @f() { ret void }\n*** IR Dump After SimplifyCFGPass ***\n\n*** IR Dump After CodeGen ***\n# Machine code for function f\nRET\n');
        assert.strictEqual(pipe.passList.length, 2);
        assert.strictEqual(pipe.backendList.length, 1);
        assert.strictEqual(pipe.passList[0].before_ir, '');
        assert.strictEqual(pipe.passList[1].before_ir, pipe.passList[0].after_ir);
        assert.strictEqual(pipe.passList[1].same, true);
        assert.strictEqual(pipe.backendList[0].before_ir, pipe.passList[1].after_ir);
        assert.strictEqual(pipe.backendList[0].backend, true);
        assert.strictEqual(pipe.backendList[0].index, 0);
    });

    test('replaces prior pass states when parsing a new compilation', async () => {
        const pipe = await pipeline();
        pipe.parseLLVMDumpChanged('*** First ***\nold IR\n');
        pipe.parseLLVMDumpChanged('*** Second ***\nnew IR\n');
        assert.strictEqual(pipe.passList.length, 1);
        assert.strictEqual(pipe.passList[0].name, 'Second');
        assert.strictEqual(pipe.passList[0].index, 0);
        assert.strictEqual(pipe.passList[0].before_ir, '');
    });

    test('clears previous passes when a compilation produces no dumps', async () => {
        const pipe = await pipeline();
        pipe.parseLLVMDumpChanged('*** First ***\nold IR\n');
        pipe.parseLLVMDumpChanged('clang: error: invalid argument');
        assert.deepStrictEqual(pipe.passList, []);
        assert.deepStrictEqual(pipe.backendList, []);
    });

    test('parses legacy before/after pairs and separates backend indices', async () => {
        const pipe = await pipeline();
        pipe.parseLLVMDump('*** IR Dump Before SimplifyCFG ***\nbefore\n*** IR Dump After SimplifyCFG ***\nafter\n# *** IR Dump Before CodeGen ***\nmachine before\n# *** IR Dump After CodeGen ***\nmachine after\n');
        assert.strictEqual(pipe.passList.length, 1);
        assert.strictEqual(pipe.backendList.length, 1);
        assert.strictEqual(pipe.passList[0].name, 'SimplifyCFG');
        assert.strictEqual(pipe.passList[0].before_ir.trim(), 'before');
        assert.strictEqual(pipe.passList[0].after_ir.trim(), 'after');
        assert.strictEqual(pipe.backendList[0].name, 'CodeGen');
        assert.strictEqual(pipe.backendList[0].backend, true);
        assert.strictEqual(pipe.backendList[0].index, 0);
    });
});
