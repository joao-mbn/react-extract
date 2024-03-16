import ts from 'typescript';
import * as vscode from 'vscode';

export function getProgramAndSourceFile(document: vscode.TextDocument) {
  const program = ts.createProgram([document.uri.fsPath], { allowJs: true, strict: true });
  const sourceFile = program.getSourceFile(document.uri.fsPath);

  return { program, sourceFile };
}
