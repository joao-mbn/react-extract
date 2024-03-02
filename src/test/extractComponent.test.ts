import * as assert from 'assert';
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { buildExtractedComponent } from '../extractComponent';

function assertStrictEqualStrippingLineBreaks(expected: string, result: string) {
  const parser = (text: string) =>
    text.replaceAll(/\s+/g, '').replaceAll(/;/g, '').replaceAll(/"/g, "'").replaceAll(/[()]/g, '');

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
    jsTestFilePath && vscode.workspace.openTextDocument(path.join(filePath, jsTestFilePath))
  ]);

  return { tsResult, tsTest, jsResult, jsTest } as Record<
    'tsResult' | 'tsTest' | 'jsResult' | 'jsTest',
    vscode.TextDocument
  >;
}

suite('buildExtractedComponent', function () {
  suite('extracts a nested component without any props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('noProps');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('noProps');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a nested component using fragments', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7));
      const { tsTest, tsResult } = await getDocuments('fragment');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7));
      const { jsTest, jsResult } = await getDocuments('fragment');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a simple nested component with only static props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { tsTest, tsResult } = await getDocuments('onlyStatic');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { jsTest, jsResult } = await getDocuments('onlyStatic');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with a mix of static and non-static props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(15, 10));
      const { tsTest, tsResult } = await getDocuments('static');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(15, 10));
      const { jsTest, jsResult } = await getDocuments('static');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with implicitly true variables', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11));
      const { tsTest, tsResult } = await getDocuments('implicit');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11));
      const { jsTest, jsResult } = await getDocuments('implicit');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having a conditional rendering patterns', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { tsTest, tsResult } = await getDocuments('conditional');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { jsTest, jsResult } = await getDocuments('conditional');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having a function as props, the function itself return a component', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('componentAsFunction');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { jsTest, jsResult } = await getDocuments('componentAsFunction');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component passing another component as props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('componentAsProps');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { jsTest, jsResult } = await getDocuments('componentAsProps');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component containing a dynamic rendering with map', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7));
      const { tsTest, tsResult } = await getDocuments('map');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7));
      const { jsTest, jsResult } = await getDocuments('map');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component that only a part of the component tree of the place it got extracted from', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34));
      const { tsTest, tsResult } = await getDocuments('subSelection');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34));
      const { jsTest, jsResult } = await getDocuments('subSelection');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component where children is a text', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('textChild');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('textChild');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with short-hand properties', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(15, 4), new vscode.Position(18, 6));
      const { tsTest, tsResult } = await getDocuments('shortHand');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(15, 4), new vscode.Position(18, 6));
      const { jsTest, jsResult } = await getDocuments('shortHand');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component where the prop type is too big to be fully displayed', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(38, 9), new vscode.Position(38, 39));
      const { tsTest, tsResult } = await getDocuments('longType');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });
  });

  suite('extracts a component with complex pattern of properties and methods passed as props', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(21, 4), new vscode.Position(28, 6));
      const { tsTest, tsResult } = await getDocuments('propertiesAndMethods');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(21, 4), new vscode.Position(28, 6));
      const { jsTest, jsResult } = await getDocuments('propertiesAndMethods');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with prop declaration being a renamed destructured prop', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 9), new vscode.Position(5, 42));
      const { tsTest, tsResult } = await getDocuments('destructureRename');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 9), new vscode.Position(5, 42));
      const { jsTest, jsResult } = await getDocuments('destructureRename');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with props coming from a nested destructure statement', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 9), new vscode.Position(8, 44));
      const { tsTest, tsResult } = await getDocuments('destructureNested');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 9), new vscode.Position(8, 44));
      const { jsTest, jsResult } = await getDocuments('destructureNested');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having props passed from function parameter', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('parameter');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
      const { jsTest, jsResult } = await getDocuments('parameter');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('infers parameter type from type reference', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
      const { tsTest, tsResult } = await getDocuments('parameterTypeReference');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });
  });

  suite('extracts a component using spread syntax', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(11, 9), new vscode.Position(11, 31));
      const { tsTest, tsResult } = await getDocuments('spread');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(3, 9), new vscode.Position(3, 31));
      const { jsTest, jsResult } = await getDocuments('spread');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component using array spread syntax', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('spreadArray');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 4), new vscode.Position(12, 10));
      const { jsTest, jsResult } = await getDocuments('spreadArray');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component using having nested spread syntax', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(16, 4), new vscode.Position(21, 10));
      const { tsTest, tsResult } = await getDocuments('spreadNested');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 4), new vscode.Position(13, 10));
      const { jsTest, jsResult } = await getDocuments('spreadNested');
      await buildExtractedComponent({ document: jsTest, range, componentName, isTypescript: false });
      assertStrictEqualStrippingLineBreaks(jsResult.getText(), jsTest.getText());
    });
  });

  suite('infers types from type reference of a nested spread syntax', function () {
    const componentName = 'Extracted';

    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('spreadNestedTypeReference');
      await buildExtractedComponent({ document: tsTest, range, componentName, isTypescript: true });
      assertStrictEqualStrippingLineBreaks(tsResult.getText(), tsTest.getText());
    });
  });
});
