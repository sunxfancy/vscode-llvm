import * as assert from 'assert';
import { AsmFilter, AsmParser, BinaryAsmLine } from '../../asm';

suite('Assembly parser regressions', () => {
    function parse(text: string, options: Partial<AsmFilter> = {}) {
        return new AsmParser().process(text, Object.assign(new AsmFilter(), options));
    }

    test('handles empty assembly', () => {
        const result = parse('');
        assert.deepStrictEqual(result.asm, []);
        assert.strictEqual(result.labelDefinitions.size, 0);
    });

    test('maps Clang directory/file directives and source columns after filtering', () => {
        const result = parse('.file 1 "/project/src" "main.cpp"\n.loc 1 42 7\n\tmov eax, 1\n\tret');
        assert.deepStrictEqual(result.asm.map(line => line.text), ['  mov eax, 1', '  ret']);
        for (const line of result.asm) {
            assert.deepStrictEqual({ ...line.source }, { file: '/project/src/main.cpp', line: 42, column: 7 });
        }
    });

    test('clears source mapping at section boundaries and unknown file numbers', () => {
        const result = parse('.file 1 "main.cpp"\n.loc 1 3 0\nret\n.text\nret\n.loc 99 4 0\nret');
        assert.strictEqual(result.asm[0].source?.line, 3);
        assert.strictEqual(result.asm[1].source, undefined);
        assert.strictEqual(result.asm[2].source, undefined);
    });

    test('treats stdin debug locations as the current source', () => {
        const result = parse('.file 1 "<stdin>"\n.loc 1 9 0\nret');
        assert.deepStrictEqual({ ...result.asm[0].source }, { file: undefined, line: 9, column: 0 });
    });

    test('retains referenced labels and resolves jumps with one-based coordinates', () => {
        const result = parse('.Lunused:\n.Ltarget:\n\tjmp .Ltarget');
        assert.deepStrictEqual(result.asm.map(line => line.text), ['.Ltarget:', '  jmp .Ltarget']);
        assert.strictEqual(result.labelDefinitions.get('.Ltarget'), 1);
        const label = result.asm[1].labels[0];
        assert.strictEqual(label.name, '.Ltarget');
        assert.strictEqual(result.asm[1].text.slice(label.range.startCol - 1, label.range.endCol - 1), '.Ltarget');
    });

    test('does not create navigation links for undefined symbols or registers', () => {
        const result = parse('mov eax, external_symbol\nret');
        assert.deepStrictEqual(result.asm.map(line => line.labels), [[], []]);
    });

    test('retains data reached through a referenced label', () => {
        const result = parse('mov eax, .Ldata\n.Ldata:\n\t.string "hello   world"\n.Lunused:\n\t.string "unused"');
        assert.deepStrictEqual(result.asm.map(line => line.text),
            ['mov eax, .Ldata', '.Ldata:', '  .string "hello   world"']);
    });

    test('removes comment-only lines without removing instructions', () => {
        const result = parse('# comment\n; comment\n/* comment */\nret # keep instruction', { commentOnly: true });
        assert.deepStrictEqual(result.asm.map(line => line.text), ['ret # keep instruction']);
    });

    test('can retain directives, unused labels and original spacing', () => {
        const result = parse('.text\nunused:\n    mov   eax, 1', { directives: false, labels: false, trim: false });
        assert.deepStrictEqual(result.asm.map(line => line.text), ['.text', 'unused:', '    mov   eax, 1']);
    });

    test('keeps opcode-generating .inst directives', () => {
        assert.deepStrictEqual(parse('  .inst 0xd65f03c0').asm.map(line => line.text), ['  .inst 0xd65f03c0']);
    });

    test('parses CRLF assembly identically to LF', () => {
        const input = '.globl foo\nfoo:\n\tret\n';
        assert.deepStrictEqual(parse(input.replace(/\n/g, '\r\n')), parse(input));
    });

    test('parses binary addresses, opcodes and source locations', () => {
        const result = parse('0000000000000010 <foo>:\n/project/main.cpp:7\n  10: 90 nop\n  11: c3 ret', { binary: true });
        assert.strictEqual(result.labelDefinitions.get('foo'), 1);
        const instruction = result.asm[1] as BinaryAsmLine;
        assert.ok(instruction instanceof BinaryAsmLine);
        assert.strictEqual(instruction.address, 16);
        assert.strictEqual(instruction.opcodes, '90');
        assert.strictEqual(instruction.source?.file, '/project/main.cpp');
        assert.strictEqual(instruction.source?.line, 7);
        assert.strictEqual(instruction.value, '<00000010>  nop\n');
    });

    test('preserves binary error documents', () => {
        assert.strictEqual(parse('<compilation failed>', { binary: true }).asm[0].value, '<compilation failed>\n');
    });

    test('does not leak labels or source mappings between parses', () => {
        const parser = new AsmParser();
        parser.process('.file 1 "main.cpp"\n.loc 1 4 0\n.Lloop:\njmp .Lloop', new AsmFilter());
        const result = parser.process('ret', new AsmFilter());
        assert.strictEqual(result.labelDefinitions.size, 0);
        assert.strictEqual(result.asm[0].source, undefined);
        assert.deepStrictEqual(result.asm[0].labels, []);
    });
});
