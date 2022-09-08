import * as vscode from 'vscode';

export class TestView {

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('llvm-pipeline-view', { treeDataProvider: aNodeWithIdTreeDataProvider(), showCollapseAll: true });
		context.subscriptions.push(view);
	}
}

const tree: any = {
	'input': {
        'main.c': {
            'B': {}
        }
	},
	'front end': {
		'ba': {},
		'bb': {}
	},
    'middle end': {
        'pass1': {},
        'pass2': {}
    },
    'back end': {
        'pass1': {},
        'pass2': {}
    }
};
const nodes: any = {};

function aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<{ key: string }> {
	return {
		getChildren: (element: { key: string }): { key: string }[] => {
			return getChildren(element ? element.key : undefined).map(key => getNode(key));
		},
		getTreeItem: (element: { key: string }): vscode.TreeItem => {
			const treeItem = getTreeItem(element.key);
			treeItem.id = element.key;
			return treeItem;
		},
		getParent: ({ key }: { key: string }): { key: string } | undefined => {
			const parentKey = key.substring(0, key.length - 1);
			return parentKey ? new Key(parentKey) : undefined;
		}
	};
}

function getChildren(key: string | undefined): string[] {
	if (!key) {
		return Object.keys(tree);
	}
	const treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key: string): vscode.TreeItem {
	const treeElement = getTreeElement(key);
	// An example of how to use codicons in a MarkdownString in a tree item tooltip.
	const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${key}`, true);
	return {
		label: /**vscode.TreeItemLabel**/<any>{ label: key },
		tooltip,
		collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
	};
}

function getTreeElement(element: string): any {
	let parent = tree;
	for (let i = 0; i < element.length; i++) {
		parent = parent[element.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}

function getNode(key: string): { key: string } {
	if (!nodes[key]) {
		nodes[key] = new Key(key);
	}
	return nodes[key];
}

class Key {
	constructor(readonly key: string) { }
}
