/* eslint-disable
  import/order
 */
import webpack from './helpers/compiler';
import { cleanErrorStack } from './helpers';
import UglifyJsPlugin from '../src/index';

describe('Errors', () => {
  test('ValidationError', async () => {
    const config = {
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              invalid: true,
            },
          },
        }),
      ],
    };

    const stats = await webpack('entry.js', config);
    const { assets } = stats.compilation;

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot();
    expect(warnings).toMatchSnapshot();

    expect(assets['main.bundle.js'].source()).toMatchSnapshot();
  });

  test('Uglify Errors', async () => {
    const config = {
      plugins: [
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              invalid: true,
            },
          },
        }),
      ],
    };

    const stats = await webpack('entry.js', config);
    const { errors } = stats.compilation;

    expect(errors[0].message).toEqual(expect.stringContaining('from UglifyJs'));
  });
});
