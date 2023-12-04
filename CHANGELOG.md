# Change Log

All notable changes to the "vscode-llvm" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## v0.4.1
show clang AST and highlight it

## v0.4
A more complete version:
1. show input files
2. add settings
3. add mapping view of source code to assembly code
4. add assembly highlight

## v0.3
This release fully implemented the core features of vscode-llvm. Lots of code are refactored.

1. command parsing - it knows clang commands, can get the inner workflow of compiler and show IR for before and after each pass.
2. add available pass view and it can run specific llvm pass
3. compare mode to compare two compiler workflows.

## v0.2
Implement the pipeline view and clang IR presentation.

## v0.1

A very basic version with only command parsing and parsing. 
