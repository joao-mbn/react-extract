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
  suite('extract a nested component without any props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('noProps');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('noProps');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a nested component using fragments', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7));
      const { tsTest, tsResult } = await getDocuments('fragment');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7));
      const { jsTest, jsResult } = await getDocuments('fragment');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a simple nested component with only static props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { tsTest, tsResult } = await getDocuments('onlyStatic');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { jsTest, jsResult } = await getDocuments('onlyStatic');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component with a mix of static and non-static props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(15, 10));
      const { tsTest, tsResult } = await getDocuments('static');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(15, 10));
      const { jsTest, jsResult } = await getDocuments('static');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component with implicitly true variables', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11));
      const { tsTest, tsResult } = await getDocuments('implicit');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11));
      const { jsTest, jsResult } = await getDocuments('implicit');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component having a conditional rendering patterns', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { tsTest, tsResult } = await getDocuments('conditional');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { jsTest, jsResult } = await getDocuments('conditional');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component having a function as props, the function itself return a component', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('componentAsFunction');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { jsTest, jsResult } = await getDocuments('componentAsFunction');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component passing another component as props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('componentAsProps');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { jsTest, jsResult } = await getDocuments('componentAsProps');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component containing a dynamic rendering with map', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7));
      const { tsTest, tsResult } = await getDocuments('map');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7));
      const { jsTest, jsResult } = await getDocuments('map');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component using spread syntax', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('map');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('map');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component that only a part of the component tree of the place it got extracted from', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34));
      const { tsTest, tsResult } = await getDocuments('subSelection');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34));
      const { jsTest, jsResult } = await getDocuments('subSelection');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component where children is a text', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('textChild');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('textChild');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extract a component with complex declarations', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(27, 4), new vscode.Position(46, 10));
      const { tsTest, tsResult } = await getDocuments('declaration');
      await buildExtractedComponent(tsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(27, 4), new vscode.Position(46, 10));
      const { jsTest, jsResult } = await getDocuments('declaration');
      await buildExtractedComponent(jsTest, range, componentName);
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });
});
