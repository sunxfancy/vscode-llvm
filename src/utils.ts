// Copyright (c) 2016, Matt Godbolt
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

const tabsRe = /\t/g;
const lineRe = /\r?\n/;
const findQuotes = /(.*?)("(?:[^"\\]|\\.)*")(.*)/;

export function splitLines(text: string): string[] {
    const result = text.split(lineRe);
    if (result.length > 0 && result[result.length - 1] === '') {
        return result.slice(0, result.length - 1);
    }
    return result;
}

export function expandTabs(line: string): string {
    let extraChars = 0;
    return line.replace(tabsRe, function (_match, offset) {
        const total = offset + extraChars;
        const spacesNeeded = (total + 8) & 7;
        extraChars += spacesNeeded - 1;
        return "        ".substring(spacesNeeded);
    });
}

export function squashHorizontalWhitespace(line: string, atStart: boolean): string {
    const quotes = line.match(findQuotes);
    if (quotes) {
        return squashHorizontalWhitespace(quotes[1], atStart) + quotes[2] +
            squashHorizontalWhitespace(quotes[3], false);
    }
    const splat = line.split(/\s+/);
    if (splat[0] === "" && atStart) {
        // An indented line: preserve a two-space indent
        return "  " + splat.slice(1).join(" ");
    } else {
        return splat.join(" ");
    }
}

export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}