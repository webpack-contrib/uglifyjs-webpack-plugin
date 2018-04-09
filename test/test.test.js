import UglifyJsPlugin from '../src/index';
import {
  cleanErrorStack,
  createCompiler,
  compile,
} from './helpers';

describe('when applied with test option', () => {
  it('with empty value', () => {
    const compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
        mjs: `${__dirname}/fixtures/entry.mjs`,
        importExport: `${__dirname}/fixtures/import-export/entry.js`,
        AsyncImportExport: `${__dirname}/fixtures/async-import-export/entry.js`,
      },
      output: {
        path: `${__dirname}/dist`,
        filename: '[name].js?var=[hash]',
        chunkFilename: '[id].[name].js?ver=[hash]',
      },
    });

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
});
