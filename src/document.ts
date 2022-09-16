'use strict';

import { workspace, Uri, EventEmitter, FileSystemWatcher } from 'vscode';
import { AsmParser, AsmLine, AsmFilter } from './asm';

export class AsmDocument {

    private _uri: Uri;
    private _emitter: EventEmitter<Uri>;
    private _watcher: FileSystemWatcher;
    lines: AsmLine[] = [];
    sourceToAsmMapping = new Map<number, number[]>();

    constructor(uri: Uri, emitter: EventEmitter<Uri>) {
        this._uri = uri;

        // The AsmDocument has access to the event emitter from
        // the containg provider. This allows it to signal changes
        this._emitter = emitter;

        // Watch for underlying assembly file and reload it on change
        this._watcher = workspace.createFileSystemWatcher(uri.path);
        this._watcher.onDidChange(() => this.updateLater());
        this._watcher.onDidCreate(() => this.updateLater());
        this._watcher.onDidDelete(() => this.updateLater());

        this.update();
    }

    private updateLater() {
        // Workarond for https://github.com/Microsoft/vscode/issues/72831
        setTimeout(() => this.update(), 100);
    }

    private update() {
        const useBinaryParsing = workspace.getConfiguration('', this._uri.with({scheme: 'file'}))
            .get('disasexpl.useBinaryParsing', false);

        workspace.openTextDocument(this._uri.with({ scheme: 'file' })).then(doc => {
            const filter = new AsmFilter();
            filter.binary = useBinaryParsing;
            this.lines = new AsmParser().process(doc.getText(), filter).asm;
        }, () => {
            this.lines = [new AsmLine(`Failed to load file '${this._uri.path}'`, undefined, [])];
        }).then(() => this._emitter.fire(this._uri));
    }

    get value(): string {
        return this.lines.reduce((result, line) => result += line.value, '');
    }

    dispose(): void {
        this._watcher.dispose();
    }

}
