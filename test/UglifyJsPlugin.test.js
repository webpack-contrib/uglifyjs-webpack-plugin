import UglifyJsPlugin from '../src/index';
import { cleanErrorStack, compile, createCompiler } from './helpers';

describe('UglifyJsPlugin', () => {
  it('should exported as function', () => {
    expect(typeof new UglifyJsPlugin().apply).toBe('function');
  });

  it('should works (without options)', () => {
    const compiler = createCompiler();

    new UglifyJsPlugin().apply(compiler);

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
