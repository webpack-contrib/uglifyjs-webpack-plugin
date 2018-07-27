import UglifyJsPlugin from '../src/index';
import { cleanErrorStack, compile, createCompiler } from './helpers';

describe('UglifyJsPlugin', () => {
  it('export as function', () => {
    expect(typeof new UglifyJsPlugin().apply).toBe('function');
  });

  it('validation errors', () => {
    /* eslint-disable no-new */
    expect(() => {
      new UglifyJsPlugin({ test: /foo/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ test: [/foo/] });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ include: /foo/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ include: [/foo/] });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ exclude: /foo/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ exclude: [/foo/] });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ doesntExist: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ cache: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ cache: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ cache: 'path/to/cache/directory' });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ cache: {} });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ cacheKeys() {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: 2 });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: '2' });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ parallel: {} });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ sourceMap: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ sourceMap: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ sourceMap: 'true' });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ minify() {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: null });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 5,
          warnings: false,
          parse: {},
          compress: true,
          mangle: { inline: false },
          output: { comments: /^\**!|@preserve|@license|@cc_on/ },
          toplevel: false,
          nameCache: {},
          ie8: false,
          keep_classnames: false,
          keep_fnames: false,
          safari10: false,
        },
      });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ie8: false } });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ie8: true } });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ie8: 'false' } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { emca: 5 } });
    }).not.toThrow();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { emca: 8 } });
    }).not.toThrow();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 7.5 } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: true } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: '5' } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 3 } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 10 } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ extractComments: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ extractComments: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ extractComments: /comment/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ extractComments() {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ warningsFilter() {} });
    }).not.toThrow('Validation Error');
  });

  it('contain errors when uglify has unknown option', () => {
    const compiler = createCompiler();
    new UglifyJsPlugin({
      uglifyOptions: {
        output: {
          unknown: true,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('isSourceMap method', () => {
    const rawSourceMap = {
      version: 3,
      file: 'min.js',
      names: ['bar', 'baz', 'n'],
      sources: ['one.js', 'two.js'],
      sourceRoot: 'http://example.com/www/js/',
      mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA',
    };
    const emptyRawSourceMap = {
      version: 3,
      sources: [],
      mappings: '',
    };

    expect(UglifyJsPlugin.isSourceMap(null)).toBe(false);
    expect(UglifyJsPlugin.isSourceMap()).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({})).toBe(false);
    expect(UglifyJsPlugin.isSourceMap([])).toBe(false);
    expect(UglifyJsPlugin.isSourceMap('foo')).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3 })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ sources: '' })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, sources: '' })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ sources: '', mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, sources: '', mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap(rawSourceMap)).toBe(true);
    expect(UglifyJsPlugin.isSourceMap(emptyRawSourceMap)).toBe(true);
  });
});
