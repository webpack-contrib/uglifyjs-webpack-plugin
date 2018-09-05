import RequestShortener from 'webpack/lib/RequestShortener';

import UglifyJsPlugin from '../src/index';

import { cleanErrorStack, compile, createCompiler } from './helpers';

describe('UglifyJsPlugin', () => {
  const rawSourceMap = {
    version: 3,
    file: 'test.js',
    names: ['bar', 'baz', 'n'],
    sources: ['one.js', 'two.js'],
    sourceRoot: 'http://example.com/www/js/',
    mappings:
      'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA',
  };
  const emptyRawSourceMap = {
    version: 3,
    sources: [],
    mappings: '',
  };

  it('should works (without options)', () => {
    const compiler = createCompiler();

    new UglifyJsPlugin().apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('isSourceMap method', () => {
    expect(UglifyJsPlugin.isSourceMap(null)).toBe(false);
    expect(UglifyJsPlugin.isSourceMap()).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({})).toBe(false);
    expect(UglifyJsPlugin.isSourceMap([])).toBe(false);
    expect(UglifyJsPlugin.isSourceMap('foo')).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3 })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ sources: '' })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, sources: '' })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, mappings: [] })).toBe(
      false
    );
    expect(UglifyJsPlugin.isSourceMap({ sources: '', mappings: [] })).toBe(
      false
    );
    expect(
      UglifyJsPlugin.isSourceMap({ version: 3, sources: '', mappings: [] })
    ).toBe(false);
    expect(UglifyJsPlugin.isSourceMap(rawSourceMap)).toBe(true);
    expect(UglifyJsPlugin.isSourceMap(emptyRawSourceMap)).toBe(true);
  });

  it('buildSourceMap method', () => {
    expect(UglifyJsPlugin.buildSourceMap()).toBe(null);
    expect(UglifyJsPlugin.buildSourceMap('invalid')).toBe(null);
    expect(UglifyJsPlugin.buildSourceMap({})).toBe(null);
    expect(UglifyJsPlugin.buildSourceMap(rawSourceMap)).toMatchSnapshot();
  });

  it('buildError method', () => {
    const error = new Error('Message');

    error.stack = null;

    expect(UglifyJsPlugin.buildError(error, 'test.js')).toMatchSnapshot();

    const errorWithLineAndCol = new Error('Message');

    errorWithLineAndCol.stack = null;
    errorWithLineAndCol.line = 1;
    errorWithLineAndCol.col = 1;

    expect(
      UglifyJsPlugin.buildError(
        errorWithLineAndCol,
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap)
      )
    ).toMatchSnapshot();

    const otherErrorWithLineAndCol = new Error('Message');

    otherErrorWithLineAndCol.stack = null;
    otherErrorWithLineAndCol.line = 1;
    otherErrorWithLineAndCol.col = 1;

    expect(
      UglifyJsPlugin.buildError(
        otherErrorWithLineAndCol,
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/')
      )
    ).toMatchSnapshot();

    const errorWithStack = new Error('Message');

    errorWithStack.stack = 'Stack';

    expect(
      UglifyJsPlugin.buildError(errorWithStack, 'test.js')
    ).toMatchSnapshot();
  });

  it('buildWarning method', () => {
    expect(UglifyJsPlugin.buildWarning('Warning[foo:1,1]')).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning('Warning[foo:1,1]', 'test.js')
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning[foo:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap)
      )
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning[foo:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap)
      )
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning[foo:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap),
        () => true
      )
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning[foo:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap),
        () => false
      )
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning[foo:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap),
        () => true,
        new RequestShortener('http://example.com/www/js/')
      )
    ).toMatchSnapshot();
  });
});
