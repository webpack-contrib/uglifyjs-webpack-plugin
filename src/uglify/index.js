import os from 'os';
import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import minify from './minify';
import { encode } from './serialization';

let workerFile = require.resolve('./worker');

try {
  // run test
  workerFile = require.resolve('../../dist/uglify/worker');
} catch (e) {} // eslint-disable-line no-empty

export default class {
  constructor(options = {}) {
    const { cache, parallel } = options;
    this.cacheDir =
      cache === true
        ? findCacheDir({ name: 'uglifyjs-webpack-plugin' })
        : cache;
    this.maxConcurrentWorkers =
      parallel === true
        ? os.cpus().length - 1
        : Math.min(Number(parallel) || 0, os.cpus().length - 1);
  }

  runTasks(tasks, callback) {
    if (!tasks.length) {
      callback(null, []);
      return;
    }

    if (this.maxConcurrentWorkers > 0) {
      const workerOptions =
        process.platform === 'win32'
          ? {
              maxConcurrentWorkers: this.maxConcurrentWorkers,
              maxConcurrentCallsPerWorker: 1,
            }
          : { maxConcurrentWorkers: this.maxConcurrentWorkers };
      this.workers = workerFarm(workerOptions, workerFile);
      this.boundWorkers = (options, cb) =>
        this.workers(JSON.stringify(options, encode), cb);
    } else {
      this.boundWorkers = (options, cb) => {
        try {
          cb(null, minify(options));
        } catch (errors) {
          cb(errors);
        }
      };
    }

    let toRun = tasks.length;
    const results = [];
    const step = (index, data) => {
      toRun -= 1;
      results[index] = data;

      if (!toRun) {
        callback(null, results);
      }
    };

    tasks.forEach((task, index) => {
      const enqueue = () => {
        this.boundWorkers(task, (error, data) => {
          const result = error ? { error } : data;
          const done = () => step(index, result);

          if (this.cacheDir && !result.error) {
            cacache
              .put(this.cacheDir, task.cacheKey, JSON.stringify(data))
              .then(done, done);
          } else {
            done();
          }
        });
      };

      if (this.cacheDir) {
        cacache
          .get(this.cacheDir, task.cacheKey)
          .then(({ data }) => step(index, JSON.parse(data)), enqueue);
      } else {
        enqueue();
      }
    });
  }

  exit() {
    if (this.workers) {
      workerFarm.end(this.workers);
    }
  }
}
