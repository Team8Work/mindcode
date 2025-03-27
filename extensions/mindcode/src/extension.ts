/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import * as vscode from 'vscode';
import { SessionViewProvider } from './sessionViewProvider';

export function activate(context: vscode.ExtensionContext) {
	const sessionViewProvider = new SessionViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'mindcode.sessionView',
			sessionViewProvider
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('mindcode.startSession', () => {
			vscode.window.showInformationMessage('Starting a new MindCode session...');
			sessionViewProvider.addSession('New Session');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('mindcode.generateCode', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor found');
				return;
			}

			const prompt = await vscode.window.showInputBox({
				placeHolder: 'Describe the code you want to generate',
				prompt: 'MindCode will generate code based on your description'
			});

			if (!prompt) {
				return;
			}

			// Simulate AI code generation
			const generatedCode = `// Generated code based on: ${prompt}\n\n` +
				`// This is a placeholder for actual AI-generated code\n` +
				`function generatedFunction() {\n  console.log("This would be AI-generated code based on your prompt");\n}\n`;

			editor.edit(editBuilder => {
				const position = editor.selection.active;
				editBuilder.insert(position, generatedCode);
			});
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('mindcode.explainCode', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor found');
				return;
			}

			const selection = editor.selection;
			if (selection.isEmpty) {
				vscode.window.showErrorMessage('No code selected');
				return;
			}

			const selectedText = editor.document.getText(selection);

			// Simulate AI code explanation
			const explanation = `# Code Explanation\n\n` +
				`The selected code:\n\n\`\`\`\n${selectedText}\n\`\`\`\n\n` +
				`This code appears to be doing the following:\n\n` +
				`1. First, it initializes some variables\n` +
				`2. Then it processes the data\n` +
				`3. Finally, it returns a result\n\n` +
				`This is a placeholder for actual AI-generated explanation.`;

			const panel = vscode.window.createWebviewPanel(
				'mindcodeExplanation',
				'MindCode Explanation',
				vscode.ViewColumn.Beside,
				{ enableScripts: true }
			);

			panel.webview.html = getWebviewContent(explanation);
		})
	);

	console.log('MindCode extension is now active!');
}

function getWebviewContent(markdown: string): string {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>MindCode Explanation</title>
		<style>
			body {
				font-family: Arial, sans-serif;
				padding: 16px;
				line-height: 1.6;
			}
			pre {
				background-color: #f3f3f3;
				padding: 12px;
				border-radius: 4px;
				overflow: auto;
			}
			code {
				font-family: 'Courier New', Courier, monospace;
			}
		</style>
	</head>
	<body>
		<div id="content">${markdownToHtml(markdown)}</div>
		<script>
			function markdownToHtml(markdown) {
				let html = markdown;
				html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
				html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
				html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
				html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
				html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
				html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
				html = html.replace(/^(?!<[h|l|p|u])(.+)$/gm, '<p>$1</p>');
				return html;
			}
		</script>
	</body>
	</html>`;
}

export function deactivate() { }
function markdownToHtml(_markdown: string) {
	throw new Error('Function not implemented.');
}

