import uglifyEsPackageJson from 'uglify-es/package.json';
import { dependencies } from '../package-lock.json';

describe('uglify-es', () => {
  const { version, integrity } = dependencies['uglify-es'];

  it('matches version in package-lock.json', () => {
    expect(uglifyEsPackageJson.version).toEqual(version);
  });

  it('matches integrity in package-lock.json', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(uglifyEsPackageJson._integrity).toEqual(integrity);
  });

  it('matches version snapshot', () => {
    expect(uglifyEsPackageJson.version).toMatchSnapshot();
  });

  it('matches integrity snapshot', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(uglifyEsPackageJson._integrity).toMatchSnapshot();
  });
});
