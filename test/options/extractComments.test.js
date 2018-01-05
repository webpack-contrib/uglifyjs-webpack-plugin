import webpack from '../helpers/compiler';
import UglifyJsPlugin from '../../src/index';

describe('Options', () => {
  describe('extract', () => {
    test('{String}', async () => {
      const config = {
        entry: {
          1: './extract/1.js',
          main: './entry.js',
        },
        plugins: [
          new UglifyJsPlugin({
            extractComments: 'all',
          }),
        ],
      };

      const stats = await webpack('extract/entry2.js', config);
      const { assets } = stats.compilation;

      expect(assets['1.bundle.js'].source()).toMatchSnapshot();
      expect(assets['1.bundle.js.LICENSE'].source()).toMatchSnapshot();

      expect(assets['main.bundle.js'].source()).toMatchSnapshot();
      expect(assets['main.bundle.js.LICENSE'].source()).toMatchSnapshot();
    });

    test('{Regex}', async () => {
      const config = {
        entry: {
          1: './extract/1.js',
          main: './entry.js',
        },
        plugins: [
          new UglifyJsPlugin({
            extractComments: /.*/,
          }),
        ],
      };

      const stats = await webpack('extract/entry2.js', config);
      const { assets } = stats.compilation;

      expect(assets['1.bundle.js'].source()).toMatchSnapshot();
      expect(assets['1.bundle.js.LICENSE'].source()).toMatchSnapshot();

      expect(assets['main.bundle.js'].source()).toMatchSnapshot();
      expect(assets['main.bundle.js.LICENSE'].source()).toMatchSnapshot();
    });

    test('{Object}', async () => {
      const config = {
        entry: {
          1: './extract/1.js',
          2: './extract/2.js',
          3: './extract/3.js',
          4: './extract/4.js',
          main: './extract/entry.js',
        },
        plugins: [
          new UglifyJsPlugin({
            exclude: /runtime/,
            uglifyOptions: {
              output: {
                comments: 'all',
              },
            },
            extractComments: {
              condition: /.*/,
              filename: 'extracted.js',
            },
          }),
        ],
      };

      const stats = await webpack('extract/entry.js', config);
      const { assets } = stats.compilation;

      expect(assets['1.bundle.js'].source()).toMatchSnapshot('1.bundle.js');
      expect(assets['2.bundle.js'].source()).toMatchSnapshot('2.bundle.js');
      expect(assets['3.bundle.js'].source()).toMatchSnapshot('3.bundle.js');
      expect(assets['4.bundle.js'].source()).toMatchSnapshot('4.bundle.js');
      expect(assets['main.bundle.js'].source()).toMatchSnapshot(
        'main.bundle.js'
      );

      expect(assets['extracted.js'].source()).toMatchSnapshot('extracted.js');
    });

    test('{Object<{Function}>}', async () => {
      const config = {
        plugins: [
          new UglifyJsPlugin({
            extractComments: {
              condition: true,
              filename(file) {
                return file.replace(/(\.\w+)$/, '.license$1');
              },
              banner(file) {
                return `License information can be found in ${file}`;
              },
            },
          }),
        ],
      };

      const stats = await webpack('extract/entry2.js', config);
      const { assets } = stats.compilation;

      expect(assets['main.bundle.js'].source()).toMatchSnapshot();
      expect(assets['main.bundle.license.js'].source()).toMatchSnapshot();
    });

    test('{Function}', async () => {
      const config = {
        entry: {
          1: './extract/1.js',
          main: './entry.js',
        },
        plugins: [
          new UglifyJsPlugin({
            extractComments: () => true,
          }),
        ],
      };

      const stats = await webpack('extract/entry2.js', config);
      const { assets } = stats.compilation;

      expect(assets['1.bundle.js'].source()).toMatchSnapshot();
      expect(assets['1.bundle.js.LICENSE'].source()).toMatchSnapshot();
      expect(assets['main.bundle.js'].source()).toMatchSnapshot();
      expect(assets['main.bundle.js.LICENSE'].source()).toMatchSnapshot();
    });
  });
});
