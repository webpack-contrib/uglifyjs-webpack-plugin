import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import { RawSource } from 'webpack-sources';
import UglifyJsPlugin from '../src/index';
import {
  PluginEnvironment,
} from './helpers';

const cachePath = findCacheDir({ name: 'uglify-webpack-plugin.test' });

cacache.rm.all(cachePath);

describe('when options.parallel', () => {
  let eventBindings;
  let eventBinding;

  beforeEach(() => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      parallel: {
        cache: cachePath,
        workers: true,
      },
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
        compilation.assets = {
          'test.js': {},
          'test1.js': '',
          'test2.js': {
            source: () => 'invalid javascript',
          },
          'test3.js': {
            source: () => '/** @preserve Foo Bar */ function foo(longVariableName) { longVariableName = 1; }',
          },
        };
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

        it('default only parses filenames ending with .js', (done) => {
          compilationEventBinding.handler([{
            files: ['test', 'test.js'],
          }], () => {
            expect(Object.keys(compilation.assets).length).toBe(4);
            done();
          });
        });

        it('early returns if private property is already set', (done) => {
          compilationEventBinding.handler([{
            files: ['test.js'],
          }], () => {
            expect(compilation.assets['test.js']).toEqual({});
            done();
          });
        });

        it('outputs stack trace errors for invalid asset', (done) => {
          compilationEventBinding.handler([{
            files: ['test1.js'],
          }], () => {
            expect(compilation.errors.length).toBe(1);
            expect(compilation.errors[0]).toBeInstanceOf(Error);
            expect(compilation.errors[0].message).toEqual(expect.stringContaining('asset.source is not a function'));
            done();
          });
        });

        it('outputs parsing errors for invalid javascript', (done) => {
          compilationEventBinding.handler([{
            files: ['test2.js'],
          }], () => {
            expect(compilation.errors.length).toBe(1);
            expect(compilation.errors[0]).toBeInstanceOf(Error);
            expect(compilation.errors[0].message).toEqual(expect.stringContaining('Unexpected token'));
            expect(compilation.errors[0].message).toEqual(expect.stringContaining('[test2.js:1,8]'));
            done();
          });
        });

        it('outputs no errors for valid javascript', (done) => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            expect(compilation.errors.length).toBe(0);
            done();
          });
        });

        it('outputs RawSource for valid javascript', (done) => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            expect(compilation.assets['test3.js']).toBeInstanceOf(RawSource);
            done();
          });
        });

        it('outputs mangled javascript', (done) => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            // eslint-disable-next-line no-underscore-dangle
            expect(compilation.assets['test3.js']._value)
              .not.toEqual(expect.stringContaining('longVariableName'));
            done();
          });
        });

        it('compresses and does not output beautified javascript', (done) => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            // eslint-disable-next-line no-underscore-dangle
            expect(compilation.assets['test3.js']._value).not.toEqual(expect.stringContaining('\n'));
            done();
          });
        });

        it('preserves comments', (done) => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            // eslint-disable-next-line no-underscore-dangle
            expect(compilation.assets['test3.js']._value).toEqual(expect.stringContaining('/**'));
            done();
          });
        });
      });
    });
  });
});
