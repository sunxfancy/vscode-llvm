import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function fsStat(filePath: fs.PathLike): Promise<fs.Stats | undefined> {
    let stats: fs.Stats | undefined;
    try {
        stats = await fs.promises.stat(filePath);
    } catch (e) {
        // File doesn't exist
        return undefined;
    }
    return stats;
}


/** Test whether a directory exists */
export async function checkDirectoryExists(dirPath: string): Promise<boolean> {
    const stats: fs.Stats | undefined = await fsStat(dirPath);
    return !!stats && stats.isDirectory();
}

export async function checkPathExists(filePath: string): Promise<boolean> {
    return !!(await fsStat(filePath));
}

/** Test whether a file exists */
export async function checkFileExists(filePath: string): Promise<boolean> {
    const stats: fs.Stats | undefined = await fsStat(filePath);
    return !!stats && stats.isFile();
}

/** Writes content to a text file */
export async function writeFileText(filePath: string, content: string, encoding: BufferEncoding = "utf8"): Promise<void> {
    const folders: string[] = filePath.split(path.sep).slice(0, -1);
    if (folders.length) {
        // create folder path if it doesn't exist
        folders.reduce((previous, folder) => {
            const folderPath: string = previous + path.sep + folder;
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            return folderPath;
        });
    }
	fs.writeFileSync(filePath, content, { encoding });
}

export async function ensurePropertiesFile(): Promise<void> {
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		for (let i: number = 0; i < vscode.workspace.workspaceFolders.length; ++i) {
			const configFolder = path.join(vscode.workspace.workspaceFolders[i].uri.fsPath, '.vscode');
			const configFile = path.join(configFolder, 'llvm.json');
			
			if (await checkFileExists(configFile)) {
				continue;
			} else {
				try {
					if (!await checkDirectoryExists(configFolder)) {
						fs.mkdirSync(configFolder);
					}
					await writeFileText(configFile, "{}\n");
				} catch (errJS) {
					const err: Error = errJS as Error;
					vscode.window.showErrorMessage(`Failed to create llvm.json: ${err.message}`);
				}
			}
		}
	}
}

export async function loadConfig() {
	var cfg : any = {};
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		for (let i: number = 0; i < vscode.workspace.workspaceFolders.length; ++i) {
			const configFolder = path.join(vscode.workspace.workspaceFolders[i].uri.fsPath, '.vscode');
			const configFile = path.join(configFolder, 'llvm.json');

			let rawdata = fs.readFileSync(configFile);
			let config = JSON.parse(rawdata.toString());
			console.log(config);
			for(var k in config) cfg[k]=config[k];
		}
	}
	return cfg;
}