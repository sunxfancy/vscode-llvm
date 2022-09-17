import * as vscode from 'vscode';
import { CommandEnv } from './clang';
import { Core } from './core';
import { getNonce } from './utils';

export class ConfigViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'llvm-control';
	private view?: vscode.WebviewView;

	constructor(
		private readonly extensionUri: vscode.Uri,
		private core: Core,
		subscriptions: vscode.Disposable[]
	) {
		subscriptions.push(vscode.window.registerWebviewViewProvider(ConfigViewProvider.viewType, this));
	}

	public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
		this.view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionUri]
		};

		webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'select': {
					this.core.activeCmd = data.value;
					vscode.commands.executeCommand('llvmPipelineView.run');
					break;
				}
				case 'compare': {
					break;
				}
			}
		});
	}

	public addConfig(command: string) {
		if (this.view) {
			this.view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this.view.webview.postMessage({ type: 'addConfig' });
		}
	}

	public reloadConfig() {
		console.log('reloadConfig!');
		if (this.view) {
			this.view.webview.postMessage({ type: 'reloadConfig' });
		}
	}

	private getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
			</head>
			<body>
				<ul class="command-list">
				</ul>
				<input class="add-config-text" type="text" placeholder="clang -O3" />
				<div class="btn-container"> 
					<button class="config-btn" id="add-config-button">New Config</button>
					<button class="config-btn" id="delete-config-button">Delete</button>
					<button class="config-btn" id="compare-button">Compare</button>
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
