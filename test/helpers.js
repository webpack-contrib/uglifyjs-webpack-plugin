import MemoryFileSystem from 'memory-fs'; // eslint-disable-line import/no-extraneous-dependencies
import webpack from 'webpack';

exports.PluginEnvironment = class PluginEnvironment {
  constructor() {
    this.events = [];
  }

  getEnvironmentStub() {
    return {
      plugin: (name, handler) => {
        this.events.push({
          name,
          handler,
        });
      },
    };
  }

  getEventBindings() {
    return this.events;
  }
};

exports.compile = function compile(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => { // eslint-disable-line consistent-return
      if (err) return reject(err);
      resolve(stats);
    });
  });
};

exports.createCompiler = function createCompiler(options = {}) {
  const compiler = webpack({
    cache: false,
    entry: `${__dirname}/stubs/entry.js`,
    resolve: {
      unsafeCache: false,
    },
    resolveLoader: {
      unsafeCache: false,
    },
    module: {
      unsafeCache: false,
    },
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
};

exports.removeCWD = function removeCWD(str) {
  return str.split(`${process.cwd()}/`).join('');
};

exports.cleanErrorStack = function cleanErrorStack(error) {
  const str = exports.removeCWD(error.toString())
    .split('\n').slice(0, 2).join('\n');
  return str;
};

