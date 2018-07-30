import UglifyJsPlugin from '../src/index';
import { PluginEnvironment } from './helpers';

describe('when options.extractComments', () => {
  it('normalizes extractConmments', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      uglifyOptions: {
        warnings: true,
        mangle: {
          properties: {
            builtins: true,
          },
        },
      },
      extractComments: true,
    });
    plugin.apply(compilerEnv);

    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();

    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => 'var foo = 1;',
      },
      'test1.js': {
        source: () => 'function foo(x) { if (x) { return bar(); not_called1(); } }',
        map: () => {
          return {
            version: 3,
            sources: ['test1.js'],
            names: ['foo', 'x', 'bar', 'not_called1'],
            mappings: 'AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC',
          };
        },
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      expect(compilation.errors.length).toBe(0);
    });
  });

  it('outputs warnings for unreachable code', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      uglifyOptions: {
        warnings: true,
        mangle: {
          properties: {
            builtins: true,
          },
        },
      },
      extractComments: true,
    });
    plugin.apply(compilerEnv);

    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();

    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => 'var foo = 1;',
      },
      'test1.js': {
        source: () => 'function foo(x) { if (x) { return bar(); not_called1(); } }',
        map: () => {
          return {
            version: 3,
            sources: ['test1.js'],
            names: ['foo', 'x', 'bar', 'not_called1'],
            mappings: 'AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC',
          };
        },
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      expect(compilation.warnings.length).toBe(1);
      expect(compilation.warnings[0]).toBeInstanceOf(Error);
      expect(compilation.warnings[0].message).toEqual(expect.stringContaining('Dropping unreachable code'));
    });
  });

  it('normalizes when options.extractComments is not specify', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin();
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '/*! Legal Comment */\nvar foo = 1;',
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      for (const file in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, file)) {
          expect(compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
      expect(compilation.errors).toMatchSnapshot('errors');
      expect(compilation.warnings).toMatchSnapshot('warnings');
    });
  });

  it('normalizes when options.extractComments is boolean - "true"', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      extractComments: true,
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '/*! Legal Comment */\nvar foo = 1;',
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      for (const file in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, file)) {
          expect(compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
      expect(compilation.errors).toMatchSnapshot('errors');
      expect(compilation.warnings).toMatchSnapshot('warnings');
    });
  });

  it('normalizes when options.extractComments is regex', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      extractComments: /foo/,
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '// foo\nvar foo = 1;',
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      for (const file in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, file)) {
          expect(compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
      expect(compilation.errors).toMatchSnapshot('errors');
      expect(compilation.warnings).toMatchSnapshot('warnings');
    });
  });

  it('normalizes when options.extractComments is string', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      extractComments: 'all',
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '/* Comment */\nvar foo = 1;',
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      for (const file in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, file)) {
          expect(compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
      expect(compilation.errors).toMatchSnapshot('errors');
      expect(compilation.warnings).toMatchSnapshot('warnings');
    });
  });

  it('normalizes when options.extractComments is function', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      extractComments: () => true,
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '/* Comment */\nvar foo = 1;',
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      for (const file in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, file)) {
          expect(compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
      expect(compilation.errors).toMatchSnapshot('errors');
      expect(compilation.warnings).toMatchSnapshot('warnings');
    });
  });

  it('normalizes when options.extractComments is object', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      extractComments: {
        condition: true,
        filename(file) {
          return file.replace(/(\.\w+)$/, '.license$1');
        },
        banner(licenseFile) {
          return `License information can be found in ${licenseFile}`;
        },
      },
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      for (const file in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, file)) {
          expect(compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
      expect(compilation.errors).toMatchSnapshot('errors');
      expect(compilation.warnings).toMatchSnapshot('warnings');
    });
  });

  it('normalizes when options.extractComments is string - "all" && license file should be relative source file', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      extractComments: 'all',
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'nested/test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'nested/nested/test1.js': {
        source: () => '/* Comment */\nvar foo = 1;',
      },
    };
    compilation.warnings = [];
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['nested/test.js', 'nested/nested/test1.js'],
    }], () => {
      for (const file in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, file)) {
          expect(compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
      expect(compilation.errors).toMatchSnapshot('errors');
      expect(compilation.warnings).toMatchSnapshot('warnings');
    });
  });

  describe('when applied with extract option set to a single file', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = '';

      const plugin = new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: 'all',
          },
        },
        extractComments: {
          condition: /.*/,
          filename: 'extracted-comments.js',
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

        beforeEach(() => {
          chunkPluginEnvironment = new PluginEnvironment();
          compilation = chunkPluginEnvironment.getEnvironmentStub();
          compilation.assets = {
            'test.js': {
              source: () => '/* This is a comment from test.js */ function foo(bar) { return bar; }',
            },
            'test2.js': {
              source: () => '// This is a comment from test2.js\nfunction foo2(bar) { return bar; }',
            },
            'test3.js': {
              source: () => '/* This is a comment from test3.js */ function foo3(bar) { return bar; }\n// This is another comment from test3.js\nfunction foobar3(baz) { return baz; }',
            },
          };
          compilation.errors = [];
          compilation.warnings = [];

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

          it('preserves comments', () => {
            compilationEventBinding.handler([{
              files: ['test.js', 'test2.js', 'test3.js'],
            }], () => {
              expect(compilation.assets['test.js'].source()).toEqual(expect.stringContaining('/*'));
              expect(compilation.assets['test2.js'].source()).toEqual(expect.stringContaining('//'));
              expect(compilation.assets['test3.js'].source()).toEqual(expect.stringContaining('/*'));
              expect(compilation.assets['test3.js'].source()).toEqual(expect.stringContaining('//'));
            });
          });

          it('extracts comments to specified file', () => {
            compilationEventBinding.handler([{
              files: ['test.js', 'test2.js', 'test3.js'],
            }], () => {
              expect(compilation.errors.length).toBe(0);
              expect(compilation.assets['extracted-comments.js'].source()).toEqual(expect.stringContaining('/* This is a comment from test.js */'));
              expect(compilation.assets['extracted-comments.js'].source()).toEqual(expect.stringContaining('// This is a comment from test2.js'));
              expect(compilation.assets['extracted-comments.js'].source()).toEqual(expect.stringContaining('/* This is a comment from test3.js */'));
              expect(compilation.assets['extracted-comments.js'].source()).toEqual(expect.stringContaining('// This is another comment from test3.js'));
              expect(compilation.assets['extracted-comments.js'].source()).not.toEqual(expect.stringContaining('function'));
            });
          });
        });
      });
    });
  });
});
