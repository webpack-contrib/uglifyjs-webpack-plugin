import webpack from '../helpers/compiler';
import UglifyJsPlugin from '../../src/index';

const filter = (file) => (!/\.map/.test(file) ? file : false);

describe('Options', () => {
  describe('parallel', () => {
    test('{Boolean} - false', async () => {
      const config = {
        plugins: [
          new UglifyJsPlugin({
            parallel: false,
          }),
        ],
      };

      const stats = await webpack('parallel/entry.js', config);
      const { assets } = stats.compilation;

      Object.keys(assets)
        .filter(filter)
        .forEach((asset) => {
          expect(assets[asset].source()).toMatchSnapshot();
        });
    });

    test('{Boolean} - true', async () => {
      const config = {
        plugins: [
          new UglifyJsPlugin({
            parallel: true,
          }),
        ],
      };

      const stats = await webpack('parallel/entry.js', config);
      const { assets } = stats.compilation;

      Object.keys(assets)
        .filter(filter)
        .forEach((asset) => {
          expect(assets[asset].source()).toMatchSnapshot();
        });
    });

    test('{Number}', async () => {
      const config = {
        plugins: [
          new UglifyJsPlugin({
            parallel: 2,
          }),
        ],
      };

      const stats = await webpack('parallel/entry.js', config);
      const { assets } = stats.compilation;

      Object.keys(assets)
        .filter(filter)
        .forEach((asset) => {
          expect(assets[asset].source()).toMatchSnapshot();
        });
    });
  });
});
