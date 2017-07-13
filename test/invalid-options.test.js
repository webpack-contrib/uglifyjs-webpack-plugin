import UglifyJsPlugin from '../src/index';
import {
  PluginEnvironment,
  cleanErrorStack,
  createCompiler,
  compile,
} from './helpers';

describe('when applied with invalid options', () => {
  it('matches snapshot', () => {
    const compiler = createCompiler();
    new UglifyJsPlugin({
      uglifyOptions: {
        output: {
          'invalid-option': true,
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

  it('throws validation errors', () => {
    /* eslint-disable no-new */
    expect(() => {
      new UglifyJsPlugin({ test: /foo/ });
    }).not.toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: null });
    }).toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ doesntExist: true });
    }).toThrow('Validation Error');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { emca: 5 } });
    }).not.toThrow();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { emca: 8 } });
    }).not.toThrow();

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: true } });
    }).toThrow('should be integer');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 3 } });
    }).toThrow('should be >= 5');

    expect(() => {
      new UglifyJsPlugin({ uglifyOptions: { ecma: 10 } });
    }).toThrow('should be <= 8');
  });

  it('outputs uglify errors', () => {
    const pluginEnvironment = new PluginEnvironment();
    const compilerEnv = pluginEnvironment.getEnvironmentStub();
    compilerEnv.context = '';

    const plugin = new UglifyJsPlugin({
      uglifyOptions: {
        output: {
          'invalid-option': true,
        },
      },
    });
    plugin.apply(compilerEnv);
    const [eventBinding] = pluginEnvironment.getEventBindings();

    const chunkPluginEnvironment = new PluginEnvironment();
    const compilation = chunkPluginEnvironment.getEnvironmentStub();
    compilation.assets = {
      'test.js': {
        source: () => 'var foo = 1;',
      },
    };
    compilation.errors = [];

    eventBinding.handler(compilation);
    const [compilationEventBinding] = chunkPluginEnvironment.getEventBindings();

    compilationEventBinding.handler([{
      files: ['test.js'],
    }], () => {
      expect(compilation.errors.length).toBe(1);
      expect(compilation.errors[0]).toBeInstanceOf(Error);
      expect(compilation.errors[0].message).toEqual(expect.stringContaining('from UglifyJs'));
    });
  });
});
