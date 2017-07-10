import MultiCompiler from 'webpack/lib/MultiCompiler';
import MultiStats from 'webpack/lib/MultiStats';
import UglifyJsPlugin from '../src/index';
import {
  cleanErrorStack,
  countPlugins,
  createCompiler,
  compile,
} from './helpers';

describe('when multiple plugin instances are applied to same compiler', () => {
  it('should allow only a single plugin instance to be applied', () => {
    const compiler = createCompiler({ plugins: [] });
    let lastCounted = countPlugins(compiler);
    expect(lastCounted).toMatchSnapshot('initial count');

    new UglifyJsPlugin().apply(compiler);
    expect(countPlugins(compiler)).not.toEqual(lastCounted);
    lastCounted = countPlugins(compiler);

    new UglifyJsPlugin().apply(compiler);
    expect(lastCounted).toMatchSnapshot('after adding a second plugin instance');
    expect(countPlugins(compiler)).toEqual(lastCounted);

    new UglifyJsPlugin().apply(compiler);
    expect(lastCounted).toMatchSnapshot('after adding a third plugin instance');
    expect(countPlugins(compiler)).toEqual(lastCounted);

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

  it('should correctly apply when used with MultiCompiler', () => {
    const multiCompiler = createCompiler([
      {
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[id].[name].[chunkhash].js',
        },
      },
      {
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[id].[name].[chunkhash].js',
        },
        plugins: [
          new UglifyJsPlugin(),
        ],
      },
      {
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[id].[name].[chunkhash].js',
        },
        plugins: [
          new UglifyJsPlugin(),
          new UglifyJsPlugin(),
          new UglifyJsPlugin(),
          new UglifyJsPlugin(),
        ],
      },
      {
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/es2015/entry.js`,
        output: {
          path: `${__dirname}/dist-MultiCompiler`,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[id].[name].[chunkhash].js',
        },
        plugins: [
          new UglifyJsPlugin(),
          new UglifyJsPlugin(),
          new UglifyJsPlugin(),
          new UglifyJsPlugin(),
        ],
      },
    ]);

    expect(multiCompiler).toBeInstanceOf(MultiCompiler);

    multiCompiler.compilers.slice(2).forEach((compiler) => {
      expect(countPlugins(compiler)).toMatchSnapshot('compiler plugin count');
    });

    return compile(multiCompiler).then((multiStats) => {
      expect(multiStats).toBeInstanceOf(MultiStats);

      multiStats.stats.forEach((stats) => {
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
  });
});
