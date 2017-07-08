import UglifyJsPlugin from '../src/index';
import { PluginEnvironment } from './helpers';

describe('when options.extractComments', () => {
  let compilation;
  let compilationEventBinding;

  beforeEach(() => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      cache: false,
      uglifyOptions: {
        warnings: true,
        output: {
          comments: false,
        },
        mangle: {
          properties: {
            builtins: true,
          },
        },
      },
      extractComments: 1,
    });
    plugin.apply(compilerEnv);

    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();

    compilation = chunkPluginEnvironment.getEnvironmentStub();
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
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();
  });

  it('normalizes extractConmments', (done) => {
    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      expect(compilation.errors.length).toBe(0);
      done();
    });
  });

  it('outputs warnings for unreachable code', (done) => {
    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      expect(compilation.warnings.length).toBe(1);
      expect(compilation.warnings[0]).toBeInstanceOf(Error);
      expect(compilation.warnings[0].message).toEqual(expect.stringContaining('Dropping unreachable code'));
      done();
    });
  });

  it('normalizes when options.extractComments is regex', (done) => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      cache: false,
      uglifyOptions: {
        output: {
          comments: false,
        },
      },
      extractComments: /foo/,
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation2 = chunkPluginEnvironment.getEnvironmentStub();
    compilation2.assets = {
      'test.js': {
        source: () => 'var foo = 1;',
      },
    };
    compilation2.errors = [];

    eventBinding.handler(compilation2);
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      expect(compilation2.errors.length).toBe(0);
      done();
    });
  });

  it('converts boolean options.extractComments.condition to function', (done) => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      cache: false,
      uglifyOptions: {
        output: {
          comments: false,
        },
      },
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
    const compilation2 = chunkPluginEnvironment.getEnvironmentStub();
    compilation2.assets = {
      'test.js': {
        source: () => 'var foo = 1;',
      },
    };
    compilation2.errors = [];

    eventBinding.handler(compilation2);
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      expect(compilation2.errors.length).toBe(0);
      done();
    });
  });
});
