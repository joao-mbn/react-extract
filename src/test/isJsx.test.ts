import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { isJsx } from '../parsers/isJsx';
import { allRanges, getDocumentsAndRange } from './common';

suite('isJsx basic scenarios', () => {
  async function createDocument(text: string) {
    const tempFilePath = path.join(__dirname, 'tempFile.jsx');
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    const declaration = 'const test = ';
    fs.writeFileSync(tempFilePath, declaration + text);

    const document = await vscode.workspace.openTextDocument(tempFilePath);

    // Use the document's content to determine the end position
    const lastLine = document.lineAt(document.lineCount - 1);
    const endPosition = new vscode.Position(lastLine.lineNumber, lastLine.text.length);

    // Create a range that spans the entire text
    const range = new vscode.Range(new vscode.Position(0, declaration.length), endPosition);

    return { document, range };
  }

  test('should return true for simple JSX', async function () {
    const { document, range } = await createDocument('<div></div>');
    const result = isJsx(document, range);
    assert.ok(result);
  });

  test('should return true for self enclosed JSX', async function () {
    const { document, range } = await createDocument('<div />');
    const result = isJsx(document, range);
    assert.ok(result);
  });

  test('should return true for fragment', async function () {
    const { document, range } = await createDocument('<></>');
    const result = isJsx(document, range);
    assert.ok(result);
  });

  test('should return false for empty selection', async function () {
    const { document, range } = await createDocument('');
    const result = isJsx(document, range);
    assert.ok(!result);
  });

  test('should return false for non JSX', async function () {
    const { document, range } = await createDocument('const a = 1;');
    const result = isJsx(document, range);
    assert.ok(!result);
  });

  test('should return false for JSX enclosed in non-jsx', async function () {
    const { document, range } = await createDocument('[].map(() => <div></div>)');
    const result = isJsx(document, range);
    assert.ok(!result);
  });
});

suite('isJsx component selections', () => {
  Object.keys(allRanges).forEach((key) => {
    test(`should return true for ${key}`, async function () {
      const { jsTest, tsTest, ranges } = await getDocumentsAndRange(key);
      if (jsTest) {
        assert.ok(isJsx(jsTest, ranges.javascript));
      }

      if (tsTest) {
        assert.ok(isJsx(tsTest, ranges.typescript));
      }
    });
  });
});

