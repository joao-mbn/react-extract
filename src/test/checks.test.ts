import * as assert from 'assert';
import * as vscode from 'vscode';
import { isFileTypescript } from '../checks';

suite('isFileTypescript', () => {
  test('should return true for TypeScript file', async () => {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:/test.ts'));
    const result = isFileTypescript(document);
    assert.strictEqual(true, result);
  });

  test('should return true for TypeScript React file', async () => {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:/test.tsx'));
    const result = isFileTypescript(document);
    assert.strictEqual(true, result);
  });

  test('should return false for other extensions file', async () => {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:/test.js'));
    const result = isFileTypescript(document);
    assert.strictEqual(false, result);
  });

  test('should return false for files without extension', async () => {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:/test'));
    const result = isFileTypescript(document);
    assert.strictEqual(false, result);
  });
});

