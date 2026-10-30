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
`yarn test` additionally launches VS Code through `@vscode/test-electron`.
Its integration suite requires `clang++` on PATH and a display (or Xvfb on
Linux). It checks real Clang preprocessing/IR stages and C++ compilation with
a relative header. The real NVCC test is explicitly skipped when the CUDA
toolkit is absent; synthetic NVCC parser coverage still runs in `test:unit`.
The extension-host runner loads only `src/test/suite` tests so standalone unit
test mocks cannot replace VS Code APIs in the integration process.

### Continuous integration

GitHub Actions runs on pushes and pull requests to `main` and `dev`, and can
also be started manually. Build jobs use Node.js 22 and 24 to run lint, all
44 standalone regressions, and a production webpack build. Integration jobs
use Node.js 22, Clang, and Xvfb with VS Code 1.96.4 and the latest stable release.
Dependencies are installed with Yarn Classic 1.22.22 and the frozen lockfile;
Yarn downloads are cached. Failed integration runs upload VS Code logs for
seven days. CI requires no repository secrets and does not publish releases.

To reproduce the integration job on Linux, install Clang and Xvfb, then run:

```sh
yarn install --frozen-lockfile --non-interactive
yarn compile-tests
yarn compile
VSCODE_TEST_VERSION=1.96.4 xvfb-run -a yarn runtest
```

`VSCODE_TEST_VERSION` defaults to `stable`. Set `VSCODE_EXECUTABLE_PATH` to use
an existing local VS Code executable instead of downloading one. Set
`LLVM_TEST_CLANG` to select a Clang executable outside PATH.

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

