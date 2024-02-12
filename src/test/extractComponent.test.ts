import * as assert from 'assert';
import { buildExtractedComponent, buildExtractedComponentReference, extractProps } from '../extractComponent';
import { ExtractedProps } from '../types';

function unorderedDeepStrictEqual(expected: ExtractedProps[], result: ExtractedProps[]) {
  const deepSort = (objects: ExtractedProps[]) =>
    objects
      .sort((a, b) => a.propAlias.localeCompare(b.propAlias))
      .map((o) => {
        return Object.entries(o)
          .sort(([a], [b]) => a.localeCompare(b))
          .reduce((acc, [, value]) => [...acc, value], [] as (typeof o)[keyof typeof o][]);
      });

  return assert.deepStrictEqual(deepSort(result), deepSort(expected));
}

function strictEqualStrippingLineBreaks(expected: string, result: string) {
  const parser = (text: string) => text.replaceAll(/\s+(?=\W)|(?<=\W)\s+/g, '').trim();

  return assert.strictEqual(parser(result), parser(expected));
}

suite('extractProps', () => {
  test('should handle props with different value types', () => {
    const selectedText = `
      <Component prop1={true} prop2={"string"} >
        <NestedComponent prop3={'string'} prop4='string' prop5="string" />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        { pair: 'prop1={true}', prop: 'prop1', value: '{true}', propAlias: 'prop1', implicitlyTrue: false },
        { pair: 'prop2={"string"}', prop: 'prop2', value: '{"string"}', propAlias: 'prop2', implicitlyTrue: false },
        { pair: "prop3={'string'}", prop: 'prop3', value: "{'string'}", propAlias: 'prop3', implicitlyTrue: false },
        { pair: "prop4='string'", prop: 'prop4', value: "'string'", propAlias: 'prop4', implicitlyTrue: false },
        { pair: 'prop5="string"', prop: 'prop5', value: '"string"', propAlias: 'prop5', implicitlyTrue: false },
      ],
      result
    );
  });

  test('should handle props with complex values', () => {
    const selectedText = `
      <Component prop1={{ key: 'value' }} >
        <NestedComponent prop2={[1, 2, 3]} prop3={() => { doStuff(); }} />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        {
          pair: "prop1={{ key: 'value' }}",
          prop: 'prop1',
          value: "{{ key: 'value' }}",
          propAlias: 'prop1',
          implicitlyTrue: false,
        },
        { pair: 'prop2={[1, 2, 3]}', prop: 'prop2', value: '{[1, 2, 3]}', propAlias: 'prop2', implicitlyTrue: false },
        {
          pair: 'prop3={() => { doStuff(); }}',
          prop: 'prop3',
          value: '{() => { doStuff(); }}',
          propAlias: 'prop3',
          implicitlyTrue: false,
        },
      ],
      result
    );
  });

  test('should handle repeated props', () => {
    const selectedText = `
      <Component className={value1}>
        <NestedComponent className={value2} prop={value}/>
      </Component>`;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        {
          pair: 'className={value1}',
          prop: 'className',
          value: '{value1}',
          propAlias: 'className',
          implicitlyTrue: false,
        },
        {
          pair: 'className={value2}',
          prop: 'className',
          value: '{value2}',
          propAlias: 'className2',
          implicitlyTrue: false,
        },
        { pair: 'prop={value}', prop: 'prop', value: '{value}', propAlias: 'prop', implicitlyTrue: false },
      ],
      result
    );
  });

  test('should handle props with deeply nested values and repeated props', () => {
    const selectedText = `
      <Component prop1={{ key: { key: { key: 'value' } } }} className="class-parent" >
        <NestedComponent
          className={foo ? "class-1" : "class-2"}
          prop1={{ key: { key: { key: 'value' } } }}
          prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}
          prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: \`\${value1}\`, item2: \`\${value2}\`}; }}
        />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        {
          pair: "prop1={{ key: { key: { key: 'value' } } }}",
          prop: 'prop1',
          value: "{{ key: { key: { key: 'value' } } }}",
          propAlias: 'prop1',
          implicitlyTrue: false,
        },
        {
          pair: 'className="class-parent"',
          prop: 'className',
          value: '"class-parent"',
          propAlias: 'className',
          implicitlyTrue: false,
        },
        {
          pair: 'className={foo ? "class-1" : "class-2"}',
          prop: 'className',
          value: '{foo ? "class-1" : "class-2"}',
          propAlias: 'className2',
          implicitlyTrue: false,
        },
        {
          pair: "prop1={{ key: { key: { key: 'value' } } }}",
          prop: 'prop1',
          value: "{{ key: { key: { key: 'value' } } }}",
          propAlias: 'prop12',
          implicitlyTrue: false,
        },
        {
          pair: "prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
          prop: 'prop2',
          value: "{[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
          propAlias: 'prop2',
          implicitlyTrue: false,
        },
        {
          pair: 'prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}',
          prop: 'prop3',
          value:
            '{() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}',
          propAlias: 'prop3',
          implicitlyTrue: false,
        },
      ],
      result
    );
  });

  test('should return an empty array if no props are found', () => {
    const selectedText = `
      <Component>
        <NestedComponent />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual([], result);
  });

  test('should handle implicitly true variables', () => {
    const selectedText = `
      <Parent>
        <Component1
          badlyFormattedCurly ={ prop }
          doubleQuoteInsideCurly={"margin text value"}
          singleQuoteInsideCurly={'margin text value'}
          anotherImplicit
          singleQuote='margin text value'
          doubleQuote="one more prop"
          badlyFormattedDoubleQuote=" lastProp "
          propsArray={[abc, cde, ijh]}
          implicitCloseToSelfCloseAngularBracket />
        <Component2 implicitGluedToSelfCloseAngularBracket/>
        <Component3
          implicitIsFirstProp
          wellFormatedProp={prop}
          propsObject={{abc, def, ghi}}
          propsFunction={() => { doStuff(); doOtherStuff(); }}
          BadlyFormattedCondition = { thisCondition && thatCondition && !!thirdCondition}badlyFormattedIntrinsicProp>
        </Component3>
      </Parent>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        {
          pair: 'implicitGluedToSelfCloseAngularBracket',
          prop: 'implicitGluedToSelfCloseAngularBracket',
          propAlias: 'implicitGluedToSelfCloseAngularBracket',
          value: '',
          implicitlyTrue: true,
        },
        {
          pair: 'implicitIsFirstProp',
          prop: 'implicitIsFirstProp',
          propAlias: 'implicitIsFirstProp',
          value: '',
          implicitlyTrue: true,
        },
        {
          pair: 'badlyFormattedIntrinsicProp',
          prop: 'badlyFormattedIntrinsicProp',
          propAlias: 'badlyFormattedIntrinsicProp',
          value: '',
          implicitlyTrue: true,
        },
        {
          pair: 'wellFormatedProp={prop}',
          prop: 'wellFormatedProp',
          propAlias: 'wellFormatedProp',
          value: '{prop}',
          implicitlyTrue: false,
        },
        {
          pair: 'propsObject={{abc, def, ghi}}',
          prop: 'propsObject',
          propAlias: 'propsObject',
          value: '{{abc, def, ghi}}',
          implicitlyTrue: false,
        },
        {
          pair: 'propsFunction={() => { doStuff(); doOtherStuff(); }}',
          prop: 'propsFunction',
          propAlias: 'propsFunction',
          value: '{() => { doStuff(); doOtherStuff(); }}',
          implicitlyTrue: false,
        },
        {
          pair: 'BadlyFormattedCondition ={ thisCondition && thatCondition && !!thirdCondition}',
          prop: 'BadlyFormattedCondition',
          propAlias: 'BadlyFormattedCondition',
          value: '{ thisCondition && thatCondition && !!thirdCondition}',
          implicitlyTrue: false,
        },
        {
          pair: 'badlyFormattedCurly ={ prop }',
          prop: 'badlyFormattedCurly',
          propAlias: 'badlyFormattedCurly',
          value: '{ prop }',
          implicitlyTrue: false,
        },
        {
          pair: 'doubleQuoteInsideCurly={"margin text value"}',
          prop: 'doubleQuoteInsideCurly',
          propAlias: 'doubleQuoteInsideCurly',
          value: '{"margin text value"}',
          implicitlyTrue: false,
        },
        {
          pair: "singleQuoteInsideCurly={'margin text value'}",
          prop: 'singleQuoteInsideCurly',
          propAlias: 'singleQuoteInsideCurly',
          value: "{'margin text value'}",
          implicitlyTrue: false,
        },
        {
          pair: "singleQuote='margin text value'",
          prop: 'singleQuote',
          propAlias: 'singleQuote',
          value: "'margin text value'",
          implicitlyTrue: false,
        },
        {
          pair: 'doubleQuote="one more prop"',
          prop: 'doubleQuote',
          propAlias: 'doubleQuote',
          value: '"one more prop"',
          implicitlyTrue: false,
        },
        {
          pair: 'badlyFormattedDoubleQuote=" lastProp "',
          prop: 'badlyFormattedDoubleQuote',
          propAlias: 'badlyFormattedDoubleQuote',
          value: '" lastProp "',
          implicitlyTrue: false,
        },
        {
          pair: 'propsArray={[abc, cde, ijh]}',
          prop: 'propsArray',
          propAlias: 'propsArray',
          value: '{[abc, cde, ijh]}',
          implicitlyTrue: false,
        },
        {
          pair: 'anotherImplicit',
          prop: 'anotherImplicit',
          propAlias: 'anotherImplicit',
          value: '',
          implicitlyTrue: true,
        },
        {
          pair: 'implicitCloseToSelfCloseAngularBracket',
          prop: 'implicitCloseToSelfCloseAngularBracket',
          propAlias: 'implicitCloseToSelfCloseAngularBracket',
          value: '',
          implicitlyTrue: true,
        },
      ],
      result
    );
  });
});

suite('buildExtractedComponent', () => {
  const complexProps = [
    {
      pair: "prop1={{ key: { key: { key: 'value' } } }}",
      prop: 'prop1',
      value: "{{ key: { key: { key: 'value' } } }}",
      propAlias: 'prop1',
      implicitlyTrue: false,
    },
    {
      pair: 'className="class-parent"',
      prop: 'className',
      value: '"class-parent"',
      propAlias: 'className',
      implicitlyTrue: false,
    },
    {
      pair: 'className={foo ? "class-1" : "class-2"}',
      prop: 'className',
      value: '{foo ? "class-1" : "class-2"}',
      propAlias: 'className2',
      implicitlyTrue: false,
    },
    {
      pair: "prop1={{ key: { key: { key: 'value' } } }}",
      prop: 'prop1',
      value: "{{ key: { key: { key: 'value' } } }}",
      propAlias: 'prop12',
      implicitlyTrue: false,
    },
    {
      pair: "prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
      prop: 'prop2',
      value: "{[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
      propAlias: 'prop2',
      implicitlyTrue: false,
    },
    {
      pair: 'prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return { item1: `${value1}`, item2: `${value2}` }; }}',
      prop: 'prop3',
      value:
        '{() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return { item1: `${value1}`, item2: `${value2}` }; }}',
      propAlias: 'prop3',
      implicitlyTrue: false,
    },
    {
      pair: 'prop4',
      prop: 'prop4',
      value: '',
      propAlias: 'prop4',
      implicitlyTrue: true,
    },
  ];

  const complexComponent = `
    <ParentComponent prop1={{ key: { key: { key: 'value' } } }} className="class-parent" >
      <NestedComponent
        className={foo ? "class-1" : "class-2"}
        prop1={{ key: { key: { key: 'value' } } }}
        prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}
        prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return { item1: \`\${value1}\`, item2: \`\${value2}\` }; }}
        prop4
      />
    </ParentComponent>
  `;

  test('should build the extracted component with complex props and interface, if using Typescript', () => {
    const componentName = 'Component';
    const isTypescript = true;
    const props = complexProps;
    const selectedText = complexComponent;

    const expected = `
      interface ComponentProps {
        prop1: unknown;
        className: unknown;
        className2: unknown;
        prop12: unknown;
        prop2: unknown;
        prop3: unknown;
        prop4: unknown;
      }

      function Component({
        prop1,
        className,
        className2,
        prop12,
        prop2,
        prop3,
        prop4
      }: ComponentProps) {
        return (
          <ParentComponent prop1={prop1} className={className} >
            <NestedComponent
              className={className2}
              prop1={prop12}
              prop2={prop2}
              prop3={prop3}
              prop4={prop4}
            />
          </ParentComponent>
        );
      }
    `;

    const result = buildExtractedComponent(componentName, isTypescript, props, selectedText);
    strictEqualStrippingLineBreaks(expected, result);
  });

  test('should build the extracted component with repeated implicitly true variables', () => {
    const componentName = 'Component';
    const isTypescript = true;
    const props = [
      {
        pair: 'prop',
        prop: 'prop',
        value: '',
        propAlias: 'prop',
        implicitlyTrue: true,
      },
      {
        pair: 'prop={false}',
        prop: 'prop',
        value: '{false}',
        propAlias: 'prop2',
        implicitlyTrue: false,
      },
      {
        pair: 'prop={true}',
        prop: 'prop',
        value: '{true}',
        propAlias: 'prop3',
        implicitlyTrue: false,
      },
    ];
    const selectedText = `
      <ParentComponent prop>
        <NestedComponent prop={false} />
        <NestedComponent prop={true} />
      </ParentComponent>
    `;

    const expected = `
      interface ComponentProps {
        prop: unknown;
        prop2: unknown;
        prop3: unknown;
      }

      function Component({
        prop,
        prop2,
        prop3
      }: ComponentProps) {
        return (
          <ParentComponent prop={prop} >
            <NestedComponent prop={prop2} />
            <NestedComponent prop={prop3} />
          </ParentComponent>
        );
      }
    `;

    const result = buildExtractedComponent(componentName, isTypescript, props, selectedText);
    strictEqualStrippingLineBreaks(expected, result);
  });

  test('should build the extracted component with complex props and without interface, if using Javascript', () => {
    const componentName = 'Component';
    const isTypescript = false;
    const props = complexProps;
    const selectedText = complexComponent;
    const expected = `
      function Component({
        prop1,
        className,
        className2,
        prop12,
        prop2,
        prop3,
        prop4
      }) {
        return (
          <ParentComponent prop1={prop1} className={className} >
            <NestedComponent
              className={className2}
              prop1={prop12}
              prop2={prop2}
              prop3={prop3}
              prop4={prop4}
            />
          </ParentComponent>
        );
      }
    `;

    const result = buildExtractedComponent(componentName, isTypescript, props, selectedText);
    strictEqualStrippingLineBreaks(expected, result);
  });

  test('should build the extracted component without props and interface, if it does not have any props, regardless of using Typescript or not', () => {
    const componentName = 'Component';
    const props: ExtractedProps[] = [];
    const selectedText = '<AnotherComponent />';

    const expected = `
      function Component(

      ) {
        return (
          <AnotherComponent />
        );
      }
    `;

    const resultWithTypescript = buildExtractedComponent(componentName, true, props, selectedText);
    strictEqualStrippingLineBreaks(expected, resultWithTypescript);

    const resultWithoutTypescript = buildExtractedComponent(componentName, false, props, selectedText);
    strictEqualStrippingLineBreaks(expected, resultWithoutTypescript);
  });
});

