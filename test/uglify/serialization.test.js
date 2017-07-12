import { encode, decode } from '../../src/uglify/serialization';

describe('serialization data', () => {
  it('serialization function', () => {
    const input = {
      func: (a, b) => a + b,
    };
    const string = JSON.stringify(input, encode);
    const json = JSON.parse(string, decode);
    expect(json.func).not.toBe(input.func);
    expect(typeof json.func).toBe('function');
    expect(json.func(1, 2)).toBe(input.func(1, 2));
  });

  it('serialization regexp', () => {
    const input = {
      regexp: /\s+/,
    };
    const string = JSON.stringify(input, encode);
    const json = JSON.parse(string, decode);
    expect(json.regexp).not.toBe(input.regexp);
    expect(json.regexp instanceof RegExp).toBe(true);
    expect(json.regexp.toString()).toBe(input.regexp.toString());
  });

  it('serialized closure function should be error', () => {
    const a = 0;
    const b = 1;
    const input = {
      func: () => a + b,
    };
    const string = JSON.stringify(input, encode);
    const json = JSON.parse(string, decode);
    expect(json.func).toThrowError('serialization');
  });
});
