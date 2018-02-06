export default {
  uglify: require('uglify-es/package.json').version, // eslint-disable-line global-require
  plugin: require('../../package.json').version, // eslint-disable-line global-require
  sourceMap: require('source-map/package.json').version, // eslint-disable-line global-require
};

