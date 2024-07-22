import * as assert from 'assert';
import { buildExtractedComponent } from '../extractComponent';
import { ExtractionArgs } from '../types';
import { getDocumentsAndRange } from './common';

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
      const {
        ranges: { typescript: range },
        tsTest,
        tsResult
      } = await getDocumentsAndRange('noProps');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('noProps');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a nested component using fragments', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('fragment');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('fragment');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a simple nested component with only static props', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('onlyStatic');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('onlyStatic');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with a mix of static and non-static props', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('static');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('static');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with implicitly true variables', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('implicit');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('implicit');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having a conditional rendering patterns', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('conditional');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('conditional');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having a function as props, the function itself return a component', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('componentAsFunction');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('componentAsFunction');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component passing another component as props', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('componentAsProps');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('componentAsProps');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component containing a dynamic rendering with map', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('map');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('map');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component that only a part of the component tree of the place it got extracted from', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('subSelection');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('subSelection');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component where children is a text', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('textChild');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('textChild');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with short-hand properties', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('shortHand');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('shortHand');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component where the prop type is too big to be fully displayed', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('longType');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('extracts a component with complex pattern of properties and methods passed as props', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('propertiesAndMethods');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('propertiesAndMethods');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with prop declaration being a renamed destructured prop', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('destructureRename');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('destructureRename');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with props coming from a nested destructure statement', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('destructureNested');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('destructureNested');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component having props passed from function parameter', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('parameter');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('parameter');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('infers parameter type from type reference', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('parameterTypeReference');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('extracts a component using spread syntax', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('spread');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText(), { keepSemiColons: true });
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('spread');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component using array spread syntax', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('spreadArray');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('spreadArray');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component using having nested spread syntax', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('spreadNested');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('spreadNested');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('infers types from type reference of a nested spread syntax', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('spreadNestedTypeReference');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('infers default types from destructured and spread props from object binding typed as any', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('spreadAny');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as inline declaration if so configured', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('typeInlineDeclaration');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'inline', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds no type as inline declaration if there are no props', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('typeInlineDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'inline', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as inline declaration if so configured, with type extension', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('typeInlineDeclarationExtended');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'inline', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as inline declaration if so configured, with ReactFC type declaration', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('typeInlineDeclarationReactFC');
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
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('typeTypeDeclaration');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'type', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds no type as type declaration if there are no props', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('typeTypeDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'type', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds type as type declaration if so configured, with type extension', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('typeTypeDeclarationExtended');
      await buildExtractedComponent({ ...defaultArgs, typeDeclaration: 'type', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });
  });

  suite('builds the component as an arrow function if so configured, if there are no props', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('arrowFunctionDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('arrowFunctionDeclarationEmpty');
      await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite(
    'builds the component as an arrow function if so configured, if there are props including spread props',
    function () {
      test('with typescript', async function () {
        const {
          ranges: { typescript: range },
          tsResult,
          tsTest
        } = await getDocumentsAndRange('arrowFunctionDeclarationSpread');
        await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const {
          ranges: { javascript: range },
          jsResult,
          jsTest
        } = await getDocumentsAndRange('arrowFunctionDeclarationSpread');
        await buildExtractedComponent({ ...defaultArgs, functionDeclaration: 'arrow', document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite('builds the component as an arrow function with explicit return statement, if so configured', function () {
    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('arrowFunctionExplicitReturn');
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
        const {
          ranges: { typescript: range },
          tsResult,
          tsTest
        } = await getDocumentsAndRange('reactFCType');
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
        const {
          ranges: { javascript: range },
          jsResult,
          jsTest
        } = await getDocumentsAndRange('reactFCType');
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
        const {
          ranges: { typescript: range },
          tsResult,
          tsTest
        } = await getDocumentsAndRange('reactFCTypeEmpty');
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
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('wrapInFragment');
      await buildExtractedComponent({ ...defaultArgs, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('wrapInFragment');
      await buildExtractedComponent({ ...defaultArgs, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite('extracts a component with undestructured props, if so configured', function () {
    test('with typescript', async function () {
      const {
        ranges: { typescript: range },
        tsResult,
        tsTest
      } = await getDocumentsAndRange('undestructuredProps');
      await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
      assertExtraction(tsResult.getText(), tsTest.getText());
    });

    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('undestructuredProps');
      await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });

  suite(
    'extracts a component with no props, if it does not have any, despite being configured as undestructured props',
    function () {
      test('with typescript', async function () {
        const {
          ranges: { typescript: range },
          tsResult,
          tsTest
        } = await getDocumentsAndRange('undestructuredPropsEmpty');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const {
          ranges: { javascript: range },
          jsResult,
          jsTest
        } = await getDocumentsAndRange('undestructuredPropsEmpty');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite(
    'extracts a component with destructured props, even if it is configured as undestructured props, if there are any spread attribute',
    function () {
      test('with typescript', async function () {
        const {
          ranges: { typescript: range },
          tsResult,
          tsTest
        } = await getDocumentsAndRange('undestructuredPropsSpreadAttribute');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: tsTest, range });
        assertExtraction(tsResult.getText(), tsTest.getText());
      });

      test('with javascript', async function () {
        const {
          ranges: { javascript: range },
          jsResult,
          jsTest
        } = await getDocumentsAndRange('undestructuredPropsSpreadAttribute');
        await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
        assertExtraction(jsResult.getText(), jsTest.getText());
      });
    }
  );

  suite('extracts a component with undestructured props, if so configured, in complex scenarios', function () {
    test('with javascript', async function () {
      const {
        ranges: { javascript: range },
        jsResult,
        jsTest
      } = await getDocumentsAndRange('undestructuredPropsExtended');
      await buildExtractedComponent({ ...defaultArgs, destructureProps: false, document: jsTest, range });
      assertExtraction(jsResult.getText(), jsTest.getText());
    });
  });
});

