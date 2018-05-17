export default {
  uglify: require('terser/package.json').version, // eslint-disable-line global-require
  plugin: require('../../package.json').version, // eslint-disable-line global-require
};

