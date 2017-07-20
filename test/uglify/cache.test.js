import crypto from 'crypto';
import findCacheDir from 'find-cache-dir';
import { get, put } from '../../src/uglify/cache';

const hashAlgorithm = 'sha512';
const getHash = data => `${hashAlgorithm}-${
  crypto.createHash(hashAlgorithm).update(data).digest('base64')
}`;

const cacheDirectory = findCacheDir({
  name: 'uglify-webpack-plugin-test',
});

const data = {
  file: 'test/content.js',
  input: '"hello uglifyjs"',
};

describe('when cache', () => {
  beforeEach(() => put(cacheDirectory, data.file, data.input, getHash(data.input)));
  it('get cache', () => get(cacheDirectory, data.file, getHash(data.input)).then((input) => {
    expect(data.input).toEqual(input);
  }));
  it('the cache has expired', () => {
    data.input = 'hello world';
    return get(cacheDirectory, data.file, getHash(data.input)).then(() => Promise.reject(new Error('cache verification failed')), (error) => {
      expect(error.message).toEqual('The cache has expired');
    });
  });
});
