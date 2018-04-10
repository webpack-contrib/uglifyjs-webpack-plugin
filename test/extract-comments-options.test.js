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
});
