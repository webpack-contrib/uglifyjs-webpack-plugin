import { RawSource } from 'webpack-sources';
import UglifyJsPlugin from '../src/index';
import {
  PluginEnvironment,
  cleanErrorStack,
  createCompiler,
  compile,
} from './helpers';

describe('when applied with no options', () => {
  let eventBindings;
  let eventBinding;

  beforeEach(() => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin();
    plugin.apply(compilerEnv);
    eventBindings = pluginEnvironment.getEventBindings();
  });

  it('matches snapshot', () => {
    const compiler = createCompiler();
    new UglifyJsPlugin().apply(compiler);


    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
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

        it('only calls callback once', () => {
          callback = jest.fn();
          compilationEventBinding.handler([''], () => {
            callback();
            expect(callback.mock.calls.length).toBe(1);
          });
        });

        it('default only parses filenames ending with .js', () => {
          compilationEventBinding.handler([{
            files: ['test', 'test.js'],
          }], () => {
            expect(Object.keys(compilation.assets).length).toBe(4);
          });
        });

        it('early returns if private property is already set', () => {
          compilationEventBinding.handler([{
            files: ['test.js'],
          }], () => {
            expect(compilation.assets['test.js']).toEqual({});
          });
        });

        it('outputs stack trace errors for invalid asset', () => {
          compilationEventBinding.handler([{
            files: ['test1.js'],
          }], () => {
            expect(compilation.errors.length).toBe(1);
            expect(compilation.errors[0]).toBeInstanceOf(Error);
            expect(compilation.errors[0].message).toEqual(expect.stringContaining('TypeError'));
          });
        });

        it('outputs parsing errors for invalid javascript', () => {
          compilationEventBinding.handler([{
            files: ['test2.js'],
          }], () => {
            expect(compilation.errors.length).toBe(1);
            expect(compilation.errors[0]).toBeInstanceOf(Error);
            expect(compilation.errors[0].message).toEqual(expect.stringContaining('Unexpected token'));
            expect(compilation.errors[0].message).toEqual(expect.stringContaining('[test2.js:1,8]'));
          });
        });

        it('outputs no errors for valid javascript', () => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            expect(compilation.errors.length).toBe(0);
          });
        });

        it('outputs RawSource for valid javascript', () => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            expect(compilation.assets['test3.js']).toBeInstanceOf(RawSource);
          });
        });

        it('outputs mangled javascript', () => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            // eslint-disable-next-line no-underscore-dangle
            expect(compilation.assets['test3.js']._value)
              .not.toEqual(expect.stringContaining('longVariableName'));
          });
        });

        it('compresses and does not output beautified javascript', () => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            // eslint-disable-next-line no-underscore-dangle
            expect(compilation.assets['test3.js']._value).not.toEqual(expect.stringContaining('\n'));
          });
        });

        it('preserves comments', () => {
          compilationEventBinding.handler([{
            files: ['test3.js'],
          }], () => {
            // eslint-disable-next-line no-underscore-dangle
            expect(compilation.assets['test3.js']._value).toEqual(expect.stringContaining('/**'));
          });
        });
      });
    });
  });
});
