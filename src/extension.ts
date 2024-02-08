import * as vscode from "vscode";

class ExtractOnRefactorProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ) {
    const refactor = new vscode.CodeAction("Extract Component", vscode.CodeActionKind.Refactor);

    refactor.command = { command: "extract.extractComponent", title: "Extract Component", arguments: [document, range] };

    return [refactor];
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "extract" is now active!');

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider([{ pattern: "{**/*.js,**/*.ts,**/*.jsx,**/*.tsx}" }], new ExtractOnRefactorProvider(), {
      providedCodeActionKinds: [vscode.CodeActionKind.Refactor],
    })
  );

  let disposable = vscode.commands.registerCommand("extract.extractComponent", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);
    if (!text) {
      return;
    }

    console.log(`Selected text: ${text}`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
