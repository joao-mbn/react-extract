import * as vscode from 'vscode';
import { extractComponent } from './extractComponent';
import { isJsx } from './parsers/isJsx';

class ExtractOnRefactorProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ) {
    if (context.only && !context.only.contains(vscode.CodeActionKind.Refactor)) return [];

    if (!isJsx(document, range)) return [];

    const refactor = new vscode.CodeAction('React Extract: Extract Component', vscode.CodeActionKind.Refactor);

    refactor.command = {
      command: 'reactExtract.extractComponent',
      title: 'React Extract: Extract Component',
      arguments: [document, range]
    };

    return [refactor];
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [{ pattern: '{**/*.js,**/*.ts,**/*.jsx,**/*.tsx}' }],
      new ExtractOnRefactorProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.Refactor] }
    )
  );

  context.subscriptions.push(vscode.commands.registerCommand('reactExtract.extractComponent', extractComponent));
}

export function deactivate() {}

