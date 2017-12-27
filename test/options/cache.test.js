/* eslint-disable
  import/order,
  no-shadow 
 */
import del from 'del';
import { existsSync } from 'fs';
import findCacheDir from 'find-cache-dir';
import webpack from '../helpers/compiler';
import UglifyJsPlugin from '../../src/index';

const cacheDir = findCacheDir({ name: 'uglifyjs-webpack-plugin' });

const filter = (file) => (!/\.map/.test(file) ? file : false);

beforeEach(() => del.sync(cacheDir));

describe('Options', () => {
  describe('cache', () => {
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

      expect(existsSync(cacheDir)).toBe(false);
    });

    test('{Boolean} - true', async () => {
      const config = {
        plugins: [
          new UglifyJsPlugin({
            cache: true,
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

      expect(existsSync(cacheDir)).toBe(true);
    });

    test('{String}', async () => {
      const cacheDir =
        'test/options/__snapshots__/.cache/uglifyjs-webpack-plugin';

      const config = {
        plugins: [
          new UglifyJsPlugin({
            cache: cacheDir,
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

      expect(existsSync(cacheDir)).toBe(true);
    });
  });
});
