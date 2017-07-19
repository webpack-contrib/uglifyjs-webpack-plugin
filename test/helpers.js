import MemoryFileSystem from 'memory-fs'; // eslint-disable-line import/no-extraneous-dependencies
import webpack from 'webpack';

export class PluginEnvironment {
  constructor() {
    this.events = [];
    this.uniquePlugins = new WeakSet();
  }

  getEnvironmentStub() {
    return {
      plugin: (name, handler) => {
        this.events.push({
          name,
          handler,
        });
      },
      applyUnique: (PluginClass) => {
        // eslint-disable-next-line consistent-return
        if (this.uniquePlugins.has(PluginClass)) return true;
        this.uniquePlugins.add(PluginClass);
      },
    };
  }

  getEventBindings() {
    return this.events;
  }
}

export function compile(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => { // eslint-disable-line consistent-return
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

export function createCompiler(options = {}) {
  const compiler = webpack(Array.isArray(options) ? options : {
    bail: true,
    cache: false,
    entry: `${__dirname}/fixtures/entry.js`,
    output: {
      path: `${__dirname}/dist`,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[id].[name].[chunkhash].js',
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
      }),
    ],
    ...options,
  });
  compiler.outputFileSystem = new MemoryFileSystem();
  return compiler;
}

export function countPlugins({ _plugins }) {
  return Object.keys(_plugins).reduce((aggregate, name) => {
    const currentLength = typeof aggregate[name] === 'number' ? aggregate[name].length : 0;
    const eventLength = Array.isArray(_plugins[name]) ? _plugins[name].length : 0;

    if (eventLength > currentLength) {
      Object.assign(aggregate, {
        [name]: eventLength,
      });
    }
    return aggregate;
  }, {});
}

export function removeCWD(str) {
  return str.split(`${process.cwd()}/`).join('');
}

export function cleanErrorStack(error) {
  const str = exports.removeCWD(error.toString())
    .split('\n').slice(0, 2).join('\n');
  return str;
}

