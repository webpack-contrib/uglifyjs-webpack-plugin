import findCacheDir from 'find-cache-dir';
import UglifyJsPlugin from '../src/index';
import cache from '../src/uglify/cache';
import {
  PluginEnvironment,
  createCompiler,
  compile,
  cleanErrorStack,
} from './helpers';

const cacheDir = findCacheDir({ name: 'uglifyjs-webpack-plugin' });

describe('when options.cache', () => {
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

    beforeAll(() => cache.clear(cacheDir));

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        cache: false,
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
          compilation.assets = Object.assign({}, assets);
          compilation.errors = [];

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
            expect(compilationEventBinding.name).toEqual('optimize-chunk-assets');
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler([''], () => {
              callback();
              expect(callback.mock.calls.length).toBe(1);
              done();
            });
          });

          it('cache files', (done) => {
            const files = ['test.js', 'test1.js', 'test2.js', 'test3.js'];

            cache.get = jest.fn(cache.get);
            cache.put = jest.fn(cache.put);

            compilationEventBinding.handler([{
              files,
            }], () => {
              // Cache disabled so we don't run `get` or `put`
              expect(cache.get.mock.calls.length).toBe(0);
              expect(cache.put.mock.calls.length).toBe(0);

              const cacheEntriesList = cache.list(cacheDir);
              const cacheEntriesListKeys = Object.keys(cacheEntriesList);

              expect(cacheEntriesListKeys.length).toBe(0);
              done();
            });
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ cache: true }).apply(compiler);

      return compile(compiler)
        .then((stats) => {
          const errors = stats.compilation.errors.map(cleanErrorStack);
          const warnings = stats.compilation.warnings.map(cleanErrorStack);

          expect(errors).toMatchSnapshot('cache `false`: errors');
          expect(warnings).toMatchSnapshot('cache `false`: warnings');

          for (const file in stats.compilation.assets) {
            if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
              expect(stats.compilation.assets[file].source()).toMatchSnapshot(`cache \`false\`: asset ${file}`);
            }
          }
        });
    });
  });

  describe('true', () => {
    let eventBindings;
    let eventBinding;

    beforeAll(() => cache.clear(cacheDir));

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        cache: true,
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
          compilation.assets = Object.assign({}, assets);
          compilation.errors = [];

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
            expect(compilationEventBinding.name).toEqual('optimize-chunk-assets');
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler([''], () => {
              callback();
              expect(callback.mock.calls.length).toBe(1);
              done();
            });
          });

          it('cache files', (done) => {
            const files = ['test.js', 'test1.js', 'test2.js', 'test3.js'];

            cache.get = jest.fn(cache.get);
            cache.put = jest.fn(cache.put);

            compilationEventBinding.handler([{
              files,
            }], () => {
              // Try to found cached files, but we don't have their in cache
              expect(cache.get.mock.calls.length).toBe(4);
              // Put files in cache
              expect(cache.put.mock.calls.length).toBe(4);

              const cacheEntriesList = cache.list(cacheDir);
              const cacheEntriesListKeys = Object.keys(cacheEntriesList);

              // Make sure that we cached files
              expect(cacheEntriesListKeys.length).toBe(files.length);
              cacheEntriesListKeys.forEach((cacheJSONEntry) => {
                const cacheEntry = JSON.parse(cacheJSONEntry);

                expect([cacheEntry.path, cacheEntry.input])
                  .toMatchSnapshot(`cache \`true\`: cached entry ${cacheEntry.path}`);
              });

              // Reset compilation assets and mocks
              compilation.assets = Object.assign({}, assets);
              compilation.errors = [];

              cache.get.mockClear();
              cache.put.mockClear();

              compilationEventBinding.handler([{
                files,
              }], () => {
                // Now we have cached files so we get their and don't put
                expect(cache.get.mock.calls.length).toBe(4);
                expect(cache.put.mock.calls.length).toBe(0);

                done();
              });
            });
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ cache: true }).apply(compiler);

      return compile(compiler)
        .then((stats) => {
          const errors = stats.compilation.errors.map(cleanErrorStack);
          const warnings = stats.compilation.warnings.map(cleanErrorStack);

          expect(errors).toMatchSnapshot('cache `true`: errors');
          expect(warnings).toMatchSnapshot('cache `true`: warnings');

          for (const file in stats.compilation.assets) {
            if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
              expect(stats.compilation.assets[file].source()).toMatchSnapshot(`cache \`true\`: asset ${file}`);
            }
          }
        });
    });
  });

  describe('string', () => {
    const othercacheDir = findCacheDir({ name: 'other-cache-directory' });
    let eventBindings;
    let eventBinding;

    beforeAll(() => cache.clear(othercacheDir));

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        cache: othercacheDir,
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
          compilation.assets = Object.assign({}, assets);
          compilation.errors = [];

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
            expect(compilationEventBinding.name).toEqual('optimize-chunk-assets');
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler([''], () => {
              callback();
              expect(callback.mock.calls.length).toBe(1);
              done();
            });
          });

          it('cache files', (done) => {
            const files = ['test.js', 'test1.js', 'test2.js', 'test3.js'];

            cache.get = jest.fn(cache.get);
            cache.put = jest.fn(cache.put);

            compilationEventBinding.handler([{
              files,
            }], () => {
              // Try to found cached files, but we don't have their in cache
              expect(cache.get.mock.calls.length).toBe(4);
              // Put files in cache
              expect(cache.put.mock.calls.length).toBe(4);

              const cacheEntriesList = cache.list(othercacheDir);
              const cacheEntriesListKeys = Object.keys(cacheEntriesList);

              // Make sure that we cached files
              expect(cacheEntriesListKeys.length).toBe(files.length);
              cacheEntriesListKeys.forEach((cacheJSONEntry) => {
                const cacheEntry = JSON.parse(cacheJSONEntry);

                expect([cacheEntry.path, cacheEntry.input])
                  .toMatchSnapshot(`cache \`string\`: cached entry ${cacheEntry.path}`);
              });

              // Reset compilation assets and mocks
              compilation.assets = Object.assign({}, assets);
              compilation.errors = [];

              cache.get.mockClear();
              cache.put.mockClear();

              compilationEventBinding.handler([{
                files,
              }], () => {
                // Now we have cached files so we get their and don't put
                expect(cache.get.mock.calls.length).toBe(4);
                expect(cache.put.mock.calls.length).toBe(0);

                done();
              });
            });
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ cache: othercacheDir }).apply(compiler);

      return compile(compiler)
        .then((stats) => {
          const errors = stats.compilation.errors.map(cleanErrorStack);
          const warnings = stats.compilation.warnings.map(cleanErrorStack);

          expect(errors).toMatchSnapshot('cache `string`: errors');
          expect(warnings).toMatchSnapshot('cache `string`: warnings');

          for (const file in stats.compilation.assets) {
            if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
              expect(stats.compilation.assets[file].source()).toMatchSnapshot(`cache \`string\`: asset ${file}`);
            }
          }
        });
    });
  });
});
