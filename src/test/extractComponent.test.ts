import * as assert from "assert";
import { buildExtractedComponent, buildExtractedComponentReference, extractProps } from "../extractComponent";
import { ExtractedProps } from "../types";

function unorderedDeepStrictEqual(expected: ExtractedProps[], result: ExtractedProps[]) {
  return assert.deepStrictEqual(expected.map((e) => e.propAlias).sort(), result.map((e) => e.propAlias).sort());
}

function strictEqualStrippingLineBreaks(expected: string, result: string) {
  const parser = (text: string) => text.replaceAll(/\s+(?=\W)|(?<=\W)\s+/g, "").trim();
  return assert.strictEqual(parser(expected), parser(result));
}

suite("extractProps", () => {
  test("should handle props with different value types", () => {
    const selectedText = `
      <Component prop1={true} prop2={"string"} >
        <NestedComponent prop3={'string'} prop4='string' prop5="string" />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        { pair: "prop1={true}", prop: "prop1", value: "{true}", propAlias: "prop1" },
        { pair: 'prop2={"string"}', prop: "prop2", value: '{"string"}', propAlias: "prop2" },
        { pair: "prop3={'string'}", prop: "prop3", value: "{'string'}", propAlias: "prop3" },
        { pair: "prop4='string'", prop: "prop4", value: "'string'", propAlias: "prop4" },
        { pair: 'prop5="string"', prop: "prop5", value: '"string"', propAlias: "prop5" },
      ],
      result
    );
  });

  test("should handle props with complex values", () => {
    const selectedText = `
      <Component prop1={{ key: 'value' }} >
        <NestedComponent prop2={[1, 2, 3]} prop3={() => { doStuff(); }} />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        { pair: "prop1={{ key: 'value' }}", prop: "prop1", value: "{{ key: 'value' }}", propAlias: "prop1" },
        { pair: "prop2={[1, 2, 3]}", prop: "prop2", value: "{[1, 2, 3]}", propAlias: "prop2" },
        { pair: "prop3={() => { doStuff(); }}", prop: "prop3", value: "{() => { doStuff(); }}", propAlias: "prop3" },
      ],
      result
    );
  });

  test("should handle repeated props", () => {
    const selectedText = `
      <Component className={value1}>
        <NestedComponent className={value2} prop={value}/>
      </Component>`;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        { pair: "className={value1}", prop: "className", value: "{value1}", propAlias: "className" },
        { pair: "className={value2}", prop: "className", value: "{value2}", propAlias: "className2" },
        { pair: "prop={value}", prop: "prop", value: "{value}", propAlias: "prop" },
      ],
      result
    );
  });

  test("should handle props with deeply nested values and repeated props", () => {
    const selectedText = `
      <Component prop1={{ key: { key: { key: 'value' } } }} className="class-parent" >
        <NestedComponent
          className={foo ? "class-1" : "class-2"}
          prop1={{ key: { key: { key: 'value' } } }}
          prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}
          prop3={() => {
            doStuff();
            doAnotherStuff();
            bar ? doBarStuff() : doFooStuff();
            return {item1: \`\${value1}\`, item2: \`\${value2}\`};
          }}
        />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(
      [
        { pair: "prop1={{ key: { key: { key: 'value' } } }}", prop: "prop1", value: "{{ key: { key: { key: 'value' } } }}", propAlias: "prop1" },
        { pair: 'className="class-parent"', prop: "className", value: '"class-parent"', propAlias: "className" },
        { pair: 'className={foo ? "class-1" : "class-2"}', prop: "className", value: '{foo ? "class-1" : "class-2"}', propAlias: "className2" },
        {
          pair: "prop1={{ key: { key: { key: 'value' } } }}",
          prop: "prop1",
          value: "{{ key: { key: { key: 'value' } } }}",
          propAlias: "prop12",
        },
        {
          pair: "prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
          prop: "prop2",
          value: "{[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
          propAlias: "prop2",
        },
        {
          pair: "prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}",
          prop: "prop3",
          value: "{() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}",
          propAlias: "prop3",
        },
      ],
      result
    );
  });

  test("should return an empty array if no props are found", () => {
    const selectedText = `
      <Component>
        <NestedComponent />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual([], result);
  });
});

