import * as vscode from 'vscode';
import { ComparedPipeline, Core, Pass } from './core';
import { FileDecoration, FileDecorationProvider, ProviderResult, ThemeColor, Uri } from "vscode";
import { splitURI } from './utils';

/** This class will decorate the tree view and dim the item when the IRs are same */
export class LLVMPipelineTreeItemDecorationProvider implements FileDecorationProvider {
	constructor(private core: Core, subscriptions: vscode.Disposable[]) {
		subscriptions.push(vscode.window.registerFileDecorationProvider(this));
	}

	private readonly dimColor = new ThemeColor("list.deemphasizedForeground");

	public provideFileDecoration(uri: Uri): ProviderResult<FileDecoration> {
		if (uri.scheme !== "vscode-llvm") return;

		let { pipeline, catergory, index } = splitURI(uri);

		if (catergory == 'before') {
			if (this.core.get(pipeline)?.passList[index].same) {
				return { color: this.dimColor };
			}
		}

		if (catergory == 'before-b') {
			if (this.core.get(pipeline)?.backendList[index].same) {
				return { color: this.dimColor };
			}
		}
	}
}

/**
 * This class provides the content for the tree view.
 */
export class PipelineNode {
	private children: PipelineNode[] = [];

	constructor(
		private label: string,
		private parent?: PipelineNode,
		private pass?: Pass,
		private pass2?: Pass) {
		parent?.children.push(this);
	}

	public removeChildren() {
		this.children = [];
	}

	public isLeaf() {
		return this.getParent() ? true : false;
	}

	public createNodeForDiff(core: Core, passList1?: Pass[], passList2?: Pass[]) {
		if (!passList1 || !passList2) return;

		let theSame = new PipelineNode("The Same", this);
		let diff = new PipelineNode("Different", this);

		let min = Math.min(passList1.length, passList2.length);
		let i = 0;
		for (; i < min; ++i) {
			let pass1 = passList1[i];
			let pass2 = passList2[i];
			if (pass1.name === pass2.name &&
				pass1.before_ir === pass2.before_ir &&
					pass1.after_ir === pass2.after_ir) {
				new PipelineNode(pass1.name, theSame, pass1);
			} else {
				break;
			}
		}

		let diff0 = new PipelineNode("Different in Common", diff);
		for (let j = i; j < min; ++j) {
			let pass1 = passList1[j];
			let pass2 = passList2[j];
			new PipelineNode(pass1.name + " vs " + pass2.name, diff0, pass1, pass2);
		}

		let diff1 = new PipelineNode("Different in 1", diff);
		for (let j = i; j < passList1.length; ++j) {
			let pass1 = passList1[j];
			new PipelineNode(pass1.name, diff1, pass1);
		}

		let diff2 = new PipelineNode("Different in 2", diff);
		for (let j = min; j < passList2.length; ++j) {
			let pass2 = passList2[j];
			new PipelineNode(pass2.name, diff2, pass2);
		}
	}

	public getChildren(core: Core) {
		if (this.children.length > 0) {
			return this.children;
		}
		if (core.active) {
			if (this.label === 'input') {
				let name = core.active.command.getInputPath();
				if (name) {
					new PipelineNode(name, this);
				}
			}
			if (this.label === 'front end') {
				new PipelineNode("After Preprocessing", this);
				new PipelineNode("Clang AST", this);
				new PipelineNode("LLVM IR", this);
			}
			if (this.label === 'middle end') {
				if (core.active?.isCompare() == false) {
					for (let pass of core.active.passList) {
						new PipelineNode(pass.name, this, pass);
					}
				} else {
					let active = (core.active as ComparedPipeline);
					let passList1 = active.linked_pipeline?.passList;
					let passList2 = active.linked_pipeline2?.passList;
					this.createNodeForDiff(core, passList1, passList2);
				}
			}
			if (this.label === 'back end') {
				if (core.active?.isCompare() == false) {
					for (let pass of core.active.backendList) {
						new PipelineNode(pass.name, this, pass);
					}
				} else {
					let active = (core.active as ComparedPipeline);
					let passList1 = active.linked_pipeline?.backendList;
					let passList2 = active.linked_pipeline2?.backendList;
					this.createNodeForDiff(core, passList1, passList2);
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
				if (core.active?.isCompare() == false) {
					cmd = {
						// command: 'llvmPipelineView.openOutput',
						// Now, we use AsmView instead the old output view.
						command: 'llvmAsmView.openOutput',
						title: 'Open Output'
					};
				} else {
					cmd = {
						command: 'llvmPipelineView.openOutput',
						title: 'Open Output'
					};
				}
			} else if (this.pass) {
				if (this.pass2 === undefined) {
					cmd = {
						command: 'llvmPipelineView.open',
						arguments: [this.pass],
						title: 'Open Pipeline Compare View'
					};
				} else {
					cmd = {
						command: 'llvmPipelineView.openCompare',
						arguments: [this.pass, this.pass2],
						title: 'Open Pipeline Compare View'
					};
				}

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

		const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${this.label}`, true);
		return {
			label: { label: this.label },
			tooltip,
			collapsibleState: core.active ?
				(this.getChildren(core).length > 0 ?
					vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None)
				: vscode.TreeItemCollapsibleState.None,
			command: cmd,

			// TODO: change this uri for the different in common node.
			resourceUri: this.pass ? vscode.Uri.parse(
				`vscode-llvm:/${encodeURIComponent(this.pass.parent.raw_command)}/`+
				`before${this.pass.backend ? "-b" : ""}/${this.pass.index}`) : undefined
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
		for (let node of LLVMPipelineTreeDataProvider.tree_nodes) {
			node.removeChildren();
		}
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

