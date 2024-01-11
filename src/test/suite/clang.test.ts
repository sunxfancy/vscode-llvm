import * as assert from 'assert';

import { Command, ClangCommand, NVCCCommand } from '../../clang';

suite('Command Test Suite', () => {
	console.log('Start all tests.');
    var path = require('path');
    let appRoot = path.resolve(__dirname);
    console.log(appRoot);
    process.chdir(path.join(appRoot, '..', '..', '..', 'example'));

	test('clang++ commands test', async () => {
        let cmd = await Command.createFromString("clang++ -std=c++17 -Wall -Wextra -Wpedantic -Werror -o a.exe main.cpp");
        let clang_cmd = cmd as ClangCommand;
        
        assert.strictEqual(clang_cmd.getInputPath(), "main.cpp");
        assert.strictEqual(clang_cmd.getOutputPath(), "a.exe");

        let pp = clang_cmd.subCommands[0];
        assert.strictEqual(pp.getType(), "CC1Command");
        assert.strictEqual(pp.getOutputPath(), "main.ii");
        console.log(pp.toString());

	});

    test('nvcc commands test', async () => {
        let cmd = await Command.createFromString("nvcc -std=c++17 -arch=sm_75 -o a.exe main.cu");
        let nvcc_cmd = cmd as NVCCCommand;
        
        // assert.strictEqual(nvcc_cmd.getInputPath(), "main.cu");
        // assert.strictEqual(nvcc_cmd.getOutputPath(), "a.exe");
        assert.notStrictEqual(nvcc_cmd.subCommands.length, 0);
        let pp = nvcc_cmd.subCommands[0];
        console.log(pp.toString());
    });
});
