import RequestShortener from 'webpack/lib/RequestShortener';
import MainTemplate from 'webpack/lib/MainTemplate';
import ChunkTemplate from 'webpack/lib/ChunkTemplate';

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

  it('should regenerate hash', () => {
    const originalMainTemplateUpdateHashForChunk =
      MainTemplate.prototype.updateHashForChunk;
    const originalChunkTemplateUpdateHashForChunk =
      ChunkTemplate.prototype.updateHashForChunk;
    const mockMainTemplateUpdateHashForChunk = jest.fn();
    const mockChunkTemplateUpdateHashFocChunk = jest.fn();

    MainTemplate.prototype.updateHashForChunk = mockMainTemplateUpdateHashForChunk;
    ChunkTemplate.prototype.updateHashForChunk = mockChunkTemplateUpdateHashFocChunk;

    const compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
        mjs: `${__dirname}/fixtures/entry.mjs`,
        importExport: `${__dirname}/fixtures/import-export/entry.js`,
        AsyncImportExport: `${__dirname}/fixtures/async-import-export/entry.js`,
      },
      output: {
        path: `${__dirname}/dist`,
        filename: '[name].[contenthash].js',
        chunkFilename: '[id].[name].[contenthash].js',
      },
    });

    new UglifyJsPlugin().apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      // On each chunk we have 2 calls (we have 1 async chunk and 4 initial).
      // First call do `webpack`.
      // Second call do `TerserPlugin`.

      // We have 1 async chunk (1 * 2 = 2 calls for ChunkTemplate)
      expect(mockMainTemplateUpdateHashForChunk).toHaveBeenCalledTimes(8);
      // We have 4 initial chunks (4 * 2 = 8 calls for MainTemplate)
      expect(mockChunkTemplateUpdateHashFocChunk).toHaveBeenCalledTimes(2);

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }

      MainTemplate.prototype.updateHashForChunk = originalMainTemplateUpdateHashForChunk;
      ChunkTemplate.prototype.updateHashForChunk = originalChunkTemplateUpdateHashForChunk;
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
    expect(
      UglifyJsPlugin.buildWarning('Warning [test.js:1,1]')
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning('Warning [test.js:1,1]', 'test.js')
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap)
      )
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/')
      )
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/'),
        () => true
      )
    ).toMatchSnapshot();
    expect(
      UglifyJsPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        UglifyJsPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/'),
        () => false
      )
    ).toMatchSnapshot();
  });
});
