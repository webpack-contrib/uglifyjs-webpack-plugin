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
      compress: {
        warnings: true,
      },
      comments: false,
      extractComments: 1,
      mangle: {
        props: {
          builtins: true,
        },
      },
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

  it('normalizes extractConmments', () => {
    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      expect(compilation.errors.length).toBe(0);
    });
  });

  it('outputs warnings for unreachable code', () => {
    compilationEventBinding.handler([{
      files: ['test.js', 'test1.js'],
    }], () => {
      expect(compilation.warnings.length).toBe(1);
      expect(compilation.warnings[0]).toBeInstanceOf(Error);
      expect(compilation.warnings[0].message).toEqual(expect.stringContaining('Dropping unreachable code'));
    });
  });

  it('normalizes when options.extractComments is regex', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      comments: false,
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
    });
  });

  describe('converts boolean options.extractComments.condition to function', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      comments: false,
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
    let [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();
    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      expect(compilation2.errors.length).toBe(0);
    });
  });
});
