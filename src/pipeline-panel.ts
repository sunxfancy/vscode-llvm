import * as vscode from 'vscode';
import { Core } from './core';

export class PipelineNode {
	private parent: PipelineNode | null;
	private children: PipelineNode[] = [];
	private label: string;
	private leaf = true;

	constructor(parent: PipelineNode | null, label: string) {
		this.parent = parent;
		if (parent === null) this.leaf = false;
		parent?.children.push(this);
		this.label = label;
	}

	public getChildren(core: Core) {
		console.log("PipelineNode getChildren");
		if (this.children.length > 0) {
			return this.children;
		}
		if (core.active) {
			if (this.label === 'input') {
				let src = new PipelineNode(this, core.active.command.input);
				this.children.push(src);
			}
			if (this.label === 'output') {
				
			}

		}
		return this.children;
	}

	public getParent() {
		return this.parent;
	}

	public getTreeItem(core: Core): vscode.TreeItem {
		// An example of how to use codicons in a MarkdownString in a tree item tooltip.
		const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${this.label}`, true);
		return {
			label: /**vscode.TreeItemLabel**/<any>{ label: this.label },
			tooltip,
			collapsibleState: core.active ? 
				(this.getChildren(core).length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None) 
				: vscode.TreeItemCollapsibleState.None
		};
	}
};


var tree: any = {
	'input': new PipelineNode(null, 'input'),
	'front end': new PipelineNode(null, 'front end'),
	'middle end': new PipelineNode(null, 'middle end'),
	'back end': new PipelineNode(null, 'back end'),
	'output': new PipelineNode(null, 'output')
};


export class LLVMPipelineTreeDataProvider implements vscode.TreeDataProvider<PipelineNode> {
	private core: Core;
	constructor(core: Core) { this.core = core; core.setProvider(this); }
	private _onDidChangeTreeData: vscode.EventEmitter<PipelineNode | undefined | null | void> = new vscode.EventEmitter<PipelineNode | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<PipelineNode | undefined | null | void> = this._onDidChangeTreeData.event;

	public refresh(): void {
		this._onDidChangeTreeData.fire();
		console.log("refresh the data provider");
	}

	getChildren(element?: PipelineNode): PipelineNode[] {
		console.log("getChildren", element);
		if (!element) {
			return Object.keys(tree).map(key => tree[key]);
		} else {
			return element.getChildren(this.core); 
		}
	}
	
	getTreeItem(element: PipelineNode): vscode.TreeItem {
		console.log("getTreeItem ", element);
		return element.getTreeItem(this.core);
	}

	getParent(element: PipelineNode): PipelineNode | null {
		return element.getParent();
	}
}

export function getTree() {
	return tree;
}