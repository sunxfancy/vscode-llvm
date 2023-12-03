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

3. (Optional) If you want to focus on one function. You can type the function name in the 'filter function' field. Please note, this function name should be mangle name if it's C++. Then, click the command name to run the command.
5. Now, you can explore the IRs after each pass.

![](./doc/pass-view.png)


## Compare Mode

To debug a pass, you may want to compare a clang command with and without the pass. Or you want to debug a different version of clang with the stable version. This extension can help you to compare the difference between two IRs after each pass.

![](./doc/compare.png)

## Source2Asm Mapping View

Inspired by Compiler Explorer, this extension can highlight the mapping between source code and the assembly code.

![](./doc/highlight.png)

