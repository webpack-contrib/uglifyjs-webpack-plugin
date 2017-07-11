import os from 'os';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import { get, put } from './cache';
import { encode } from './serialization';
import versions from './versions';

let workerFile = require.resolve('./worker');

try {
  // run test
  workerFile = require.resolve('../../dist/uglify/worker');
} catch (e) { } // eslint-disable-line no-empty

class Uglify {
  constructor({
    cache = findCacheDir({ name: 'uglifyjs-webpack-plugin' }),
    workers = Math.max(os.cpus().length - 1, 1),
  }) {
    this.worker = workerFarm({
      maxConcurrentWorkers: workers,
    }, workerFile);
    this.cache = cache;
  }

  exit(callback) {
    workerFarm.end(this.worker);
    if (typeof callback === 'function') {
      callback();
    }
  }

  runTasks(tasks, callback) {
    let toRun = tasks.length;
    const results = [];
    const step = (index, data) => {
      toRun -= 1;
      results[index] = data;
      if (!toRun) {
        callback(null, results);
      }
    };
    if (!tasks.length) {
      process.nextTick(() => {
        callback(null, results);
      });
      return;
    }
    tasks.forEach((task, index) => {
      const json = encode(task);
      const id = task.id || task.file;
      const cacheIdentifier = `${versions.uglify}|${versions.plugin}|${task.input}`;
      const enqueue = () => {
        this.worker(json, (errors, data) => {
          const done = () => step(index, errors ? { error: errors.message } : data);
          if (this.cache && !errors) {
            put(this.cache, id, data, cacheIdentifier).then(done).catch(done);
          } else {
            done();
          }
        });
      };
      if (this.cache) {
        get(this.cache, id, cacheIdentifier).then((data) => {
          step(index, data);
        }).catch((enqueue));
      } else {
        enqueue();
      }
    });
  }
}

export default Uglify;
