import os from 'os';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import minify from './minify';
import cache from './cache';
import { encode } from './serialization';

let workerFile = require.resolve('./worker');

try {
  // run test
  workerFile = require.resolve('../../dist/uglify/worker');
} catch (e) { } // eslint-disable-line no-empty

export default class {
  constructor(options = {}) {
    const { cache: useCache, parallel } = options;
    this.cacheDir = useCache === true ? findCacheDir({ name: 'uglifyjs-webpack-plugin' }) : useCache;
    this.maxConcurrentWorkers = parallel === true ? os.cpus().length - 1 : Math.min(Number(parallel) || 0, os.cpus().length - 1);
  }

  runTasks(tasks, callback) {
    if (!tasks.length) {
      callback(null, []);
      return;
    }

    if (this.maxConcurrentWorkers > 0) {
      this.workers = workerFarm({
        maxConcurrentWorkers: this.maxConcurrentWorkers,
      }, workerFile);
      this.boundWorkers = (options, cb) => this.workers(JSON.stringify(options, encode), cb);
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
            cache.put(this.cacheDir, task.cacheKey, JSON.stringify(data));
            done();
          } else {
            done();
          }
        });
      };

      if (this.cacheDir) {
        const data = cache.get(this.cacheDir, task.cacheKey);
        if (!data) {
          enqueue();
        } else {
          step(index, JSON.parse(data));
        }
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
