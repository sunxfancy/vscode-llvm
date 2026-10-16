import * as assert from 'assert';
import { expandTabs, parseShellArg, splitLines, splitURI, squashHorizontalWhitespace } from '../../utils';
import type { Uri } from 'vscode';

suite('Utility regressions', () => {
    test('preserves quoted executable and source paths', () => {
        assert.deepStrictEqual(parseShellArg('"/tools with spaces/clang++" -o "build dir/main.s" \'source dir/main.cpp\''),
            ['/tools with spaces/clang++', '-o', 'build dir/main.s', 'source dir/main.cpp']);
    });

    test('ignores whitespace between arguments', () => {
        assert.deepStrictEqual(parseShellArg('  opt\t-S\ninput.ll  '), ['opt', '-S', 'input.ll']);
        assert.strictEqual(parseShellArg(' \t\n'), undefined);
        assert.strictEqual(parseShellArg(''), undefined);
    });

    test('splits LF and CRLF without a spurious final line', () => {
        assert.deepStrictEqual(splitLines('a\r\nb\n'), ['a', 'b']);
        assert.deepStrictEqual(splitLines('a\n\n'), ['a', '']);
        assert.deepStrictEqual(splitLines('a'), ['a']);
        assert.deepStrictEqual(splitLines(''), []);
    });

    test('expands consecutive tabs to eight-column stops', () => {
        assert.strictEqual(expandTabs('\ta\tb'), '        a       b');
        assert.strictEqual(expandTabs('12345678\tx'), '12345678        x');
    });

    test('normalizes indentation while preserving quoted whitespace and escapes', () => {
        assert.strictEqual(squashHorizontalWhitespace('    mov    eax,   ebx', true), '  mov eax, ebx');
        assert.strictEqual(squashHorizontalWhitespace('  .ascii "a   b\\\" c"    # comment', true),
            '  .ascii "a   b\\\" c" # comment');
    });

    test('decodes URI components after splitting encoded slashes', () => {
        const command = 'clang++ /tmp/source dir/main.cpp';
        const uri = { path: `/${encodeURIComponent(command)}/after-b/12` } as Uri;
        assert.deepStrictEqual(splitURI(uri), { pipeline: command, catergory: 'after-b', index: 12 });
    });
});
