import * as assert from 'assert';
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { buildExtractedComponent } from '../extractComponent';

function assertStrictEqualStrippingLineBreaks(expected: string, result: string) {
  const parser = (text: string) => text.replaceAll(/\s+(?=\W)|(?<=\W)\s+/g, '').trim();

  return assert.strictEqual(parser(result), parser(expected));
}

async function getDocuments(folder: string) {
  const filePath = path.join(__dirname, '../../src/test/components/', folder);
  const fileNames = fs.readdirSync(filePath);

  const tsResultFilePath = fileNames.find((fileName) => fileName.endsWith('Result.tsx'));
  const tsTestFilePath = fileNames.find((fileName) => !fileName.endsWith('Result.tsx') && fileName.endsWith('.tsx'));
  const jsResultFilePath = fileNames.find((fileName) => fileName.endsWith('Result.jsx'));
  const jsTestFilePath = fileNames.find((fileName) => !fileName.endsWith('Result.jsx') && fileName.endsWith('.jsx'));

  const [tsResult, tsTest, jsResult, jsTest] = await Promise.all([
    tsResultFilePath && vscode.workspace.openTextDocument(path.join(filePath, tsResultFilePath)),
    tsTestFilePath && vscode.workspace.openTextDocument(path.join(filePath, tsTestFilePath)),
    jsResultFilePath && vscode.workspace.openTextDocument(path.join(filePath, jsResultFilePath)),
    jsTestFilePath && vscode.workspace.openTextDocument(path.join(filePath, jsTestFilePath)),
  ]);

  return { tsResult, tsTest, jsResult, jsTest } as Record<
    'tsResult' | 'tsTest' | 'jsResult' | 'jsTest',
    vscode.TextDocument
  >;
}

suite('buildExtractedComponent', function () {
  suite('extract a simple nested component with repeated props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('simple');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('simple');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  test('should build extract a simple nested component with implictly true variables', async function () {
    const { tsTest, tsResult } = await getDocuments('implicit');
    const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
    const componentName = 'Extracted';

    await buildExtractedComponent(tsTest, range, componentName);

    assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
  });
});
