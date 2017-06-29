import MemoryFileSystem from 'memory-fs';
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

exports.createCompiler = function createCompiler(options) {
  const compiler = webpack(options || {
    bail: true,
    cache: false,
    entry: `${__dirname}/stubs/entry.js`,
    output: {
      path: `${__dirname}/dist`,
      filename: '[name].js',
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
      }),
    ],
  });
  compiler.outputFileSystem = new MemoryFileSystem();
  return compiler;
};

exports.removeCWD = function removeCWD(str) {
  return str.split(`${process.cwd()}/`).join('');
};

exports.cleanErrorStack = function cleanErrorStack(error) {
  return exports.removeCWD(error.toString())
    .replace(/\n(\s+)(.*)\((.*)\)/g, '\n$1$3')
    .replace(/([0-9]+)\:([0-9]+)/g, '$1')
    .replace(/\(|\)/g, '')
    .replace(/at /g, '');
};

