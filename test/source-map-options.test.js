import UglifyJsPlugin from '../src/index';
import {
  PluginEnvironment,
  createCompiler,
  compile,
  cleanErrorStack,
} from './helpers';

describe('when options.sourceMap', () => {
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

  describe('true', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';
      compilerEnv.devtool = 'source-map';

      const plugin = new UglifyJsPlugin({
        sourceMap: true,
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

          eventBinding.handler(compilation);
          compilationEventBindings = chunkPluginEnvironment.getEventBindings();
        });

        it('binds two event handler', () => {
          expect(compilationEventBindings[0].name).toBe('build-module');
          expect(compilationEventBindings[1].name).toBe(
            'optimize-chunk-assets'
          );
        });

        describe('build-module handler', () => {
          beforeEach(() => {
            [compilationEventBinding] = compilationEventBindings;
          });

          it('binds to build-module event', () => {
            expect(compilationEventBinding.name).toEqual('build-module');
          });

          it('build-module handler', (done) => {
            const moduleArgs = { useSourceMap: false };
            const mockBuildModuleEvent = jest.fn(() =>
              compilationEventBinding.handler(moduleArgs)
            );

            mockBuildModuleEvent();

            expect(mockBuildModuleEvent.mock.calls.length).toBe(1);
            expect(moduleArgs.useSourceMap).toBe(true);
            done();
          });
        });

        describe('optimize-chunk-assets handler', () => {
          beforeEach(() => {
            [, compilationEventBinding] = compilationEventBindings;
          });

          it('binds to optimize-chunk-assets event', () => {
            expect(compilationEventBinding.name).toEqual(
              'optimize-chunk-assets'
            );
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler(
              [
                {
                  files: ['test.js', 'test1.js', 'test2.js', 'test3.js'],
                },
              ],
              () => {
                callback();
                expect(callback.mock.calls.length).toBe(1);
                done();
              }
            );
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ sourceMap: true }).apply(compiler);

      return compile(compiler).then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('source map: errors');
        expect(warnings).toMatchSnapshot('source map: warnings');

        for (const file in stats.compilation.assets) {
          if (
            Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
          ) {
            const asset = stats.compilation.assets[file].sourceAndMap();

            asset.map.sources = [];

            expect(asset.source).toMatchSnapshot(`source: asset ${file}`);
            expect(asset.map).toMatchSnapshot(`source map: asset ${file}`);
          }
        }
      });
    });
  });

  describe('true and options.parallel true', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        parallel: true,
        sourceMap: true,
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

          eventBinding.handler(compilation);
          compilationEventBindings = chunkPluginEnvironment.getEventBindings();
        });

        it('binds two event handler', () => {
          expect(compilationEventBindings[0].name).toBe('build-module');
          expect(compilationEventBindings[1].name).toBe(
            'optimize-chunk-assets'
          );
        });

        describe('build-module handler', () => {
          beforeEach(() => {
            [compilationEventBinding] = compilationEventBindings;
          });

          it('binds to build-module event', () => {
            expect(compilationEventBinding.name).toEqual('build-module');
          });

          it('build-module handler', (done) => {
            const moduleArgs = { useSourceMap: false };
            const mockBuildModuleEvent = jest.fn(() =>
              compilationEventBinding.handler(moduleArgs)
            );

            mockBuildModuleEvent();

            expect(mockBuildModuleEvent.mock.calls.length).toBe(1);
            expect(moduleArgs.useSourceMap).toBe(true);
            done();
          });
        });

        describe('optimize-chunk-assets handler', () => {
          beforeEach(() => {
            [, compilationEventBinding] = compilationEventBindings;
          });

          it('binds to optimize-chunk-assets event', () => {
            expect(compilationEventBinding.name).toEqual(
              'optimize-chunk-assets'
            );
          });

          it('only calls callback once', (done) => {
            callback = jest.fn();
            compilationEventBinding.handler(
              [
                {
                  files: ['test.js', 'test1.js', 'test2.js', 'test3.js'],
                },
              ],
              () => {
                callback();
                expect(callback.mock.calls.length).toBe(1);
                done();
              }
            );
          });
        });
      });
    });

    it('matches snapshot', () => {
      const compiler = createCompiler();
      new UglifyJsPlugin({ parallel: true, sourceMap: true }).apply(compiler);

      return compile(compiler).then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('source map and parallel: errors');
        expect(warnings).toMatchSnapshot('source map and parallel: warnings');

        for (const file in stats.compilation.assets) {
          if (
            Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
          ) {
            const asset = stats.compilation.assets[file].sourceAndMap();

            asset.map.sources = [];

            expect(asset.source).toMatchSnapshot(
              `source and parallel: asset ${file}`
            );
            expect(asset.map).toMatchSnapshot(
              `source map and parallel: asset ${file}`
            );
          }
        }
      });
    });
  });
});