suite('buildExtractedComponentReference', () => {
  test('should build the extracted component reference with props', () => {
    const componentName = 'Component';
    const props: ExtractedProps[] = [
      {
        pair: "prop1={{ key: { key: { key: 'value' } } }}",
        prop: 'prop1',
        value: "{{ key: { key: { key: 'value' } } }}",
        propAlias: 'prop12',
        implicitlyTrue: false,
      },
      {
        pair: "prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
        prop: 'prop2',
        value: "{[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
        propAlias: 'prop2',
        implicitlyTrue: false,
      },
      {
        pair: 'prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}',
        prop: 'prop3',
        value:
          '{() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}',
        propAlias: 'prop3',
        implicitlyTrue: false,
      },
      {
        pair: 'prop4',
        prop: 'prop4',
        value: '',
        propAlias: 'prop4',
        implicitlyTrue: true,
      },
    ];

    const expected = `
      <Component
        prop1={{ key: { key: { key: 'value' } } }}
        prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}
        prop3={() => {
          doStuff();
          doAnotherStuff();
          bar ? doBarStuff() : doFooStuff();
          return {item1: \`\${value1}\`, item2: \`\${value2}\`};
        }}
        prop4
      />`;

    const result = buildExtractedComponentReference(componentName, props);
    strictEqualStrippingLineBreaks(expected, result);
  });

  test('should build the extracted component reference without props', () => {
    const componentName = 'Component';
    const props: ExtractedProps[] = [];

    const expected = `<Component />`;

    const result = buildExtractedComponentReference(componentName, props);
    strictEqualStrippingLineBreaks(expected, result);
  });
});
