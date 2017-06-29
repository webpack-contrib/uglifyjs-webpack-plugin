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
  const str = exports.removeCWD(error.toString())
    .split('\n').slice(0, 2).join('\n');
  return str;
};

