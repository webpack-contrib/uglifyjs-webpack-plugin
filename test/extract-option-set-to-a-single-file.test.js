import UglifyJsPlugin from '../src/index';
import { PluginEnvironment } from './helpers';

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
