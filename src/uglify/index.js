import os from 'os';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import { get, put } from './cache';
import { encode } from './serialization';
import versions from './versions';
import worker from './worker';

let workerFile = require.resolve('./worker');

try {
  // run test
  workerFile = require.resolve('../../dist/uglify/worker');
} catch (e) { } // eslint-disable-line no-empty

class Uglify {
  constructor({
    cache = findCacheDir({ name: 'uglifyjs-webpack-plugin' }),
    workers = os.cpus().length - 1,
  }) {
    this.cache = cache;
    this.workers = workers;
  }

  worker(options, callback) {
    if (this.workers > 0) {
      this.workerFarm = workerFarm({
        maxConcurrentWorkers: this.workers,
      }, workerFile);
      this.worker = this.workerFarm;
    } else {
      this.worker = worker;
    }

    this.worker(options, callback);
  }

  exit() {
    if (this.workerFarm) {
      workerFarm.end(this.workerFarm);
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
      const cacheIdentifier = `${versions.uglify}|${versions.plugin}|${task.input}`;
      const enqueue = () => {
        this.worker(JSON.stringify(task, encode), (errors, data) => {
          const done = () => step(index, errors ? { error: errors.message } : data);
          if (this.cache && !errors) {
            put(this.cache, task.cacheKey, data, cacheIdentifier).then(done).catch(done);
          } else {
            done();
          }
        });
      };
      if (this.cache) {
        get(this.cache, task.cacheKey, cacheIdentifier).then((data) => {
          step(index, data);
        }).catch((enqueue));
      } else {
        enqueue();
      }
    });
  }
}

export default Uglify;
