import crypto from 'crypto';
import cacache from 'cacache';

const hashAlgorithm = 'sha512';
const getHash = data => `${hashAlgorithm}-${
  crypto.createHash(hashAlgorithm).update(data).digest('base64')
}`;

export const get = (cacheDirectory, key, identifier) => cacache.get(cacheDirectory, key).then(({ data, metadata }) => {
  const hash = getHash(identifier);
  if (metadata.hash !== hash) {
    return Promise.reject(new Error('The cache has expired'));
  }
  return JSON.parse(data);
});

export const put = (cacheDirectory, key, data, identifier) => {
  const hash = getHash(identifier);
  return cacache.put(cacheDirectory, key, JSON.stringify(data), { metadata: { hash } });
};
