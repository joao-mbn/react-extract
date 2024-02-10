import * as assert from "assert";
import { countCloseTags, countOpenTags } from "../checks";

suite("countOpenTags", () => {
  test("should return the correct number of open tags", () => {
    const selectedText = "<div><p></p></div>";
    const result = countOpenTags(selectedText);
    assert.strictEqual(4, result);
  });

  test("should return the correct number of open tags for self-closing tags", () => {
    const selectedText = "<br><br/><br />";
    const result = countOpenTags(selectedText);
    assert.strictEqual(3, result);
  });

  test("should return the correct number of open tags for complex react component breaking line", () => {
    const selectedText = `
      <ComplexComponent
        prop={() => undefined}
        anotherProp={'foo'}
      />
    `;
    const result = countOpenTags(selectedText);
    assert.strictEqual(1, result);
  });

  test("should return the correct number of open tags for a react fragment", () => {
    const selectedText = "<></>";
    const result = countOpenTags(selectedText);
    assert.strictEqual(2, result);
  });

  test("should return 0 if the selected text is empty", () => {
    const selectedText = "";
    const result = countOpenTags(selectedText);
    assert.strictEqual(0, result);
  });

  test("should return 0 if there are no tags in the selected text", () => {
    const selectedText = "Lorem ipsum dolor sit amet";
    const result = countOpenTags(selectedText);
    assert.strictEqual(0, result);
  });
});

suite("countCloseTags", () => {
  test("should return the correct number of close tags", () => {
    const selectedText = "<div><p></p></div>";
    const result = countCloseTags(selectedText);
    assert.strictEqual(4, result);
  });

  test("should return the correct number of close tags for self-closing tags", () => {
    const selectedText = "<br><br/><br />";
    const result = countCloseTags(selectedText);
    assert.strictEqual(3, result);
  });

  test("should return the correct number of close tags for complex react component with arrow function", () => {
    const selectedText = "<ComplexComponent prop={() => undefined}/>";
    const result = countCloseTags(selectedText);
    assert.strictEqual(1, result);
  });

  test("should return the correct number of close tags for complex react component breaking line", () => {
    const selectedText = `
      <ComplexComponent
        prop={() => undefined}
        anotherProp={'foo'}
      />
    `;
    const result = countCloseTags(selectedText);
    assert.strictEqual(1, result);
  });

  test("should return the correct number of close tags for a react fragment", () => {
    const selectedText = "<></>";
    const result = countCloseTags(selectedText);
    assert.strictEqual(2, result);
  });

  test("should return 0 if the selected text is empty", () => {
    const selectedText = "";
    const result = countCloseTags(selectedText);
    assert.strictEqual(0, result);
  });

  test("should return 0 if there are no tags in the selected text", () => {
    const selectedText = "Lorem ipsum dolor sit amet";
    const result = countCloseTags(selectedText);
    assert.strictEqual(0, result);
  });
});
