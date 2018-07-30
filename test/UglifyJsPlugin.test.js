import { RawSource } from 'webpack-sources';
import UglifyJsPlugin from '../src/index';
import { cleanErrorStack, compile, createCompiler, PluginEnvironment } from './helpers';

describe('UglifyJsPlugin', () => {
  it('should exported as function', () => {
    expect(typeof new UglifyJsPlugin().apply).toBe('function');
  });

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
          compilation.warnings = [];
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

          it('empty asset', () => {
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
              expect(compilation.errors[0].message).toEqual(expect.stringContaining('asset.source is not a function'));
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
              expect(compilation.assets['test3.js']._value).not.toEqual(expect.stringContaining('longVariableName'));
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
  });

  it('should handle validation errors', () => {
    /* eslint-disable no-new */
    expect(() => {
      new UglifyJsPlugin({ test: /foo/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ test: [/foo/] });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ include: /foo/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ include: [/foo/] });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ exclude: /foo/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ exclude: [/foo/] });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ doesntExist: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ cache: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ cache: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ cache: 'path/to/cache/directory' });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ cache: {} });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ cacheKeys() {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: 2 });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ parallel: '2' });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ parallel: {} });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ sourceMap: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ sourceMap: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ sourceMap: 'true' });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ minify() {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: null });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 5,
          warnings: false,
          parse: {},
          compress: true,
          mangle: { inline: false },
          output: { comments: /^\**!|@preserve|@license|@cc_on/ },
          toplevel: false,
          nameCache: {},
          ie8: false,
          keep_classnames: false,
          keep_fnames: false,
          safari10: false,
        },
      });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ie8: false } });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ie8: true } });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ie8: 'false' } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { emca: 5 } });
    }).not.toThrow();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { emca: 8 } });
    }).not.toThrow();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 7.5 } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: true } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: '5' } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 3 } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 10 } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new UglifyJsPlugin({ extractComments: true });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ extractComments: false });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ extractComments: /comment/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ extractComments() {} });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ warningsFilter() {} });
    }).not.toThrow('Validation Error');
  });

  it('should contains error when uglify has unknown option', () => {
    const compiler = createCompiler();
    new UglifyJsPlugin({
      uglifyOptions: {
        output: {
          unknown: true,
        },
      },
    }).apply(compiler);

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

  it('isSourceMap method', () => {
    const rawSourceMap = {
      version: 3,
      file: 'min.js',
      names: ['bar', 'baz', 'n'],
      sources: ['one.js', 'two.js'],
      sourceRoot: 'http://example.com/www/js/',
      mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA',
    };
    const emptyRawSourceMap = {
      version: 3,
      sources: [],
      mappings: '',
    };

    expect(UglifyJsPlugin.isSourceMap(null)).toBe(false);
    expect(UglifyJsPlugin.isSourceMap()).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({})).toBe(false);
    expect(UglifyJsPlugin.isSourceMap([])).toBe(false);
    expect(UglifyJsPlugin.isSourceMap('foo')).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3 })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ sources: '' })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, sources: '' })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ sources: '', mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap({ version: 3, sources: '', mappings: [] })).toBe(false);
    expect(UglifyJsPlugin.isSourceMap(rawSourceMap)).toBe(true);
    expect(UglifyJsPlugin.isSourceMap(emptyRawSourceMap)).toBe(true);
  });
});
