import utils from '../../src/utils';

describe('utils', () => {
  it('isSourceMap', () => {
    const rawSourceMap = {
      version: 3,
      file: 'min.js',
      names: ['bar', 'baz', 'n'],
      sources: ['one.js', 'two.js'],
      sourceRoot: 'http://example.com/www/js/',
      mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA',
    };

    expect(utils.isSourceMap(null)).toBe(false);
    expect(utils.isSourceMap()).toBe(false);
    expect(utils.isSourceMap({})).toBe(false);
    expect(utils.isSourceMap([])).toBe(false);
    expect(utils.isSourceMap('foo')).toBe(false);
    expect(utils.isSourceMap(rawSourceMap)).toBe(true);
  });
});
