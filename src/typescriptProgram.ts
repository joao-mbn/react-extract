import ts from 'typescript';
import * as vscode from 'vscode';

export function getProgramAndSourceFile(document: vscode.TextDocument) {
  const program = ts.createProgram([document.uri.fsPath], {
    allowJs: true,
    strict: true,
    lib: ['lib.esnext.full.d.ts'],
    jsx: ts.JsxEmit.React,
    esModuleInterop: true
  });
  const sourceFile = program.getSourceFile(document.uri.fsPath);

  return { program, sourceFile };
}
