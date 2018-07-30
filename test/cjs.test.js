import UglifyJsPlugin from '../src';
import CJSUglifyJsPlugin from '../src/cjs';

describe('CJS', () => {
  it('should exported plugin', () => {
    expect(CJSUglifyJsPlugin).toEqual(UglifyJsPlugin);
  });
});
