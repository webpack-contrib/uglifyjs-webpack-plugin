import fs from 'fs';
import os from 'os';
import path from 'path';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import { get, put } from './cache';
import { encode } from './serialization';
import versions from './versions';

let workerFile = path.join(__dirname, 'worker.js');

try {
  const testWorkerFile = path.join(__dirname, '..', '..', 'dist', 'uglify', 'worker.js');
  fs.accessSync(workerFile);
  workerFile = testWorkerFile;
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
      const id = task.id || /* istanbul ignore next */ task.file;
      const cacheIdentifier = `${versions.uglify}|${versions.plugin}|${task.input}`;
      const enqueue = () => {
        this.worker(json, (errors, data) => {
          const done = () => step(index, errors ? /* istanbul ignore next */ { error: errors.message } : data);
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
