import minify from './minify';

module.exports = (options, callback) => {
  try {
    // 'use strict' => this === undefined (Clean Scope)
    // Safer for possible security issues, albeit not critical at all here
    // eslint-disable-next-line no-new-func, no-param-reassign
    options = new Function(`'use strict'\nreturn ${options}`)();

    const result = minify(options);

    callback(result.error, result);
  } catch (errors) {
    callback(errors);
  }
};
