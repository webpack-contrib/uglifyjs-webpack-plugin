import serialize from 'serialize-javascript';
import worker from '../../src/uglify/worker';

describe('matches snapshot', () => {
  it('normalizes when options.extractComments is regex', () => {
    const options = {
      file: 'test1.js',
      input: 'var foo = 1;/* hello */',
      extractComments: /foo/,
    };
    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
    });
  });

  it('normalizes when uglifyOptions.output.comments is string: all', () => {
    const options = {
      file: 'test2.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: 'all',
        },
      },
    };
    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
    });
  });

  it('normalizes when uglifyOptions.output.comments is string: some', () => {
    const options = {
      file: 'test3.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: 'some',
        },
      },
    };
    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
    });
  });

  it('normalizes when uglifyOptions.extractComments is number', () => {
    const options = {
      file: 'test4.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: 'some',
        },
      },
      extractComments: 1,
    };
    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
    });
  });

  it('when applied with extract option set to a single file', () => {
    const options = {
      file: 'test5.js',
      input: '/******/ function hello(a) {console.log(a)}',
      uglifyOptions: {
        output: {
          comments: 'all',
        },
      },
      extractComments: {
        condition: 'should be extracted',
        filename(file) {
          return file.replace(/(\.\w+)$/, '.license$1');
        },
        banner(licenseFile) {
          return `License information can be found in ${licenseFile}`;
        },
      },
    };
    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
    });
  });

  it('when options.inputSourceMap', () => {
    const options = {
      file: 'test6.js',
      input: 'function foo(x) { if (x) { return bar(); not_called1(); } }',
      inputSourceMap: {
        version: 3,
        sources: ['test1.js'],
        names: ['foo', 'x', 'bar', 'not_called1'],
        mappings: 'AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC',
      },
    };
    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
    });
  });

  it('when uglifyOptions.keep_fnames is enabled', () => {
    const options = {
      file: 'test7.js',
      input: 'function foo(){ return function bar() { return a; }(); }',
      uglifyOptions: {
        keep_fnames: true,
      },
    };

    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      expect(data.code).toEqual(expect.stringContaining('bar'));
    });
  });

  it('when uglifyOptions.keep_classnames is enabled', () => {
    const options = {
      file: 'test8.js',
      input: 'function foo(){ return class Component { }; }',
      uglifyOptions: {
        keep_classnames: true,
      },
    };

    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      expect(data.code).toEqual(expect.stringContaining('Component'));
    });
  });

  it('when uglifyOptions.safari10 is enabled', () => {
    const options = {
      file: 'test9.js',
      input: 'function f(o) { for (let n of a) { console.log(n); } }',
      uglifyOptions: {
        safari10: true,
      },
    };

    worker(serialize(options), (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
    });
  });
});
