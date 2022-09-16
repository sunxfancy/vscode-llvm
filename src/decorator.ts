'use strict';

import { TextEditor, window, TextEditorDecorationType, Range, ThemeColor, workspace, Uri, Disposable, TextEditorRevealType } from 'vscode';
import { AsmProvider } from './provider';
import { AsmDocument } from './document';
import { AsmLine } from './asm';
import * as path from 'path';

export class AsmDecorator {

    private srcEditor: TextEditor;
    private asmEditor: TextEditor;
    private provider: AsmProvider;
    private selectedLineDecorationType: TextEditorDecorationType;
    private unusedLineDecorationType: TextEditorDecorationType;
    private registrations: Disposable;
    private document!: AsmDocument;

    // mappings from source lines to assembly lines
    private mappings = new Map<number, number[]>();

    constructor(srcEditor: TextEditor, asmEditor: TextEditor, provider: AsmProvider) {
        this.srcEditor = srcEditor;
        this.asmEditor = asmEditor;
        this.provider = provider;

        this.selectedLineDecorationType = window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: new ThemeColor('editor.findMatchHighlightBackground'),
            overviewRulerColor: new ThemeColor('editorOverviewRuler.findMatchForeground')
        });

        this.unusedLineDecorationType = window.createTextEditorDecorationType({
            opacity: '0.5'
        });

        const uri = asmEditor.document.uri;
        // rebuild decorations on asm document change
        const providerEventRegistration = provider.onDidChange(changedUri => {
            if (changedUri.toString() === uri.toString()) {
                this.load(uri);
            }
        });
        this.load(uri);

        this.registrations = Disposable.from(
            this.selectedLineDecorationType,
            this.unusedLineDecorationType,
            providerEventRegistration,
            window.onDidChangeTextEditorSelection(e => {
                this.updateSelection(e.textEditor);
            }),
            window.onDidChangeVisibleTextEditors(editors => {
                // decorations are useless if one of editors become invisible
                if (editors.indexOf(srcEditor) === -1 || editors.indexOf(asmEditor) === -1) {
                    this.dispose();
                }
            })
        );
    }

    dispose(): void {
        this.registrations.dispose();
    }

    private load(uri: Uri) {
        this.document = this.provider.provideAsmDocument(uri);
        this.loadMappings();

        const dimUnused = workspace.getConfiguration('', this.srcEditor.document.uri)
            .get('disasexpl.dimUnusedSourceLines', true);

        if (dimUnused) {
            this.dimUnusedSourceLines();
        }
    }

    private asmLineHasSource(asmLine: AsmLine) {
        const sourcePath = this.srcEditor.document.uri.path;
        const asmLineSourcePath = asmLine.source?.file;

        if (asmLineSourcePath === undefined) {
            return false;
        }

        const asmLineSourceBasename = path.basename(asmLineSourcePath);

        // assembly may contain lines from different source files,
        // thus we should check that line comes from current opened file
        if (!sourcePath.endsWith(asmLineSourceBasename)) {
            return false;
        }

        return true;
    }

    private loadMappings() {
        this.mappings.clear();

        this.document.lines.forEach((line, index) => {
            if (!this.asmLineHasSource(line)) {
                return;
            }
            const sourceLine = line.source!.line - 1;
            if (this.mappings.get(sourceLine) === undefined) {
                this.mappings.set(sourceLine, []);
            }
            this.mappings.get(sourceLine)!.push(index);
        });
    }

    updateSelection(editor: TextEditor): void {
        if (editor === this.srcEditor) {
            this.srcLineSelected(this.srcEditor.selection.start.line);
        } else if (editor === this.asmEditor) {
            this.asmLineSelected(this.asmEditor.selection.start.line);
        }
    }

    private dimUnusedSourceLines() {
        const unusedSourceLines: Range[] = [];
        for (let line = 0; line < this.srcEditor.document.lineCount; line++) {
            if (this.mappings.get(line) === undefined) {
                unusedSourceLines.push(this.srcEditor.document.lineAt(line).range);
            }
        }
        this.srcEditor.setDecorations(this.unusedLineDecorationType, unusedSourceLines);
    }

    private srcLineSelected(line: number) {
        const srcLineRange = this.srcEditor.document.lineAt(line).range;
        this.srcEditor.setDecorations(this.selectedLineDecorationType, [srcLineRange]);

        const asmLinesRanges: Range[] = [];
        const mapped = this.mappings.get(line);
        if (mapped !== undefined) {
            mapped.forEach(line => {
                if (line >= this.asmEditor.document.lineCount) {
                    return;
                }
                asmLinesRanges.push(this.asmEditor.document.lineAt(line).range);
            });
        }
        this.asmEditor.setDecorations(this.selectedLineDecorationType, asmLinesRanges);

        if (asmLinesRanges.length > 0) {
            this.asmEditor.revealRange(asmLinesRanges[0], TextEditorRevealType.InCenterIfOutsideViewport);
        }
    }

    private asmLineSelected(line: number) {
        const asmLine = this.document.lines[line];

        const asmLineRange = this.asmEditor.document.lineAt(line).range;
        this.asmEditor.setDecorations(this.selectedLineDecorationType, [asmLineRange]);

        if (this.asmLineHasSource(asmLine)) {
            const srcLineRange = this.srcEditor.document.lineAt(asmLine.source!.line - 1).range;
            this.srcEditor.setDecorations(this.selectedLineDecorationType, [srcLineRange]);
            this.srcEditor.revealRange(srcLineRange, TextEditorRevealType.InCenterIfOutsideViewport);
        } else {
            this.srcEditor.setDecorations(this.selectedLineDecorationType, []);
        }
    }

}
