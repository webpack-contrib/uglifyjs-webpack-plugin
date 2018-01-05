/* eslint-disable
  import/order
 */

import webpack from './helpers/compiler';
import UglifyJsPlugin from '../src/index';

describe('Plugin', () => {
  test('Defaults', async () => {
    const config = {
      plugins: [new UglifyJsPlugin()],
    };

    const stats = await webpack('entry.js', config);
    const { assets } = stats.compilation;

    const main = assets['main.bundle.js'].source();

    expect(main).toMatchSnapshot();
  });
});
