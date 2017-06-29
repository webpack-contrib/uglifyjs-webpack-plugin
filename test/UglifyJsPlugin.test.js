import UglifyJsPlugin from '../src/index';

describe('UglifyJsPlugin', () => {
  it('has apply function', () => {
    expect(typeof new UglifyJsPlugin().apply).toBe('function');
  });
});
