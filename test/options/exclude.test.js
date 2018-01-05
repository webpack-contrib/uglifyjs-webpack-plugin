import webpack from '../helpers/compiler';
import UglifyJsPlugin from '../../src/index';

describe('Options', () => {
  describe('exclude', () => {
    test('{RegExp}', async () => {
      const config = {
        entry: {
          1: `./exclude/1.js`,
          2: `./exclude/2.js`,
          entry: `./entry.js`,
        },
        plugins: [
          new UglifyJsPlugin({
            exclude: /1/,
          }),
        ],
      };

      const stats = await webpack(false, config);
      const { assets } = stats.compilation;

      expect(assets['1.bundle.js'].source()).toMatchSnapshot();
      expect(assets['2.bundle.js'].source()).toMatchSnapshot();
    });

    test('{Array<{RegExp}>}', async () => {
      const config = {
        entry: {
          1: `./exclude/1.js`,
          2: `./exclude/2.js`,
          entry: `./entry.js`,
        },
        plugins: [
          new UglifyJsPlugin({
            exclude: [/1/, /2/],
          }),
        ],
      };

      const stats = await webpack(false, config);
      const { assets } = stats.compilation;

      expect(assets['1.bundle.js'].source()).toMatchSnapshot();
      expect(assets['2.bundle.js'].source()).toMatchSnapshot();
    });
  });
});
