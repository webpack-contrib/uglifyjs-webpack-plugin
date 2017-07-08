import fs from 'fs';
import path from 'path';
import ComputeCluster from 'compute-cluster';
import { get, put } from './cache';
import { encode } from './serialization'; // eslint-disable-line import/newline-after-import
const uglifyVersion = require(require.resolve('uglify-es/package.json')).version; // eslint-disable-line import/no-dynamic-require
const packageVersion = require('../../package.json').version; // eslint-disable-line import/no-dynamic-require

let workerFile = path.join(__dirname, '..', '..', 'dist', 'uglify', 'worker.js');

try {
  fs.accessSync(workerFile);
} catch (e) {
  // npm
  workerFile = path.join(__dirname, 'worker.js');
}


class Uglify extends ComputeCluster {
  constructor(options) {
    super({
      max_processes: options.maxWorkers,
      max_backlog: -1,
      module: workerFile,
    });
    this.options = options;
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
      const cacheIdentifier = `${uglifyVersion}|${packageVersion}|${task.input}`;
      const enqueue = () => {
        this.enqueue(json, (errors, data) => {
          const done = () => step(index, data || [errors]);
          if (this.options.cache && !errors) {
            put(this.options.cacheDirectory, id, data, cacheIdentifier).then(done).catch(done);
          } else {
            done();
          }
        });
      };
      if (this.options.cache) {
        get(this.options.cacheDirectory, id, cacheIdentifier).then((data) => {
          step(index, data);
        }).catch((enqueue));
      } else {
        enqueue();
      }
    });
  }
}

export default Uglify;
