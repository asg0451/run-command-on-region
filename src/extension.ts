import * as vscode from 'vscode';
import { spawn } from 'child_process';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "run-command-on-region" is now active!');
	const disposable = vscode.commands.registerCommand('run-command-on-region.runCommandOnRegion', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }
		if (editor.selection.isEmpty) { return; }

		// prompt for command to run
		const command = await vscode.window.showInputBox({ prompt: 'Enter the command to run on the selected text' });
		if (!command) { return; }

		const input = editor.document.getText(editor.selection);

		// set stdin to input
		const ps = spawn("/bin/bash", ["-c", `${command}`], { stdio: 'pipe' });
		ps.stdin.write(input);
		ps.stdin.end();
		// collect output from stdout
		const output: string = await new Promise((resolve, reject) => {
			let data = '';
			ps.stdout.on('data', (chunk) => {
				data += chunk;
			});
			ps.stdout.on('end', () => {
				resolve(data);
			});
			ps.stderr.on('data', (chunk) => {
				reject(chunk.toString());
			});
		});

		editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, output);
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
