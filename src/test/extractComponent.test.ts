import * as assert from 'assert';
import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { buildExtractedComponent } from '../extractComponent';
import { ExtractionArgs } from '../types';

interface AssertExtractionFlags {
  keepSemiColons?: boolean;
}

function assertExtraction(expected: string, result: string, { keepSemiColons = false }: AssertExtractionFlags = {}) {
  const parser = (text: string) => {
    let next = text;
    next = next.replaceAll(/import[\s\S]*?;/g, '');
    next = next.replaceAll(/\s+/g, '');
    next = keepSemiColons ? next : next.replaceAll(/;/g, '');
    next = next.replaceAll(/"/g, "'");
    next = next.replaceAll(/[()]/g, '');

    return next;
  };

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
  const defaultArgs: Pick<
    ExtractionArgs,
    | 'componentName'
    | 'functionDeclaration'
    | 'typeDeclaration'
    | 'declareWithReactFC'
    | 'explicitReturnStatement'
    | 'destructureProps'
  > = {
    componentName: 'Extracted',
    functionDeclaration: 'function',
    typeDeclaration: 'interface',
    explicitReturnStatement: false,
    declareWithReactFC: false,
    destructureProps: true
  };

  suite('extracts a nested component without any props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('noProps');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('noProps');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a nested component using fragments', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7));
      const { tsTest, tsResult } = await getDocuments('fragment');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(11, 7));
      const { jsTest, jsResult } = await getDocuments('fragment');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a simple nested component with only static props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { tsTest, tsResult } = await getDocuments('onlyStatic');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { jsTest, jsResult } = await getDocuments('onlyStatic');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with a mix of static and non-static props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 4), new vscode.Position(18, 10));
      const { tsTest, tsResult } = await getDocuments('static');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 4), new vscode.Position(18, 10));
      const { jsTest, jsResult } = await getDocuments('static');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with implicitly true variables', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11));
      const { tsTest, tsResult } = await getDocuments('implicit');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(12, 11));
      const { jsTest, jsResult } = await getDocuments('implicit');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having a conditional rendering patterns', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { tsTest, tsResult } = await getDocuments('conditional');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 4), new vscode.Position(10, 10));
      const { jsTest, jsResult } = await getDocuments('conditional');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having a function as props, the function itself return a component', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('componentAsFunction');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { jsTest, jsResult } = await getDocuments('componentAsFunction');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component passing another component as props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('componentAsProps');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { jsTest, jsResult } = await getDocuments('componentAsProps');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component containing a dynamic rendering with map', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7));
      const { tsTest, tsResult } = await getDocuments('map');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(25, 7));
      const { jsTest, jsResult } = await getDocuments('map');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component that only a part of the component tree of the place it got extracted from', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34));
      const { tsTest, tsResult } = await getDocuments('subSelection');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 6), new vscode.Position(15, 34));
      const { jsTest, jsResult } = await getDocuments('subSelection');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component where children is a text', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('textChild');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('textChild');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with short-hand properties', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(26, 6));
      const { tsTest, tsResult } = await getDocuments('shortHand');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(18, 4), new vscode.Position(26, 6));
      const { jsTest, jsResult } = await getDocuments('shortHand');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component where the prop type is too big to be fully displayed', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(38, 9), new vscode.Position(38, 39));
      const { tsTest, tsResult } = await getDocuments('longType');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('extracts a component with complex pattern of properties and methods passed as props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(21, 4), new vscode.Position(28, 6));
      const { tsTest, tsResult } = await getDocuments('propertiesAndMethods');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(21, 4), new vscode.Position(28, 6));
      const { jsTest, jsResult } = await getDocuments('propertiesAndMethods');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with prop declaration being a renamed destructured prop', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 9), new vscode.Position(5, 42));
      const { tsTest, tsResult } = await getDocuments('destructureRename');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 9), new vscode.Position(5, 42));
      const { jsTest, jsResult } = await getDocuments('destructureRename');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with props coming from a nested destructure statement', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 9), new vscode.Position(8, 44));
      const { tsTest, tsResult } = await getDocuments('destructureNested');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 9), new vscode.Position(8, 44));
      const { jsTest, jsResult } = await getDocuments('destructureNested');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having props passed from function parameter', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(13, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('parameter');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
      const { jsTest, jsResult } = await getDocuments('parameter');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('infers parameter type from type reference', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
      const { tsTest, tsResult } = await getDocuments('parameterTypeReference');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('extracts a component using spread syntax', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(11, 9), new vscode.Position(11, 31));
      const { tsTest, tsResult } = await getDocuments('spread');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText(), { keepSemiColons: true });
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(3, 9), new vscode.Position(3, 31));
      const { jsTest, jsResult } = await getDocuments('spread');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component using array spread syntax', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(12, 4), new vscode.Position(16, 10));
      const { tsTest, tsResult } = await getDocuments('spreadArray');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 4), new vscode.Position(12, 10));
      const { jsTest, jsResult } = await getDocuments('spreadArray');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component using having nested spread syntax', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(16, 4), new vscode.Position(21, 10));
      const { tsTest, tsResult } = await getDocuments('spreadNested');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(8, 4), new vscode.Position(13, 10));
      const { jsTest, jsResult } = await getDocuments('spreadNested');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('infers types from type reference of a nested spread syntax', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('spreadNestedTypeReference');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('infers default types from destructured and spread props from object binding typed as any', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
      const { tsTest, tsResult } = await getDocuments('spreadAny');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as inline declaration if so configured', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('typeInlineDeclaration');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'inline', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds no type as inline declaration if there are no props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
      const { tsTest, tsResult } = await getDocuments('typeInlineDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'inline', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as inline declaration if so configured, with type extension', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('typeInlineDeclarationExtended');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'inline', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as inline declaration if so configured, with ReactFC type declaration', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('typeInlineDeclarationReactFC');
      await buildExtractedComponent({
        ...defaultArgs,
        functionDeclaration: 'arrow',
        declareWithReactFC: true,
        typeDeclaration: 'inline',
        document: tsTest,
        range
      });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as type declaration if so configured', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('typeTypeDeclaration');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'type', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds no type as type declaration if there are no props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
      const { tsTest, tsResult } = await getDocuments('typeTypeDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'type', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as type declaration if so configured, with type extension', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('typeTypeDeclarationExtended');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'type', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds the component as an arrow function if so configured, if there are no props', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
      const { tsTest, tsResult } = await getDocuments('arrowFunctionDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
      const { jsTest, jsResult } = await getDocuments('arrowFunctionDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite(
    'builds the component as an arrow function if so configured, if there are props including spread props',
    function () {
      test('with typescript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
        const { tsTest, tsResult } = await getDocuments('arrowFunctionDeclarationSpread');
        await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(9, 10));
        const { jsTest, jsResult } = await getDocuments('arrowFunctionDeclarationSpread');
        await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite('builds the component as an arrow function with explicit return statement, if so configured', function () {
    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
      const { jsTest, jsResult } = await getDocuments('arrowFunctionExplicitReturn');
      await buildExtractedComponent({
        ...defaultArgs,
        functionDeclaration: 'arrow',
        explicitReturnStatement: true,
        document: jsTest,
        range
      });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite(
    'builds the component as an arrow function, declaring using React.FC with props type, if so configured, ensuring that nothing is changed for javascript.',
    function () {
      test('with typescript', async function () {
        const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
        const { tsTest, tsResult } = await getDocuments('reactFCType');
        await buildExtractedComponent({
          ...defaultArgs,
          functionDeclaration: 'arrow',
          declareWithReactFC: true,
          document: tsTest,
          range
        });
        assertExtraction(tsTest.getText(), tsResult.getText());
      });

      test('with javascript', async function () {
        const range = new vscode.Range(new vscode.Position(6, 4), new vscode.Position(9, 10));
        const { jsTest, jsResult } = await getDocuments('reactFCType');
        await buildExtractedComponent({
          ...defaultArgs,
          functionDeclaration: 'arrow',
          declareWithReactFC: true,
          document: jsTest,
          range
        });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite(
    'builds the component as an arrow function, declaring using React.FC without props type, if so configured',
    function () {
      test('with typescript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
        const { tsTest, tsResult } = await getDocuments('reactFCTypeEmpty');
        await buildExtractedComponent({
          ...defaultArgs,
          functionDeclaration: 'arrow',
          declareWithReactFC: true,
          document: tsTest,
          range
        });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });
    }
  );

  suite('extracts a component wrapping it in fragments if necessary', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 6), new vscode.Position(7, 21));
      const { tsTest, tsResult } = await getDocuments('wrapInFragment');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(5, 6), new vscode.Position(7, 21));
      const { jsTest, jsResult } = await getDocuments('wrapInFragment');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with undestructured props, if so configured', function () {
    test('with typescript', async function () {
      const range = new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10));
      const { tsTest, tsResult } = await getDocuments('undestructuredProps');
      await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const range = new vscode.Range(new vscode.Position(7, 4), new vscode.Position(9, 10));
      const { jsTest, jsResult } = await getDocuments('undestructuredProps');
      await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite(
    'extracts a component with no props, if it does not have any, despite being configured as undestructured props',
    function () {
      test('with typescript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
        const { tsTest, tsResult } = await getDocuments('undestructuredPropsEmpty');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
        const { jsTest, jsResult } = await getDocuments('undestructuredPropsEmpty');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite(
    'extracts a component with undestructured props, if so configured, when there is a short hand assignment',
    function () {
      test('with typescript', async function () {
        const range = new vscode.Range(new vscode.Position(17, 4), new vscode.Position(25, 6));
        const { tsTest, tsResult } = await getDocuments('undestructuredPropsShortHand');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const range = new vscode.Range(new vscode.Position(17, 4), new vscode.Position(25, 6));
        const { jsTest, jsResult } = await getDocuments('undestructuredPropsShortHand');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite(
    'extracts a component with undestructured props, if so configured, when there is a spread assignment',
    function () {
      test('with typescript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
        const { tsTest, tsResult } = await getDocuments('undestructuredPropsSpreadAssignment');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(7, 10));
        const { jsTest, jsResult } = await getDocuments('undestructuredPropsSpreadAssignment');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite(
    'extracts a component with destructured props, even if it is configured as undestructured props, if there are any spread attribute',
    function () {
      test('with typescript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
        const { tsTest, tsResult } = await getDocuments('undestructuredPropsSpreadAttribute');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const range = new vscode.Range(new vscode.Position(4, 4), new vscode.Position(6, 10));
        const { jsTest, jsResult } = await getDocuments('undestructuredPropsSpreadAttribute');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );
});

