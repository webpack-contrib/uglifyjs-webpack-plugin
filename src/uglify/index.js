import os from 'os';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import minify from './minify';
import { get, put } from './cache';
import { encode } from './serialization';
import versions from './versions';

let workerFile = require.resolve('./worker');

try {
  // run test
  workerFile = require.resolve('../../dist/uglify/worker');
} catch (e) { } // eslint-disable-line no-empty

export default class {
  constructor(parallel = {}) {
    let options = parallel;
    if (typeof parallel === 'boolean') {
      options = { cache: parallel, workers: parallel };
    }
    const { cache, workers } = options;
    this.cache = cache === true ? findCacheDir({ name: 'uglifyjs-webpack-plugin' }) : cache;
    this.workers = workers === true ? os.cpus().length - 1 : Math.min(Number(workers) || 0, os.cpus().length - 1);
  }

  worker(options, callback) {
    if (this.workers > 0) {
      this.workerFarm = workerFarm({
        maxConcurrentWorkers: this.workers,
      }, workerFile);
      this.worker = (opt, cb) => this.workerFarm(JSON.stringify(opt, encode), cb);
    } else {
      this.worker = (opt, cb) => {
        try {
          const result = minify(opt);
          cb(null, result);
        } catch (errors) {
          cb(errors);
        }
      };
    }

    this.worker(options, callback);
  }

  exit() {
    if (this.workerFarm) {
      workerFarm.end(this.workerFarm);
    }
  }

  runTasks(tasks, callback) {
    if (!tasks.length) {
      callback(null, []);
      return;
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
      const cacheIdentifier = `${versions.uglify}|${versions.plugin}|${task.input}`;
      const enqueue = () => {
        this.worker(task, (error, data) => {
          const result = error ? { error } : data;
          const done = () => step(index, result);
          if (this.cache && !result.error) {
            put(this.cache, task.cacheKey, data, cacheIdentifier).then(done, done);
          } else {
            done();
          }
        });
      };
      if (this.cache) {
        get(this.cache, task.cacheKey, cacheIdentifier).then(data => step(index, data), enqueue);
      } else {
        enqueue();
      }
    });
  }
}

