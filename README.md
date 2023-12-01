# VSCode LLVM Compiler Explorer

This is a tool for compiler developers of LLVM. This vscode extension can support exploring LLVM IR and machine IR after each pass. 

## Features

1. Run a custom clang command and explore each phase of LLVM passes.
2. Compare difference between IRs before and after running a pass.
3. Support custom clang or modified version.

## How to use

![](./doc/step1.png)

1. Click 'New config' for creating a new configuration
2. Type your command to compile the file

![](./doc/step2.png)

3. Then, click the command name to run the command
4. Now, you can explore the IRs after each pass

![](./doc/pass-view.png)