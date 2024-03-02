import * as assert from 'assert';
import { capitalizeComponentName, removeNonWordCharacters, truncateType } from '../utils';

suite('removeNonWordCharacters', function () {
  test('should remove non-word characters from the string', function () {
    const input = 'Hello, World!';
    const expected = 'HelloWorld';
    const result = removeNonWordCharacters(input);
    assert.strictEqual(result, expected);
  });

  test('should return an empty string if the input is empty', function () {
    const input = '';
    const expected = '';
    const result = removeNonWordCharacters(input);
    assert.strictEqual(result, expected);
  });

  test('should return an empty string if the input has only non word characters', function () {
    const input = '                     ';
    const expected = '';
    const result = removeNonWordCharacters(input);
    assert.strictEqual(result, expected);
  });

  test('should return the same string if it contains only word characters', function () {
    const input = 'HelloWorld';
    const expected = 'HelloWorld';
    const result = removeNonWordCharacters(input);
    assert.strictEqual(result, expected);
  });
});

suite('capitalizeComponentName', function () {
  test('should capitalize the component name', function () {
    const input = 'button';
    const expected = 'Button';
    const result = capitalizeComponentName(input);
    assert.strictEqual(result, expected);
  });

  test("shouldn't do anything if name is already capitalized", function () {
    const input = 'Button';
    const expected = 'Button';
    const result = capitalizeComponentName(input);
    assert.strictEqual(result, expected);
  });
});

suite('truncateType', function () {
  test('should return the same string if its length is less than or equal to 500', function () {
    const type = 'string';
    const result = truncateType(type);
    const expected = type;
    assert.strictEqual(result, expected);
  });

  test('should return "any" if the string length is more than 500', function () {
    const type = 'a'.repeat(501);
    const result = truncateType(type);
    const expected = 'any';
    assert.strictEqual(result, expected);
  });

  test('should return the same string if its length is exactly 500', function () {
    const type = 'a'.repeat(500);
    const result = truncateType(type);
    const expected = type;
    assert.strictEqual(result, expected);
  });

  test('should return an empty string if the string has length 0', function () {
    const type = '';
    const result = truncateType(type);
    const expected = type;
    assert.strictEqual(result, expected);
  });
});
