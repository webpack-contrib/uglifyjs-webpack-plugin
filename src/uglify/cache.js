import flatCache from 'flat-cache';

const id = 'uglifyjs-webpack-plugin';

const cache = {
  get(dir, key) {
    const loadedCache = flatCache.load(id, dir);
    const data = loadedCache.getKey(key);
    return data;
  },
  put(dir, key, data) {
    const loadedCache = flatCache.load(id, dir);
    loadedCache.setKey(key, data);
    loadedCache.save(true);
  },
  list(dir) {
    const loadedCache = flatCache.load(id, dir);
    return loadedCache.all();
  },
  clear(dir) {
    flatCache.clearAll(dir);
  },
};

export default cache;
