import * as assert from 'assert';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Core, DocumentWatcher, PipelineContentProvider } from '../../core';
import { CommandEnv } from '../../clang';

suite('Live compilation in VS Code', function () {
    this.timeout(20000);

    test('unsaved edits update visible IR, defer hidden views, and recover after errors', async function () {
        if (!process.env.LLVM_TEST_CLANG) { this.skip(); }
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'llvm-host-'));
        const subscriptions: vscode.Disposable[] = [];
        try {
            const file = path.join(directory, 'input.cpp');
            await fs.writeFile(file, 'int answer() { return 1; }\n');
            const core = new Core();
            new PipelineContentProvider(core, subscriptions);
            new DocumentWatcher(core, subscriptions);
            const raw = `"${process.env.LLVM_TEST_CLANG}" -O1 "${file}"`;
            await core.runPipeline(raw, new CommandEnv(directory));
            const input = await vscode.workspace.openTextDocument(file);
            const inputEditor = await vscode.window.showTextDocument(input, vscode.ViewColumn.One);
            const pipeline = core.active!;
            const outputUri = vscode.Uri.parse(`vscode-llvm:/${pipeline.encodeCommand()}/llvm`);
            const output = await vscode.workspace.openTextDocument(outputUri);
            await vscode.window.showTextDocument(output, { viewColumn: vscode.ViewColumn.Two, preserveFocus: true });
            const replace = async (text: string) => {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(input.uri, new vscode.Range(input.positionAt(0), input.positionAt(input.getText().length)), text);
                assert.ok(await vscode.workspace.applyEdit(edit));
            };
            const until = async (predicate: () => boolean) => {
                const deadline = Date.now() + 8000;
                while (!predicate()) {
                    if (Date.now() > deadline) { assert.fail('Timed out waiting for live result'); }
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            };
            await replace('int answer() { return 42; }\n');
            await until(() => /ret i32 42/.test(output.getText()));
            assert.ok(input.isDirty);
            assert.match(await fs.readFile(file, 'utf8'), /return 1/);
            await replace('int answer( {');
            await new Promise(resolve => setTimeout(resolve, 700));
            assert.match(output.getText(), /ret i32 42/);
            await replace('int answer() { return 43; }\n');
            await until(() => /ret i32 43/.test(output.getText()));
            await vscode.window.showTextDocument(output, vscode.ViewColumn.Two);
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            await until(() => !vscode.window.visibleTextEditors.some(editor => editor.document.uri.toString() === outputUri.toString()));
            await replace('int answer() { return 44; }\n');
            await new Promise(resolve => setTimeout(resolve, 700));
            assert.match(pipeline.llvm, /ret i32 43/);
            const reopened = await vscode.workspace.openTextDocument(outputUri);
            await vscode.window.showTextDocument(reopened, { viewColumn: vscode.ViewColumn.Two, preserveFocus: true });
            await until(() => /ret i32 44/.test(reopened.getText()));
            await vscode.window.showTextDocument(inputEditor.document);
            await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
        } finally {
            subscriptions.forEach(subscription => subscription.dispose());
            await fs.rm(directory, { recursive: true, force: true });
        }
    });
});
