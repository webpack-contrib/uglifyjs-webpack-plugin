import worker from '../../src/uglify/worker';

describe('run worker', () => {
  it('normalizes when options.extractComments is regex', (done) => {
    worker({
      file: 'test1.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: false,
        },
      },
      extractComments: /foo/,
    }, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot('test.js');
      done();
    });
  });

  it('normalizes when uglifyOptions.output.comments is string: all', (done) => {
    worker({
      file: 'test2.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: 'all',
        },
      },
      extractComments: /foo/,
    }, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot('test.js');
      done();
    });
  });

  it('normalizes when uglifyOptions.output.comments is string: some', (done) => {
    worker({
      file: 'test3.js',
      input: 'var foo = 1;/* hello */',
      uglifyOptions: {
        output: {
          comments: 'some',
        },
      },
      extractComments: /foo/,
    }, (error, data) => {
      if (error) {
        throw error;
      }
      expect(data).toMatchSnapshot('test.js');
      done();
    });
  });

  it('when applied with extract option set to a single file', (done) => {
    const options = {
      file: 'test4.js',
      input: '/******/ function hello(a) {console.log(a)}',
      uglifyOptions: {
        output: {
          comments: 'all',
        },
      },
      extractComments: {
        condition: /.*/,
        filename: 'extracted-comments.js',
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
      file: 'test5.js',
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
