import * as vscode from 'vscode';
import { Core, Pass } from './core';


/**
 * This class provides the content for the tree view.
 */
export class AvailableNode {
	private children: AvailableNode[] = [];

	constructor(
		private label: string,
		private parent?: AvailableNode,
		private pass?: Pass) {
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
				let name = core.active.command.getInputPath();
				if (name) {
					let src = new AvailableNode(name, this);
				}
			}
			if (this.label === 'front end') {
				let i = new AvailableNode("After Preprocessing", this);
				let ast = new AvailableNode("Clang AST", this);
				let ir = new AvailableNode("LLVM IR", this);
			}
			if (this.label === 'middle end') {
				for (let pass of core.active.passList) {
					let p = new AvailableNode(pass.name, this, pass);
				}
			}
			if (this.label === 'back end') {
				for (let pass of core.active.backendList) {
					let p = new AvailableNode(pass.name, this, pass);
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
			} else if (this.label === 'After Preprocessing') {
				cmd = {
					command: 'llvmPipelineView.openPreprocessed',
					title: 'Open Preprocessed'
				};
			} else if (this.label === 'Clang AST') {
				cmd = {
					command: 'llvmPipelineView.openAST',
					title: 'Open AST'
				};
			} else if (this.label === 'LLVM IR') {
				cmd = {
					command: 'llvmPipelineView.openLLVM',
					title: 'Open LLVM IR'
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
			resourceUri: this.pass ? vscode.Uri.parse(`vscode-llvm:/before${this.pass.backend ? "-b" : ""}/${this.pass.index}`) : undefined
		};
	}
};


export class LLVMAvailablePassDataProvider implements vscode.TreeDataProvider<AvailableNode> {
	constructor(private core: Core, subscriptions: vscode.Disposable[]) {
		// core.setProvider(this);
		subscriptions.push(vscode.window.createTreeView(
			'llvm-pipeline-view', { treeDataProvider: this, showCollapseAll: true }));
	}
	private _onDidChangeTreeData = new vscode.EventEmitter<AvailableNode | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	public refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getChildren(element?: AvailableNode): AvailableNode[] {
		if (!element) {
			return LLVMAvailablePassDataProvider.tree_nodes;
		} else {
			return element.getChildren(this.core);
		}
	}

	getTreeItem(element: AvailableNode): vscode.TreeItem {
		return element.getTreeItem(this.core);
	}

	getParent(element: AvailableNode) {
		return element.getParent();
	}

	static readonly tree_nodes = [
		new AvailableNode('input'),
		new AvailableNode('front end'),
		new AvailableNode('middle end'),
		new AvailableNode('back end'),
		new AvailableNode('output')
	];
}
