import * as assert from "assert";
import { extractProps } from "../extractComponent";
import { ExtractedProps } from "../types";

function unorderedDeepStrictEqual(expected: ExtractedProps[], result: ExtractedProps[]) {
  return assert.deepStrictEqual(expected.map((e) => e.propAlias).sort(), result.map((e) => e.propAlias).sort());
}

suite("extractProps", () => {
  test("should handle props with different value types", () => {
    const selectedText = `
      <Component prop1={true} prop2={"string"} >
        <NestedComponent prop3={'string'} prop4='string' prop5="string" />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(result, [
      { pair: "prop1={true}", prop: "prop1", value: "{true}", propAlias: "prop1" },
      { pair: 'prop2={"string"}', prop: "prop2", value: '{"string"}', propAlias: "prop2" },
      { pair: "prop3={'string'}", prop: "prop3", value: "{'string'}", propAlias: "prop3" },
      { pair: "prop4='string'", prop: "prop4", value: "'string'", propAlias: "prop4" },
      { pair: 'prop5="string"', prop: "prop5", value: '"string"', propAlias: "prop5" },
    ]);
  });

  test("should handle props with complex values", () => {
    const selectedText = `
      <Component prop1={{ key: 'value' }} >
        <NestedComponent prop2={[1, 2, 3]} prop3={() => { doStuff(); }} />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(result, [
      { pair: "prop1={{ key: 'value' }}", prop: "prop1", value: "{{ key: 'value' }}", propAlias: "prop1" },
      { pair: "prop2={[1, 2, 3]}", prop: "prop2", value: "{[1, 2, 3]}", propAlias: "prop2" },
      { pair: "prop3={() => { doStuff(); }}", prop: "prop3", value: "{() => { doStuff(); }}", propAlias: "prop3" },
    ]);
  });

  test("should handle repeated props", () => {
    const selectedText = `
      <Component className={value1}>
        <NestedComponent className={value2} prop={value}/>
      </Component>`;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(result, [
      { pair: "className={value1}", prop: "className", value: "{value1}", propAlias: "className" },
      { pair: "className={value2}", prop: "className", value: "{value2}", propAlias: "className2" },
      { pair: "prop={value}", prop: "prop", value: "{value}", propAlias: "prop" },
    ]);
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
    unorderedDeepStrictEqual(result, [
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
    ]);
  });

  test("should return an empty array if no props are found", () => {
    const selectedText = `
      <Component>
        <NestedComponent />
      </Component>
    `;
    const result = extractProps(selectedText);
    unorderedDeepStrictEqual(result, []);
  });
});