suite("buildExtractedComponent", () => {
  const complexProps = [
    { pair: "prop1={{ key: { key: { key: 'value' } } }}", prop: "prop1", value: "{{ key: { key: { key: 'value' } } }}", propAlias: "prop1" },
    { pair: 'className="class-parent"', prop: "className", value: '"class-parent"', propAlias: "className" },
    { pair: 'className={foo ? "class-1" : "class-2"}', prop: "className", value: '{foo ? "class-1" : "class-2"}', propAlias: "className2" },
    {
      pair: "prop1={{ key: { key: { key: 'value' } } }}",
      prop: "prop1",
      value: "{{ key: { key: { key: 'value' } } }}",
      propAlias: "prop12",
    },
    {
      pair: "prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
      prop: "prop2",
      value: "{[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
      propAlias: "prop2",
    },
    {
      pair: "prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return { item1: `${value1}`, item2: `${value2}` }; }}",
      prop: "prop3",
      value: "{() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return { item1: `${value1}`, item2: `${value2}` }; }}",
      propAlias: "prop3",
    },
  ];

  const complexComponent = `
    <ParentComponent prop1={{ key: { key: { key: 'value' } } }} className="class-parent" >
      <NestedComponent
        className={foo ? "class-1" : "class-2"}
        prop1={{ key: { key: { key: 'value' } } }}
        prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}
        prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return { item1: \`\${value1}\`, item2: \`\${value2}\` }; }}
      />
    </ParentComponent>
  `;

  test("should build the extracted component with complex props and interface, if using Typescript", () => {
    const componentName = "Component";
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
      }

      function Component({
        prop1,
        className,
        className2,
        prop12,
        prop2,
        prop3
      }: ComponentProps) {
        return (
          <ParentComponent prop1={prop1} className={className} >
            <NestedComponent
              className={className2}
              prop1={prop12}
              prop2={prop2}
              prop3={prop3}
            />
          </ParentComponent>
        );
      }
    `;

    const result = buildExtractedComponent(componentName, isTypescript, props, selectedText);
    strictEqualStrippingLineBreaks(expected, result);
  });

  test("should build the extracted component with complex props and without interface, if using Javascript", () => {
    const componentName = "Component";
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
        prop3
      }) {
        return (
          <ParentComponent prop1={prop1} className={className} >
            <NestedComponent
              className={className2}
              prop1={prop12}
              prop2={prop2}
              prop3={prop3}
            />
          </ParentComponent>
        );
      }
    `;

    const result = buildExtractedComponent(componentName, isTypescript, props, selectedText);
    strictEqualStrippingLineBreaks(expected, result);
  });

  test("should build the extracted component without props and interface, if it does not have any props, regardless of using Typescript or not", () => {
    const componentName = "Component";
    const props: ExtractedProps[] = [];
    const selectedText = "<AnotherComponent />";

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

suite("buildExtractedComponentReference", () => {
  test("should build the extracted component reference with props", () => {
    const componentName = "Component";
    const props: ExtractedProps[] = [
      {
        pair: "prop1={{ key: { key: { key: 'value' } } }}",
        prop: "prop1",
        value: "{{ key: { key: { key: 'value' } } }}",
        propAlias: "prop12",
      },
      {
        pair: "prop2={[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
        prop: "prop2",
        value: "{[1, { key: { key: 'value' }, key2: 'value2' }, 3]}",
        propAlias: "prop2",
      },
      {
        pair: "prop3={() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}",
        prop: "prop3",
        value: "{() => { doStuff(); doAnotherStuff(); bar ? doBarStuff() : doFooStuff(); return {item1: `${value1}`, item2: `${value2}`}; }}",
        propAlias: "prop3",
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
      />`;

    const result = buildExtractedComponentReference(componentName, props);
    strictEqualStrippingLineBreaks(expected, result);
  });

  test("should build the extracted component reference without props", () => {
    const componentName = "Component";
    const props: ExtractedProps[] = [];

    const expected = `<Component />`;

    const result = buildExtractedComponentReference(componentName, props);
    strictEqualStrippingLineBreaks(expected, result);
  });
});
