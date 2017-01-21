module.exports = {
  "extends": "airbnb",
  "env": {
    "browser": true,
    "node": true,
    "mocha": true
  },
  "rules": {
    "prefer-arrow-callback": 0, // mocha tests (recommendation)
    "func-names": 0, // mocha tests (recommendation)
    "comma-dangle": ["error", "never"], // personal preference
    "no-param-reassign": 0, // the plugin needs this (webpack design :( )
    "no-use-before-define": 0, // personal preference
    "no-underscore-dangle": 0, // code relies on this
    "no-console": 0 // allow logging
  }
};
