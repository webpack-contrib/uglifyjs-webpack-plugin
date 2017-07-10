import worker from '../../src/uglify/worker';

describe('matches snapshot', () => {
  it('normalizes when options.extractComments is regex', (done) => {
    const options = {
      file: 'test1.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: false,
        },
      },
      extractComments: /foo/,
    };
    worker(options, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      done();
    });
  });

  it('normalizes when uglifyOptions.output.comments is string: all', (done) => {
    const options = {
      file: 'test2.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: 'all',
        },
      },
    };
    worker(options, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      done();
    });
  });

  it('normalizes when uglifyOptions.output.comments is string: some', (done) => {
    const options = {
      file: 'test3.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: 'some',
        },
      },
    };
    worker(options, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      done();
    });
  });

  it('normalizes when uglifyOptions.extractComments is number', (done) => {
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
    worker(options, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      done();
    });
  });

  it('when applied with extract option set to a single file', (done) => {
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
    worker(options, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      done();
    });
  });

  it('when options.inputSourceMap', (done) => {
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
    worker(options, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot(options.file);
      done();
    });
  });
});
