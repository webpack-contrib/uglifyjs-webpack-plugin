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
    const emptyRawSourceMap = {
      version: 3,
      sources: [],
      mappings: '',
    };

    expect(utils.isSourceMap(null)).toBe(false);
    expect(utils.isSourceMap()).toBe(false);
    expect(utils.isSourceMap({})).toBe(false);
    expect(utils.isSourceMap([])).toBe(false);
    expect(utils.isSourceMap('foo')).toBe(false);
    expect(utils.isSourceMap({ version: 3 })).toBe(false);
    expect(utils.isSourceMap({ sources: '' })).toBe(false);
    expect(utils.isSourceMap({ mappings: [] })).toBe(false);
    expect(utils.isSourceMap({ version: 3, sources: '' })).toBe(false);
    expect(utils.isSourceMap({ version: 3, mappings: [] })).toBe(false);
    expect(utils.isSourceMap({ sources: '', mappings: [] })).toBe(false);
    expect(utils.isSourceMap({ version: 3, sources: '', mappings: [] })).toBe(false);
    expect(utils.isSourceMap(rawSourceMap)).toBe(true);
    expect(utils.isSourceMap(emptyRawSourceMap)).toBe(true);
  });
});
