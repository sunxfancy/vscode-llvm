// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {ConfigViewProvider} from './control-panel';
import {LLVMPipelineTreeDataProvider, LLVMPipelineTreeItemDecorationProvider} from './pipeline-panel';
import { Core, Pass } from './core';
import { CommandEnv } from './clang';
import { Debug } from './debug';
import { debug } from 'console';

/** Test whether a directory exists */
export async function checkDirectoryExists(dirPath: string): Promise<boolean> {
    const stats: fs.Stats | undefined = await fsStat(dirPath);
    return !!stats && stats.isDirectory();
}


export function checkFileExistsSync(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isFile();
    } catch (e) {
    }
    return false;
}

export async function fsStat(filePath: fs.PathLike): Promise<fs.Stats | undefined> {
    let stats: fs.Stats | undefined;
    try {
        stats = await fs.promises.stat(filePath);
    } catch (e) {
        // File doesn't exist
        return undefined;
    }
    return stats;
}

export async function checkPathExists(filePath: string): Promise<boolean> {
    return !!(await fsStat(filePath));
}

/** Test whether a file exists */
export async function checkFileExists(filePath: string): Promise<boolean> {
    const stats: fs.Stats | undefined = await fsStat(filePath);
    return !!stats && stats.isFile();
}

/** Writes content to a text file */
export function writeFileText(filePath: string, content: string, encoding: BufferEncoding = "utf8"): Promise<void> {
    const folders: string[] = filePath.split(path.sep).slice(0, -1);
    if (folders.length) {
        // create folder path if it doesn't exist
        folders.reduce((previous, folder) => {
            const folderPath: string = previous + path.sep + folder;
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            return folderPath;
        });
    }

    return new Promise<void>((resolve, reject) => {
        fs.writeFile(filePath, content, { encoding }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function ensurePropertiesFile(): Promise<void> {
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		for (let i: number = 0; i < vscode.workspace.workspaceFolders.length; ++i) {
			const configFolder = path.join(vscode.workspace.workspaceFolders[i].uri.fsPath, '.vscode');
			const configFile = path.join(configFolder, 'llvm.json');
			
			if (await checkFileExists(configFile)) {
				continue;
			} else {
				try {
					if (!await checkDirectoryExists(configFolder)) {
						fs.mkdirSync(configFolder);
					}
					
					await writeFileText(configFile, "{}\n");
				} catch (errJS) {
					const err: Error = errJS as Error;
					vscode.window.showErrorMessage(`Failed to create llvm.json: ${err.message}`);
				}
			}
		}
	}
}

function loadConfig() {
	var cfg : any = {};
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		for (let i: number = 0; i < vscode.workspace.workspaceFolders.length; ++i) {
			const configFolder = path.join(vscode.workspace.workspaceFolders[i].uri.fsPath, '.vscode');
			const configFile = path.join(configFolder, 'llvm.json');

			let rawdata = fs.readFileSync(configFile);
			let config = JSON.parse(rawdata.toString());
			console.log(config);
			for(var k in config) cfg[k]=config[k];
		}
	}
	return cfg;
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-llvm" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-llvm.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vscode-llvm!');
	});

	let openSettings = vscode.commands.registerCommand('llvmPipelineView.settings', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		await ensurePropertiesFile();

		// Open the first workspace settings
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			let config = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'llvm.json');
			let doc = await vscode.workspace.openTextDocument(config);
			let edit1 = await vscode.window.showTextDocument( doc, undefined, true );
			console.log(edit1);
			vscode.window.showInformationMessage('llvmPipelineView.settings from vscode-llvm!');
		}
	});

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
	const provider = new ConfigViewProvider(context.extensionUri, core);
	const data_provider = new LLVMPipelineTreeDataProvider(core);
	const pipelineView = vscode.window.createTreeView('llvm-pipeline-view', { treeDataProvider: data_provider, showCollapseAll: true });
	const reloadAction = vscode.commands.registerCommand('vscode-llvm.reloadConfig', () => {
		provider.reloadConfig();
		vscode.window.showInformationMessage('reload config done from vscode-llvm!');
	});

	
	const myProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri) {
			console.log("provideTextDocumentContent", uri);
			if (uri.path === '/output') {
				return core.active?.output;
			} else if (uri.path.indexOf('/before/') === 0) {
				return core.active?.passList[Number(uri.path.slice(8))].before_ir;
			} else if (uri.path.indexOf('/after/') === 0) {
				return core.active?.passList[Number(uri.path.slice(7))].after_ir;
			} else if (uri.path.indexOf('/before-b/') === 0) {
				return core.active?.backendList[Number(uri.path.slice(10))].before_ir;
			} else if (uri.path.indexOf('/after-b/') === 0) {
				return core.active?.backendList[Number(uri.path.slice(9))].after_ir;
			}
		}
	})();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('vscode-llvm', myProvider));

	const myDecordator = vscode.window.registerFileDecorationProvider(new LLVMPipelineTreeItemDecorationProvider(core));
	context.subscriptions.push(myDecordator);

	let openPipelineView = vscode.commands.registerCommand('llvmPipelineView.open', async (...args) => {
		console.log(args);
		let pass = args[0] as Pass;
		let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(`vscode-llvm:/before${pass.backend?"-b":""}/${pass.index}`));
		let doc2 = await vscode.workspace.openTextDocument(vscode.Uri.parse(`vscode-llvm:/after${pass.backend?"-b":""}/${pass.index}`));
		console.log("openPipelineView vscode.diff");
		vscode.commands.executeCommand("vscode.diff", doc.uri, doc2.uri);
	});

	let openPipelineOutput = vscode.commands.registerCommand('llvmPipelineView.openOutput', async () => {
		let doc = await vscode.workspace.openTextDocument( vscode.Uri.parse(`vscode-llvm:/output`) );
		vscode.window.showTextDocument(doc, {preserveFocus: true, preview: true});
	});

	let openPipeline = vscode.commands.registerCommand('llvmPipelineView.run', async (...args) => {
		if (vscode.window.activeTextEditor && core.activeCmd) {
			let path = vscode.window.activeTextEditor.document.uri.path;
			core.ensurePipeline(core.activeCmd, path, new CommandEnv());
		}
	});

	
	let debugPipeline = vscode.commands.registerCommand('llvmPipelineView.run-debug', async (...args) => {
		if (vscode.window.activeTextEditor && core.activeCmd) {
			let path = vscode.window.activeTextEditor.document.uri.path;
			let debugConfig = new Debug();
			debugConfig.saveConfig(core.active);
		}
	});
	

	context.subscriptions.push(disposable);
	context.subscriptions.push(openSettings);
	context.subscriptions.push(pipelineView);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ConfigViewProvider.viewType, provider));
	context.subscriptions.push(reloadAction);
	context.subscriptions.push(openPipelineView);
	context.subscriptions.push(openPipelineOutput);
}

// this method is called when your extension is deactivated
export function deactivate() {}
