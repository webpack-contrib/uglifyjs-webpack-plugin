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

    compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => 'var foo = 1;',
      },
      'test1.js': {
        source: () =>
          'function foo(x) { if (x) { return bar(); not_called1(); } }',
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
    compilationEventBinding.handler(
      [
        {
          files: ['test.js'],
        },
      ],
      () => {
        expect(compilation.errors.length).toBe(0);
      }
    );
  });

  it('outputs warnings for unreachable code', () => {
    compilationEventBinding.handler(
      [
        {
          files: ['test.js', 'test1.js'],
        },
      ],
      () => {
        expect(compilation.warnings.length).toBe(1);
        expect(compilation.warnings[0]).toBeInstanceOf(Error);
        expect(compilation.warnings[0].message).toEqual(
          expect.stringContaining('Dropping unreachable code')
        );
      }
    );
  });

  it('normalizes when options.extractComments is boolean', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      extractComments: true,
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();
    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation2 = chunkPluginEnvironment.getEnvironmentStub();
    compilation2.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '/* Comment */\nvar foo = 1;',
      },
    };
    compilation2.warnings = [];
    compilation2.errors = [];

    eventBinding.handler(compilation2);
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler(
      [
        {
          files: ['test.js', 'test1.js'],
        },
      ],
      () => {
        expect(compilation2.assets['test.js'].source()).toMatchSnapshot(
          'test.js'
        );
        expect(compilation2.assets['test1.js'].source()).toMatchSnapshot(
          'test1.js'
        );
        expect(
          compilation2.assets['test1.js.LICENSE'].source()
        ).toMatchSnapshot('test1.js.LICENSE');
        expect(compilation2.errors).toMatchSnapshot('errors');
        expect(compilation2.warnings).toMatchSnapshot('warnings');
      }
    );
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
    const compilation2 = chunkPluginEnvironment.getEnvironmentStub();
    compilation2.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '// foo\nvar foo = 1;',
      },
    };
    compilation2.warnings = [];
    compilation2.errors = [];

    eventBinding.handler(compilation2);
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler(
      [
        {
          files: ['test.js', 'test1.js'],
        },
      ],
      () => {
        expect(compilation2.assets['test.js'].source()).toMatchSnapshot(
          'test.js'
        );
        expect(compilation2.assets['test1.js'].source()).toMatchSnapshot(
          'test1.js'
        );
        expect(
          compilation2.assets['test1.js.LICENSE'].source()
        ).toMatchSnapshot('test1.js.LICENSE');
        expect(compilation2.errors).toMatchSnapshot('errors');
        expect(compilation2.warnings).toMatchSnapshot('warnings');
      }
    );
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
    const compilation2 = chunkPluginEnvironment.getEnvironmentStub();
    compilation2.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '/* Comment */\nvar foo = 1;',
      },
    };
    compilation2.warnings = [];
    compilation2.errors = [];

    eventBinding.handler(compilation2);
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler(
      [
        {
          files: ['test.js', 'test1.js'],
        },
      ],
      () => {
        expect(compilation2.assets['test.js'].source()).toMatchSnapshot(
          'test.js'
        );
        expect(compilation2.assets['test.js.LICENSE'].source()).toMatchSnapshot(
          'test.js.LICENSE'
        );
        expect(compilation2.assets['test1.js'].source()).toMatchSnapshot(
          'test1.js'
        );
        expect(
          compilation2.assets['test1.js.LICENSE'].source()
        ).toMatchSnapshot('test1.js.LICENSE');
        expect(compilation2.errors).toMatchSnapshot('errors');
        expect(compilation2.warnings).toMatchSnapshot('warnings');
      }
    );
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
    const compilation2 = chunkPluginEnvironment.getEnvironmentStub();
    compilation2.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
      'test1.js': {
        source: () => '/* Comment */\nvar foo = 1;',
      },
    };
    compilation2.warnings = [];
    compilation2.errors = [];

    eventBinding.handler(compilation2);
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler(
      [
        {
          files: ['test.js', 'test1.js'],
        },
      ],
      () => {
        expect(compilation2.assets['test.js'].source()).toMatchSnapshot(
          'test.js'
        );
        expect(compilation2.assets['test1.js'].source()).toMatchSnapshot(
          'test.js'
        );
        expect(compilation2.assets['test.js.LICENSE'].source()).toMatchSnapshot(
          'test.js.LICENSE'
        );
        expect(
          compilation2.assets['test1.js.LICENSE'].source()
        ).toMatchSnapshot('test1.js.LICENSE');
        expect(compilation2.errors).toMatchSnapshot('errors');
        expect(compilation2.warnings).toMatchSnapshot('warnings');
      }
    );
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
    const compilation2 = chunkPluginEnvironment.getEnvironmentStub();
    compilation2.assets = {
      'test.js': {
        source: () => '// Comment\nvar foo = 1;',
      },
    };
    compilation2.warnings = [];
    compilation2.errors = [];

    eventBinding.handler(compilation2);
    [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler(
      [
        {
          files: ['test.js'],
        },
      ],
      () => {
        expect(compilation2.assets['test.js'].source()).toMatchSnapshot(
          'test.js'
        );
        expect(compilation2.assets['test.license.js'].source()).toMatchSnapshot(
          'test.license.js'
        );
        expect(compilation2.errors).toMatchSnapshot('errors');
        expect(compilation2.warnings).toMatchSnapshot('warnings');
      }
    );
  });
});
