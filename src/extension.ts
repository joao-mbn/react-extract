import * as vscode from 'vscode';
import { isSelectionLikelyJsx } from './checks';
import { extractComponent } from './extractComponent';

class ExtractOnRefactorProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ) {
    if (!isSelectionLikelyJsx(document, range, context)) {
      return [];
    }

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
      {
        providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
      }
    )
  );

  context.subscriptions.push(vscode.commands.registerCommand('reactExtract.extractComponent', extractComponent));
}

export function deactivate() {}

