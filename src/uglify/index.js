import fs from 'fs';
import os from 'os';
import path from 'path';
import findCacheDir from 'find-cache-dir';
import ComputeCluster from 'compute-cluster';
import { get, put } from './cache';
import { encode } from './serialization';
import versions from './versions';

let workerFile = path.join(__dirname, 'worker.js');

try {
  const testWorkerFile = path.join(__dirname, '..', '..', 'dist', 'uglify', 'worker.js');
  fs.accessSync(workerFile);
  workerFile = testWorkerFile;
} catch (e) { } // eslint-disable-line no-empty


class Uglify extends ComputeCluster {
  constructor({ cache = findCacheDir({ name: 'uglifyjs-webpack-plugin' }), workers = os.cpus().length }) {
    super({
      max_processes: workers,
      max_backlog: -1,
      module: workerFile,
    });
    this.cache = cache;
  }

  runTasks(tasks, callback) {
    let toRun = tasks.length;
    const results = [];
    this.on('error', (err) => {
      this.exit();
      callback(err);
    });
    const step = (index, [errors, data]) => {
      toRun -= 1;
      results[index] = [errors ? new Error(errors.message) : null, data];
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
        this.enqueue(json, (errors, data) => {
          const done = () => step(index, data || [errors]);
          if (this.cache && !errors) {
            put(this.cacheDirectory, id, data, cacheIdentifier).then(done).catch(done);
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
