import * as assert from 'assert';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import which = require('which');
import { Command, ClangCommand, CommandEnv, CC1Command, NVCCCommand } from '../../clang';

suite('Compiler integration tests', function () {
    this.timeout(20000);
    const clangPath = process.env.LLVM_TEST_CLANG || 'clang++';
    let directory: string;
    let input: string;

    setup(async () => {
        directory = await fs.mkdtemp(path.join(os.tmpdir(), 'llvm-compiler-test-'));
        input = path.join(directory, 'source with spaces.cpp');
        await fs.writeFile(path.join(directory, 'local.h'), '#define ANSWER 42\n');
        await fs.writeFile(input, '#include "local.h"\nint answer() { return ANSWER; }\n');
    });

    teardown(async () => {
        await fs.rm(directory, { recursive: true, force: true });
    });

    test('parses real Clang preprocessing and IR stages', async () => {
        const command = await Command.createFromString(`"${clangPath}" -std=c++17 -O1 -o "${path.join(directory, 'out.s')}" "${input}"`);
        assert.ok(command instanceof ClangCommand);
        const clang = command as ClangCommand;
        assert.strictEqual(clang.getInputPath(), input);
        assert.strictEqual(clang.getOutputPath(), path.join(directory, 'out.s'));
        const stages = clang.subCommands.filter((stage): stage is CC1Command => stage instanceof CC1Command);
        assert.ok(stages.some(stage => stage.mode === '-E'), 'missing preprocessing stage');
        assert.ok(stages.some(stage => stage.mode === '-emit-llvm-bc'), 'missing IR stage');
    });

    test('compiles C++ and a relative header to assembly', async () => {
        const command = new ClangCommand([clangPath, '-std=c++17', '-O1', input]);
        command.env = new CommandEnv(directory);
        command.bSaveTemps = false;
        command.bPrintChanged = false;
        const result = await command.run();
        assert.strictEqual(result.code, 0, result.stderr);
        assert.match(result.stdout, /answer/);
        assert.match(result.stdout, /42/);
        assert.deepStrictEqual((await fs.readdir(directory)).sort(), ['local.h', 'source with spaces.cpp']);
    });

    test('parses real NVCC stages when the CUDA toolkit is installed', async function () {
        if (!which.sync('nvcc', { nothrow: true })) { this.skip(); }
        const cuda = path.join(directory, 'input.cu');
        await fs.writeFile(cuda, '__global__ void kernel() {}\n');
        const command = await Command.createFromString(`nvcc -std=c++17 -arch=sm_75 -o "${path.join(directory, 'out')}" "${cuda}"`);
        assert.ok(command instanceof NVCCCommand);
        assert.ok((command as NVCCCommand).subCommands.length > 0);
    });
});
