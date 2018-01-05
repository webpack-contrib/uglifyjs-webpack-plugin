import webpack from '../helpers/compiler';
import UglifyJsPlugin from '../../src/index';

describe('Options', () => {
  describe('sourceMap', () => {
    test('{Boolean} - true', async () => {
      const config = {
        plugins: [
          new UglifyJsPlugin({
            sourceMap: true,
          }),
        ],
      };

      const stats = await webpack('entry.js', config);
      const { assets } = stats.compilation;

      const { source, map } = assets['main.bundle.js'].sourceAndMap();

      expect(source).toMatchSnapshot();
      expect(map).toMatchSnapshot();
    });
  });

  test('{Boolean} - true (parallel)', async () => {
    const config = {
      plugins: [
        new UglifyJsPlugin({
          parallel: true,
          sourceMap: true,
        }),
      ],
    };

    const stats = await webpack('entry.js', config);
    const { assets } = stats.compilation;

    const { source, map } = assets['main.bundle.js'].sourceAndMap();

    expect(source).toMatchSnapshot();
    expect(map).toMatchSnapshot();
  });
});
