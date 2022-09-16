import * as vscode from 'vscode';
import { Core, Pass } from './core';
import { FileDecoration, FileDecorationProvider, ProviderResult, ThemeColor, Uri } from "vscode";

/** This class will decorate the tree view and dim the item when the IRs are same */
export class LLVMPipelineTreeItemDecorationProvider implements FileDecorationProvider {
	constructor(private core: Core, subscriptions: vscode.Disposable[]) {
		subscriptions.push(vscode.window.registerFileDecorationProvider(this));
	}

    private readonly dimColor = new ThemeColor("list.deemphasizedForeground");

    public provideFileDecoration(uri: Uri): ProviderResult<FileDecoration>  {
        if (uri.scheme !== "vscode-llvm") return;

		if (uri.path.startsWith('/before/')) {
			let k = Number(uri.path.slice(8));
			if (this.core.active?.passList[k].before_ir == this.core.active?.passList[k].after_ir) {
				return {
					color: this.dimColor,
				}; 
			}
		} 

		if (uri.path.startsWith('/before-b/')) {
			let k = Number(uri.path.slice(10));
			if (this.core.active?.backendList[k].before_ir == this.core.active?.backendList[k].after_ir) {
				return {
					color: this.dimColor,
				}; 
			}
		}
    }
}


export class PipelineNode {
	private children: PipelineNode[] = [];

	constructor(
		private label: string, 
		private parent?: PipelineNode, 
		private pass?: Pass) 
	{
		parent?.children.push(this);
	}

	public isLeaf() {
		return this.getParent() ? true : false;
	}

	public getChildren(core: Core) {
		if (this.children.length > 0) {
			return this.children;
		}
		if (core.active) {
			if (this.label === 'input') {
				let src = new PipelineNode(core.active.command.input, this);
			}
			if (this.label === 'front end') {
				let i = new PipelineNode("after preprocessing", this);
				let ast = new PipelineNode("Clang AST", this);
				let ir = new PipelineNode("LLVM IR", this);
			}
			if (this.label === 'middle end') {
				for (let pass of core.active.passList) {
					let p = new PipelineNode(pass.name, this, pass);
				}
			}
			if (this.label === 'back end') {
				for (let pass of core.active.backendList) {
					let p = new PipelineNode(pass.name, this, pass);
				}
			}
		}
		return this.children;
	}

	public getParent() {
		return this.parent;
	}

	public getTreeItem(core: Core): vscode.TreeItem {
		var cmd;
		if (!this.getParent() && this.label != 'output') { cmd = void 0; }
		else {
			if (this.label === 'output') {
				cmd = {
					command: 'llvmPipelineView.openOutput',
					title: 'Open Output'
				};
			} else if (this.pass) {
				cmd = {
					command: 'llvmPipelineView.open',
					arguments: [this.pass],
					title: 'Open Pipeline Compare View'
				};
			}
		} 

		// An example of how to use codicons in a MarkdownString in a tree item tooltip.
		const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${this.label}`, true);
		return {
			label: /**vscode.TreeItemLabel**/<any>{ label: this.label },
			tooltip,
			collapsibleState: core.active ? 
				(this.getChildren(core).length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None) 
				: vscode.TreeItemCollapsibleState.None,
			command: cmd,
			resourceUri: this.pass ? vscode.Uri.parse(`vscode-llvm:/before${this.pass.backend?"-b":""}/${this.pass.index}`) : undefined
		};
	}
};


export class LLVMPipelineTreeDataProvider implements vscode.TreeDataProvider<PipelineNode> {
	constructor(private core: Core, subscriptions: vscode.Disposable[]) { 
		core.setProvider(this); 
		subscriptions.push(vscode.window.createTreeView(
			'llvm-pipeline-view', { treeDataProvider: this, showCollapseAll: true }));
	}
	private _onDidChangeTreeData = new vscode.EventEmitter<PipelineNode | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	public refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getChildren(element?: PipelineNode): PipelineNode[] {
		if (!element) {
			return LLVMPipelineTreeDataProvider.tree_nodes;
		} else {
			return element.getChildren(this.core); 
		}
	}
	
	getTreeItem(element: PipelineNode): vscode.TreeItem {
		return element.getTreeItem(this.core);
	}

	getParent(element: PipelineNode) {
		return element.getParent();
	}

	static readonly tree_nodes = [
		new PipelineNode('input'),
		new PipelineNode('front end'),
		new PipelineNode('middle end'),
		new PipelineNode('back end'),
		new PipelineNode('output')
	];
}

