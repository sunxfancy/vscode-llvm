CONTRIBUTING
=======================


## How to develope this extension

We use yarn to manage dependencies. You can install yarn from [here](https://yarnpkg.com/en/docs/install).
Then, please run `yarn` to install dependencies.

### Some useful scripts

- `yarn run compile`: compile typescript files
- `yarn run watch`: watch and compile typescript files automatically
- `yarn run package`: package extension 

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

