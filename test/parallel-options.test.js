import os from 'os';
import workerFarm from 'worker-farm';
import UglifyJsPlugin from '../src/index';
import {
  PluginEnvironment,
  createCompiler,
  compile,
  cleanErrorStack,
} from './helpers';

// Based on https://github.com/facebook/jest/blob/edde20f75665c2b1e3c8937f758902b5cf28a7b4/packages/jest-runner/src/__tests__/test_runner.test.js
let workerFarmMock;

jest.mock('worker-farm', () => {
  const mock = jest.fn(
    (options, worker) =>
      (workerFarmMock = jest.fn((data, callback) =>
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(worker)(data, callback)
      ))
  );
  mock.end = jest.fn();
  return mock;
});

describe('when options.parallel', () => {
  const assets = {
    'test.js': {
      source: () => 'function test(foo) { foo = 1; }',
    },
    'test1.js': {
      source: () => 'function test1(foo) { foo = 1; }',
    },
    'test2.js': {
      source: () => 'function test2(foo) { foo = 1; }',
    },
    'test3.js': {
      source: () => 'function test3(foo) { foo = 1; }',
    },
  };

  describe('false', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        parallel: false,
      });
      plugin.apply(compilerEnv);
      eventBindings = pluginEnvironment.getEventBindings();
    });

    it('binds one event handler', () => {
      expect(eventBindings.length).toBe(1);
    });

    describe('compilation handler', () => {
      beforeEach(() => {
        [eventBinding] = eventBindings;
      });

      it('binds to compilation event', () => {
        expect(eventBinding.name).toBe('compilation');
      });

      describe('when called', () => {
        let chunkPluginEnvironment;
        let compilationEventBindings;
        let compilationEventBinding;
        let compilation;
        let callback;

        beforeEach(() => {
          chunkPluginEnvironment = new PluginEnvironment();
          compilation = chunkPluginEnvironment.getEnvironmentStub();
          compilation.assets = assets;
          compilation.errors = [];

          workerFarm.mockClear();
          workerFarm.end.mockClear();

          eventBinding.handler(compilation);
          compilationEventBindings = chunkPluginEnvironment.getEventBindings();
        });

        it('binds one event handler', () => {
          expect(compilationEventBindings.length).toBe(1);
        });

        describe('optimize-chunk-assets handler', () => {
          beforeEach(() => {
            [compilationEventBinding] = compilationEventBindings;
          });

          it('binds to optimize-chunk-assets event', () => {
            expect(compilationEventBinding.name).toEqual(
              'optimize-chunk-assets'
            );
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler([''], () => {
              callback();
              expect(callback.mock.calls.length).toBe(1);
              done();
            });
          });

          it('parallelization', (done) => {
            compilationEventBinding.handler(
              [
                {
                  files: ['test.js', 'test1.js', 'test2.js', 'test3.js'],
                },
              ],
              () => {
                expect(workerFarm.mock.calls.length).toBe(0);
                expect(workerFarm.end.mock.calls.length).toBe(0);

                done();
              }
            );
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ parallel: false }).apply(compiler);

      return compile(compiler).then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('parallel `false`: errors');
        expect(warnings).toMatchSnapshot('parallel `false`: warnings');

        for (const file in stats.compilation.assets) {
          if (
            Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
          ) {
            expect(stats.compilation.assets[file].source()).toMatchSnapshot(
              `parallel \`false\`: asset ${file}`
            );
          }
        }
      });
    });
  });

  describe('true', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        parallel: true,
      });
      plugin.apply(compilerEnv);
      eventBindings = pluginEnvironment.getEventBindings();
    });

    it('binds one event handler', () => {
      expect(eventBindings.length).toBe(1);
    });

    describe('compilation handler', () => {
      beforeEach(() => {
        [eventBinding] = eventBindings;
      });

      it('binds to compilation event', () => {
        expect(eventBinding.name).toBe('compilation');
      });

      describe('when called', () => {
        let chunkPluginEnvironment;
        let compilationEventBindings;
        let compilationEventBinding;
        let compilation;
        let callback;

        beforeEach(() => {
          chunkPluginEnvironment = new PluginEnvironment();
          compilation = chunkPluginEnvironment.getEnvironmentStub();
          compilation.assets = assets;
          compilation.errors = [];

          workerFarm.mockClear();
          workerFarm.end.mockClear();

          eventBinding.handler(compilation);
          compilationEventBindings = chunkPluginEnvironment.getEventBindings();
        });

        it('binds one event handler', () => {
          expect(compilationEventBindings.length).toBe(1);
        });

        describe('optimize-chunk-assets handler', () => {
          beforeEach(() => {
            [compilationEventBinding] = compilationEventBindings;
          });

          it('binds to optimize-chunk-assets event', () => {
            expect(compilationEventBinding.name).toEqual(
              'optimize-chunk-assets'
            );
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler([''], () => {
              callback();
              expect(callback.mock.calls.length).toBe(1);
              done();
            });
          });

          it('parallelization', (done) => {
            compilationEventBinding.handler(
              [
                {
                  files: ['test.js', 'test1.js', 'test2.js', 'test3.js'],
                },
              ],
              () => {
                expect(workerFarm.mock.calls.length).toBe(1);
                expect(workerFarm.mock.calls[0][0].maxConcurrentWorkers).toBe(
                  os.cpus().length - 1
                );
                expect(workerFarmMock.mock.calls.length).toBe(4);
                expect(workerFarm.end.mock.calls.length).toBe(1);

                done();
              }
            );
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ parallel: true }).apply(compiler);

      return compile(compiler).then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('parallel `true`: errors');
        expect(warnings).toMatchSnapshot('parallel `true`: warnings');

        for (const file in stats.compilation.assets) {
          if (
            Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
          ) {
            expect(stats.compilation.assets[file].source()).toMatchSnapshot(
              `parallel \`true\`: asset ${file}`
            );
          }
        }
      });
    });
  });

  describe('number', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        parallel: 2,
      });
      plugin.apply(compilerEnv);
      eventBindings = pluginEnvironment.getEventBindings();
    });

    it('binds one event handler', () => {
      expect(eventBindings.length).toBe(1);
    });

    describe('compilation handler', () => {
      beforeEach(() => {
        [eventBinding] = eventBindings;
      });

      it('binds to compilation event', () => {
        expect(eventBinding.name).toBe('compilation');
      });

      describe('when called', () => {
        let chunkPluginEnvironment;
        let compilationEventBindings;
        let compilationEventBinding;
        let compilation;
        let callback;

        beforeEach(() => {
          chunkPluginEnvironment = new PluginEnvironment();
          compilation = chunkPluginEnvironment.getEnvironmentStub();
          compilation.assets = assets;
          compilation.errors = [];

          workerFarm.mockClear();
          workerFarm.end.mockClear();

          eventBinding.handler(compilation);
          compilationEventBindings = chunkPluginEnvironment.getEventBindings();
        });

        it('binds one event handler', () => {
          expect(compilationEventBindings.length).toBe(1);
        });

        describe('optimize-chunk-assets handler', () => {
          beforeEach(() => {
            [compilationEventBinding] = compilationEventBindings;
          });

          it('binds to optimize-chunk-assets event', () => {
            expect(compilationEventBinding.name).toEqual(
              'optimize-chunk-assets'
            );
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler([''], () => {
              callback();
              expect(callback.mock.calls.length).toBe(1);
              done();
            });
          });

          it('parallelization', (done) => {
            compilationEventBinding.handler(
              [
                {
                  files: ['test.js', 'test1.js', 'test2.js', 'test3.js'],
                },
              ],
              () => {
                expect(workerFarm.mock.calls.length).toBe(1);
                // Appveyor give only one core
                expect(workerFarm.mock.calls[0][0].maxConcurrentWorkers).toBe(
                  Math.min(Number(2) || 0, os.cpus().length - 1)
                );
                expect(workerFarmMock.mock.calls.length).toBe(4);
                expect(workerFarm.end.mock.calls.length).toBe(1);

                done();
              }
            );
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ parallel: true }).apply(compiler);

      return compile(compiler).then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('parallel `number`: errors');
        expect(warnings).toMatchSnapshot('parallel `number`: warnings');

        for (const file in stats.compilation.assets) {
          if (
            Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
          ) {
            expect(stats.compilation.assets[file].source()).toMatchSnapshot(
              `parallel \`number\`: asset ${file}`
            );
          }
        }
      });
    });
  });
});
