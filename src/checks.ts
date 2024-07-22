import * as vscode from 'vscode';

export function isFileTypescript(document: vscode.TextDocument) {
  return document.languageId === 'typescript' || document.languageId === 'typescriptreact';
}

