import webpack from '../helpers/compiler';
import UglifyJsPlugin from '../../src/index';

describe('ECMAScript', () => {
  test('ES5', async () => {
    const config = {
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            ecma: 5,
            mangle: false,
            warnings: true,
            output: {
              beautify: true,
            },
          },
        }),
      ],
    };

    const stats = await webpack('es5/entry.js', config);
    const { assets } = stats.compilation;

    const source = assets['main.bundle.js'].source();

    expect(source).toMatchSnapshot();
  });

  test('ES2015', async () => {
    const config = {
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            ecma: 6,
            mangle: false,
            warnings: true,
            output: {
              beautify: true,
            },
          },
        }),
      ],
    };

    const stats = await webpack('es2015/entry.js', config);
    const { assets } = stats.compilation;

    const source = assets['main.bundle.js'].source();

    expect(source).toMatchSnapshot();
  });

  test('ES2016', async () => {
    const config = {
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            ecma: 7,
            mangle: false,
            warnings: true,
            output: {
              beautify: true,
            },
          },
        }),
      ],
    };

    const stats = await webpack('es2016/entry.js', config);
    const { assets } = stats.compilation;

    const source = assets['main.bundle.js'].source();

    expect(source).toMatchSnapshot();
  });

  test('ES2017', async () => {
    const config = {
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            ecma: 8,
            mangle: false,
            warnings: true,
            output: {
              beautify: true,
            },
          },
        }),
      ],
    };

    const stats = await webpack('es2017/entry.js', config);
    const { assets } = stats.compilation;

    const source = assets['main.bundle.js'].source();

    expect(source).toMatchSnapshot();
  });
});
