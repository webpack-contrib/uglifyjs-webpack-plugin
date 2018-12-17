import UglifyJsPlugin from '../src';

it('validation', () => {
  /* eslint-disable no-new */
  expect(() => {
    new UglifyJsPlugin({ test: /foo/ });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ test: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ include: /foo/ });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ include: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ exclude: /foo/ });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ exclude: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ chunkFilter: () => {} });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ chunkFilter: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new UglifyJsPlugin({ doesntExist: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new UglifyJsPlugin({ cache: true });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ cache: false });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ cache: 'path/to/cache/directory' });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ cache: {} });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new UglifyJsPlugin({ cacheKeys() {} });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ parallel: true });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ parallel: false });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ parallel: 2 });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ parallel: '2' });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new UglifyJsPlugin({ parallel: {} });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new UglifyJsPlugin({ sourceMap: true });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ sourceMap: false });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ sourceMap: 'true' });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new UglifyJsPlugin({ minify() {} });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ uglifyOptions: null });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new UglifyJsPlugin({ uglifyOptions: {} });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({
      uglifyOptions: {
        // eslint-disable-next-line no-undefined
        ecma: undefined,
        warnings: false,
        parse: {},
        compress: {},
        mangle: true,
        module: false,
        output: null,
        toplevel: false,
        nameCache: null,
        ie8: false,
        keep_classnames: false,
        keep_fnames: false,
        safari10: false,
      },
    });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ uglifyOptions: { emca: 5 } });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ extractComments: true });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ extractComments: false });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ extractComments: /comment/ });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ extractComments() {} });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ warningsFilter() {} });
  }).not.toThrow();

  expect(() => {
    new UglifyJsPlugin({ warningsFilter: true });
  }).toThrowErrorMatchingSnapshot();
  /* eslint-enable no-new */
});
