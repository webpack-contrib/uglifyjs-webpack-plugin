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

    expect(() => JSON.parse(`{
      "regexp": "<RegExp>process.exit()"
    }`, decode)).toThrowError('not a regexp');
  });

  it('not a pure function should be error. (no-func)', () => {
    expect(() => JSON.parse(`{
      "func": "<Function>function a(){},process.exit(),function b(){}"
    }`, decode)).toThrowError('not a function');

    expect(() => JSON.parse(`{
      "func": "<Function>function {#error#}"
    }`, decode)).toThrowError('parse failed');
  });

  it('not a pure function should be error. (no-undef)', () => {
    const a = 0;
    const b = 1;
    const input = {
      func: () => a + b,
    };
    const string = JSON.stringify(input, encode);
    expect(() => JSON.parse(string, decode)).toThrowError('parse failed');
  });

  it('not a pure function should be error. (no-eval)', () => {
    const input = {
      func: () => eval('(a + b)'), // eslint-disable-line no-eval
    };
    const string = JSON.stringify(input, encode);
    expect(() => JSON.parse(string, decode)).toThrowError('parse failed');
  });

  it('not a pure function should be error. (no-new-func)', () => {
    const input = {
      func: a => new Function('return a + 1')(a), // eslint-disable-line no-new-func
    };
    const string = JSON.stringify(input, encode);
    expect(() => JSON.parse(string, decode)).toThrowError('parse failed');
  });

  it('not a pure function should be error. (no-this)', () => {
    expect(() => JSON.parse(JSON.stringify({
      func: function f() {
        this.a = 1;
      },
    }, encode), decode)).toThrowError('parse failed');
    expect(() => JSON.parse(JSON.stringify({
      func: function f() {
        function getThis() {
          return this;
        }
        getThis().process.eixt();
      },
    }, encode), decode)).toThrowError('parse failed');
  });
});
