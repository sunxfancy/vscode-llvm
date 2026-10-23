CONTRIBUTING
=======================


## How to develope this extension

We use yarn to manage dependencies. You can install yarn from [here](https://yarnpkg.com/en/docs/install).
Then, please run `yarn` to install dependencies.

### Some useful scripts

- `yarn run compile`: compile typescript files
- `yarn run watch`: watch and compile typescript files automatically
- `yarn run package`: package extension 

### Regression tests

Run `npm run test:unit` (or `yarn test:unit`) for the deterministic Node.js
regression suite. It compiles TypeScript and tests command tokenization, URI
decoding, assembly filtering, label navigation, source mappings and binary
disassembly. Compiler regressions also cover Clang/NVCC dry-run stages, cc1
arguments and LLVM pass state transitions using synthetic compiler output.
Only VS Code workspace access and compiler execution are stubbed for those tests;
the command and pass parsers run normally. These tests need no VS Code download,
display server, Clang or CUDA toolkit and do not verify actual compiler compatibility.

Run `npm run lint` and `npm run compile` for lint and extension bundle checks.
The existing `yarn test` additionally launches VS Code through
`@vscode/test-electron`; its compiler integration tests require both `clang++`
and `nvcc` on PATH and a display (or a virtual display on Linux). Those tests
are separate from the standalone Node.js suite.

### How to submit to the marketplace

Please see [here](https://code.visualstudio.com/docs/extensions/publish-extension).

Make sure you have Node.js installed. Then run:
```sh
npm install -g @vscode/vsce
```

Remember to change the version number in `package.json` before publishing.
Then you can publish the extension by running:
```sh
vsce package
vsce publish
```

