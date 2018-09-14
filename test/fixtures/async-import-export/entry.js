require.ensure([], function() {
  require('./async-dep');

  console.log('Good')
});

module.exports = "Awesome";
