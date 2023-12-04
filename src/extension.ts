// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigViewProvider } from './control-panel';
import { LLVMPipelineTreeDataProvider, LLVMPipelineTreeItemDecorationProvider } from './pipeline-panel';
import { LLVMAvailablePassDataProvider } from './available-panel';
import { ComparedPipeline, Core, Pass, PipelineContentProvider } from './core';
import { Debug } from './debug';
import { checkFileExists, ensurePropertiesFile } from './config';
import { Command } from './clang';
import { AsmDecorator } from './decorator';
import { get } from 'http';

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
	let contentProvider = new PipelineContentProvider(core, context.subscriptions);
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

	registerCommand('llvmPipelineView.open', async (pass: Pass) => {
		let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass.parent.raw_command)}/before${pass.backend ? "-b" : ""}/${pass.index}`));
		let doc2 = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass.parent.raw_command)}/after${pass.backend ? "-b" : ""}/${pass.index}`));
		vscode.languages.setTextDocumentLanguage(doc, 'llvm');
		vscode.languages.setTextDocumentLanguage(doc2, 'llvm');
		console.log("openPipelineView vscode.diff");
		vscode.commands.executeCommand("vscode.diff", doc.uri, doc2.uri);
	});

	registerCommand('llvmPipelineView.openCompare', async (pass: Pass, pass2: Pass) => {
		let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass.parent.raw_command)}/after${pass.backend ? "-b" : ""}/${pass.index}`));
		let doc2 = await vscode.workspace.openTextDocument(vscode.Uri.parse(
			`vscode-llvm:/${encodeURIComponent(pass2.parent.raw_command)}/after${pass2.backend ? "-b" : ""}/${pass2.index}`));
		vscode.languages.setTextDocumentLanguage(doc, 'llvm');
		vscode.languages.setTextDocumentLanguage(doc2, 'llvm');
		console.log("openPipelineView vscode.diff");
		vscode.commands.executeCommand("vscode.diff", doc.uri, doc2.uri);
	});

	registerCommand('llvmPipelineView.ensure', async (activeCmd: string) => {
		if (activeCmd && activeCmd.length > 0) {
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
				process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
			console.log("current dir:", process.cwd());
			core.ensurePipeline(activeCmd);
		}
	});

	registerCommand('llvmPipelineView.run', async (activeCmd: string) => {
		if (activeCmd && activeCmd.length > 0) {
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
				process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
			console.log("current dir:", process.cwd());
			core.runPipeline(activeCmd);
		}
	});

	registerCommand('llvmPipelineView.run-debug', async () => {
		if (vscode.window.activeTextEditor && core.active) {
			let debugConfig = new Debug();
			debugConfig.saveConfig(core.active);
		}
	});

	registerCommand('llvmPipelineView.compare', async (cmd1: string, cmd2: string) => {
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
			process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
		console.log("current dir:", process.cwd());

		core.comparePipeline(cmd1, cmd2);
	});

	function registerCommandForUri(cmd: string, component: string) {
		function getLanguage(component: string) {
			if (component == "output") return "vscode-llvm.disassembly";
			if (component == "preprocessed") return "cpp";
			if (component == "llvm") return "llvm";
			if (component == "ast") return "vscode-llvm.llvm-ast";
			return "plaintext";
		}

		let command = vscode.commands.registerCommand(cmd, async () => {
			if (core.active?.isCompare() == false) {
				let raw = core.active?.raw_command;
				if (!raw) return;
				let uri = vscode.Uri.parse(`vscode-llvm:/${encodeURIComponent(raw)}/${component}`);
				let doc = await vscode.workspace.openTextDocument(uri);
				vscode.languages.setTextDocumentLanguage(doc, getLanguage(component));
				vscode.window.showTextDocument(doc, { preserveFocus: true, preview: true });
			} else {
				let cpipe = core.active as ComparedPipeline;
				let raw1 = cpipe.linked_pipeline?.raw_command;
				let raw2 = cpipe.linked_pipeline2?.raw_command;
				if (!raw1 || !raw2) return;
				let doc1 = await vscode.workspace.openTextDocument(vscode.Uri.parse(`vscode-llvm:/${encodeURIComponent(raw1)}/${component}`));
				let doc2 = await vscode.workspace.openTextDocument(vscode.Uri.parse(`vscode-llvm:/${encodeURIComponent(raw2)}/${component}`));
				vscode.languages.setTextDocumentLanguage(doc1, getLanguage(component));
				vscode.languages.setTextDocumentLanguage(doc2, getLanguage(component));

				vscode.commands.executeCommand("vscode.diff", doc1.uri, doc2.uri);
			}
		});
		context.subscriptions.push(command);
	}

	registerCommandForUri('llvmPipelineView.openOutput', "output");
	registerCommandForUri('llvmPipelineView.openAST', "ast");
	registerCommandForUri('llvmPipelineView.openPreprocessed', "preprocessed");
	registerCommandForUri('llvmPipelineView.openLLVM', "llvm");

	registerCommand('llvmPipelineView.openInput', async (file: string) => {
		if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0)
			return;
		
		if (!path.isAbsolute(file)) {
			file = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, file);
		}

		let doc = await vscode.workspace.openTextDocument(file);
		vscode.window.showTextDocument(doc, { preserveFocus: true, preview: true });
	});

	registerCommand('llvmAvailableView.runAvailPass', async (pass: string) => {
		if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0)
			return;

		process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
		// get the current open file
		let editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const optPath = vscode.workspace.getConfiguration('vscode-llvm')
            .get('optPath', 'opt');

		let cmd = await Command.createfromString(optPath + ' -S ' + pass + ' -o -');
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


	// AsmView gives a better experience than the old output view.
	// It shows side-by-side source code and assembly code.
	// It also highlights the corresponding lines in assembly code when you select a line in source code.

	registerCommand('llvmAsmView.openOutput', async () => {
		let input = core.active?.command.getInputPath();
		if (!input) return;
		let raw = core.active?.raw_command;
		if (!raw) return;

		// get the path if it is not absolute
		if (!path.isAbsolute(input)) {
			if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0)
				return;
			input = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, input);
		}

		// open the file in workspace
		let srcDoc  = await vscode.workspace.openTextDocument(input);
		let srcEditor  = await vscode.window.showTextDocument(srcDoc, { preserveFocus: true, preview: true });
		
		const asmUri = vscode.Uri.parse(`vscode-llvm:/${encodeURIComponent(raw)}/output`);

		const options = {
			viewColumn: srcEditor.viewColumn! + 1,
			preserveFocus: true,
		};

		let asmDoc = await vscode.workspace.openTextDocument(asmUri);
		let asmEditor = await vscode.window.showTextDocument(asmDoc, options);
		vscode.languages.setTextDocumentLanguage(asmDoc, 'vscode-llvm.disassembly');
		const decorator = new AsmDecorator(srcEditor, asmEditor, contentProvider);
		setTimeout(() => decorator.updateSelection(srcEditor), 500);
	});

}

// this method is called when your extension is deactivated
export function deactivate() { }
