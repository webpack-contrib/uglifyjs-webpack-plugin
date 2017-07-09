import { encode, decode } from '../../src/uglify/serialization';

const data = {
  string: 'string',
  number: 0,
  boolean: true,
  null: null,
  object: {
    string: 'string',
  },
  array: [0],
};

describe('serialization data', () => {
  it('encode: deep copy of data', () => {
    const json = encode(data);
    expect(json).not.toBe(data);
    expect(json.string).toBe(data.string);
    expect(json.number).toBe(data.number);
    expect(json.boolean).toBe(data.boolean);
    expect(json.null).toBe(data.null);
    expect(json.object.string).toBe(data.object.string);
    expect(json.array.length).toBe(json.array.length);
  });

  it('decode: deep copy of data', () => {
    const json = decode(data);
    expect(json).not.toBe(data);
    expect(json.string).toBe(data.string);
    expect(json.number).toBe(data.number);
    expect(json.boolean).toBe(data.boolean);
    expect(json.null).toBe(data.null);
    expect(json.object.string).toBe(data.object.string);
    expect(json.array.length).toBe(json.array.length);
  });

  it('serialization function', () => {
    const input = {
      func: (a, b) => a + b,
    };
    let json = encode(input);
    expect(json.func).not.toBe(input.func);
    json = decode(json);
    expect(json.func).not.toBe(input.func);
    expect(typeof json.func).toBe('function');
    expect(json.func.toString()).toBe(input.func.toString());
  });

  it('serialization regexp', () => {
    const input = {
      regexp: /\s+/,
    };
    let json = encode(input);
    expect(json.func).not.toBe(input.regexp);
    json = decode(json);
    expect(json.regexp).not.toBe(input.regexp);
    expect(json.regexp instanceof RegExp).toBe(true);
    expect(json.regexp.toString()).toBe(input.regexp.toString());
  });
});
