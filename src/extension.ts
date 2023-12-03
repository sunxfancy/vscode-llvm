// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigViewProvider } from './control-panel';
import { LLVMPipelineTreeDataProvider, LLVMPipelineTreeItemDecorationProvider } from './pipeline-panel';
import { LLVMAvailablePassDataProvider } from './available-panel';
import { Core, Pass, PipelineContentProvider } from './core';
import { Debug } from './debug';
import { checkFileExists, ensurePropertiesFile } from './config';
import { Command } from './clang';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	function registerCommand(cmd: string, cb: (...args: any[]) => any) {
		let command = vscode.commands.registerCommand(cmd, cb);
		context.subscriptions.push(command);
	}

	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		for (let i: number = 0; i < vscode.workspace.workspaceFolders.length; ++i) {
			const config: string = path.join(vscode.workspace.workspaceFolders[i].uri.fsPath, ".vscode/llvm.json");
			console.log(config);
			if (await checkFileExists(config)) {
				let doc = await vscode.workspace.openTextDocument(config);
				vscode.languages.setTextDocumentLanguage(doc, "jsonc");
			}
		}
	}

	let core = new Core();
	const provider = new ConfigViewProvider(context.extensionUri, core, context.subscriptions);
	new LLVMPipelineTreeDataProvider(core, context.subscriptions);
	new PipelineContentProvider(core, context.subscriptions);
	new LLVMPipelineTreeItemDecorationProvider(core, context.subscriptions);
	new LLVMAvailablePassDataProvider(context.subscriptions);

	registerCommand('vscode-llvm.reloadConfig', () => {
		provider.reloadConfig();
		vscode.window.showInformationMessage('reload config done from vscode-llvm!');
	});

	registerCommand('llvmPipelineView.settings', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		await ensurePropertiesFile();

		// Open the first workspace settings
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			let config = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'llvm.json');
			let doc = await vscode.workspace.openTextDocument(config);
			let edit1 = await vscode.window.showTextDocument(doc, undefined, true);
			console.log(edit1);
			vscode.window.showInformationMessage('llvmPipelineView.settings from vscode-llvm!');
		}
	});

	registerCommand('llvmPipelineView.open', async (...args) => {
		console.log(args);
		let pass = args[0] as Pass;
		let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass.parent.raw_command)}/before${pass.backend ? "-b" : ""}/${pass.index}`));
		let doc2 = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass.parent.raw_command)}/after${pass.backend ? "-b" : ""}/${pass.index}`));
		vscode.languages.setTextDocumentLanguage(doc, 'llvm');
		vscode.languages.setTextDocumentLanguage(doc2, 'llvm');
		console.log("openPipelineView vscode.diff");
		vscode.commands.executeCommand("vscode.diff", doc.uri, doc2.uri);
	});

	registerCommand('llvmPipelineView.openCompare', async (...args) => {
		console.log(args);
		let pass = args[0] as Pass;
		let pass2 = args[1] as Pass;
		let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass.parent.raw_command)}/after${pass.backend ? "-b" : ""}/${pass.index}`));
		let doc2 = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass2.parent.raw_command)}/after${pass2.backend ? "-b" : ""}/${pass2.index}`));
		vscode.languages.setTextDocumentLanguage(doc, 'llvm');
		vscode.languages.setTextDocumentLanguage(doc2, 'llvm');
		console.log("openPipelineView vscode.diff");
		vscode.commands.executeCommand("vscode.diff", doc.uri, doc2.uri);
	});

	registerCommand('llvmPipelineView.ensure', async (...args) => {
		let activeCmd = args[0] as string;
		if (activeCmd && activeCmd.length > 0) {
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
				process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
			console.log("current dir:", process.cwd());
			core.ensurePipeline(activeCmd);
		}
	});

	registerCommand('llvmPipelineView.run', async (...args) => {
		let activeCmd = args[0] as string;
		if (activeCmd && activeCmd.length > 0) {
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
				process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
			console.log("current dir:", process.cwd());
			core.runPipeline(activeCmd);
		}
	});

	registerCommand('llvmPipelineView.run-debug', async (...args) => {
		if (vscode.window.activeTextEditor && core.active) {
			let debugConfig = new Debug();
			debugConfig.saveConfig(core.active);
		}
	});

	registerCommand('llvmPipelineView.compare', async (...args) => {
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
			process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
		console.log("current dir:", process.cwd());

		let cmd1 = args[0] as string;
		let cmd2 = args[1] as string;
		core.comparePipeline(cmd1, cmd2);
	});

	function registerCommandForUri(cmd: string, component: string) {
		let command = vscode.commands.registerCommand(cmd, async () => {
			let raw = core.active?.raw_command;
			if (!raw) return;
			let uri = vscode.Uri.parse(`vscode-llvm:/${encodeURIComponent(raw)}/${component}`);
			let doc = await vscode.workspace.openTextDocument(uri);
			vscode.window.showTextDocument(doc, { preserveFocus: true, preview: true });
		});
		context.subscriptions.push(command);
	}

	registerCommandForUri('llvmPipelineView.openOutput', "output");
	registerCommandForUri('llvmPipelineView.openAST', "ast");
	registerCommandForUri('llvmPipelineView.openPreprocessed', "preprocessed");
	registerCommandForUri('llvmPipelineView.openLLVM', "llvm");

	registerCommand('llvmAvailableView.runAvailPass', async (...args) => {
		if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0)
			return;

		process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
		// get the current open file
		let editor = vscode.window.activeTextEditor;
		if (!editor && args.length == 0) return;

		let pass = args[0] as string;

		// TODO: make opt-15 configurable
		let cmd = await Command.createfromString('opt-15 -S ' + pass + ' -o -');
		if (cmd == undefined) return;
		const { stdout, stderr } = await cmd.run(undefined, editor?.document.getText());
		if (stdout && stdout.length > 0) {
			let outdoc = await vscode.workspace.openTextDocument({ content: stdout, language: 'llvm' });
			await vscode.window.showTextDocument(outdoc, undefined, true);
		}

		if (pass.indexOf('dot') != -1) {
			let result = stderr.match(/Writing '(.*)'.../g);
			if (result && result.length == 1) {
				vscode.window.showInformationMessage(result[0]);
			}
		}
	});

}

// this method is called when your extension is deactivated
export function deactivate() { }
