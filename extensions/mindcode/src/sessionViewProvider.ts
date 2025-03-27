/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import * as vscode from 'vscode';

export class SessionViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;
	private _sessions: string[] = [];

	constructor(private readonly _extensionUri: vscode.Uri) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext<unknown>,
		_token: vscode.CancellationToken
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			if (data.type === 'sessionSelected') {
				vscode.window.showInformationMessage(`Selected session: ${data.value}`);
			}
		});

		// Update the view with any existing sessions
		this._updateView();
	}

	public addSession(sessionName: string) {
		this._sessions.push(sessionName);
		this._updateView();
	}

	private _updateView() {
		if (this._view) {
			this._view.webview.postMessage({
				type: 'updateSessions',
				sessions: this._sessions
			});
		}
	}

	private _getHtmlForWebview(_webview: vscode.Webview): string {
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>MindCode Sessions</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
					padding: 16px;
					line-height: 1.6;
				}
				ul {
					list-style-type: none;
					padding: 0;
				}
				li {
					padding: 8px;
					cursor: pointer;
					border: 1px solid #ddd;
					margin: 4px 0;
					border-radius: 4px;
				}
				li:hover {
					background-color: #f0f0f0;
				}
			</style>
		</head>
		<body>
			<h1>MindCode Sessions</h1>
			<ul id="sessions"></ul>
			<script>
				const vscode = acquireVsCodeApi();
				window.addEventListener('message', event => {
					const message = event.data;
					if (message.type === 'updateSessions') {
						const sessionsList = document.getElementById('sessions');
						sessionsList.innerHTML = '';
						message.sessions.forEach(session => {
							const li = document.createElement('li');
							li.textContent = session;
							li.onclick = () => {
								vscode.postMessage({ type: 'sessionSelected', value: session });
							};
							sessionsList.appendChild(li);
						});
					}
				});
			</script>
		</body>
		</html>`;
	}
}
