import * as assert from 'assert';
import { capitalizeComponentName, removeNonWordCharacters } from '../utils';

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
