var foo = require('./dep');

function Foo() {
  var b = foo;
  var baz = 'baz' + Math.random();
  return function () {
    return {
      a: b + foo.bar + baz,
      b: b,
      baz: baz,
    };
  };
}

module.exports = Foo;
