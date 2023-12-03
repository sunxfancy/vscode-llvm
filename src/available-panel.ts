import * as vscode from 'vscode';

/**
 * This class provides the content for the tree view.
 */
export class AvailableNode {
	private children: AvailableNode[] = [];

	constructor(
		private label: string,
		private command?: string,
		private parent?: AvailableNode) {
		parent?.children.push(this);
	}

	public removeChildren() {
		this.children = [];
	}

	public isLeaf() {
		return this.getParent() ? true : false;
	}

	public getChildren() {
		if (this.children.length > 0) {
			return this.children;
		}

		if (this.label === 'print passes') {
			new AvailableNode("Print Call Graph", "-passes=dot-callgraph -disable-output", this);
			new AvailableNode("Print Control Flow Graph", "-passes=dot-cfg -disable-output", this);
			new AvailableNode("Print Simple CFG", "-passes=dot-cfg-only -disable-output", this);
			new AvailableNode("Print Dominance Tree", "-passes=dot-dom -disable-output", this);
			new AvailableNode("Print Simple DOM Tree", "-passes=dot-dom-only -disable-output", this);
		}

		if (this.label === 'transform passes') {
			new AvailableNode("Promote Memory to Register (mem2reg - SSA construction)", "-passes=mem2reg", this);
			new AvailableNode("Demote All Values to Stack Slots (reg2mem)", "-passes=reg2mem", this);
			new AvailableNode("Dead Code Elimination", "-passes=dce", this);
		}

		return this.children;
	}

	public getParent() {
		return this.parent;
	}

	public getTreeItem(): vscode.TreeItem {
		let cmd = {
			title: 'Run Available Pass',
			command: 'llvmAvailableView.runAvailPass',
			arguments: [this.command]
		};

		const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${this.label}`, true);
		return {
			label: { label: this.label },
			tooltip,
			collapsibleState:
				this.getChildren().length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
			command: cmd
		};
	}
};


export class LLVMAvailablePassDataProvider implements vscode.TreeDataProvider<AvailableNode> {
	constructor(subscriptions: vscode.Disposable[]) {
		subscriptions.push(vscode.window.createTreeView(
			'llvm-pass-view', { treeDataProvider: this, showCollapseAll: true }));
	}
	private _onDidChangeTreeData = new vscode.EventEmitter<AvailableNode | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	public refresh(): void {
		for (let node of LLVMAvailablePassDataProvider.tree_nodes) {
			node.removeChildren();
		}
		this._onDidChangeTreeData.fire();
	}

	getChildren(element?: AvailableNode): AvailableNode[] {
		if (!element) {
			return LLVMAvailablePassDataProvider.tree_nodes;
		} else {
			return element.getChildren();
		}
	}

	getTreeItem(element: AvailableNode): vscode.TreeItem {
		return element.getTreeItem();
	}

	getParent(element: AvailableNode) {
		return element.getParent();
	}

	static readonly tree_nodes = [
		new AvailableNode('print passes'),
		new AvailableNode('transform passes'),
	];
}
