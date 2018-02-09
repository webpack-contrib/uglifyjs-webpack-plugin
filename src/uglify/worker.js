import serializeError from 'serialize-error';
import minify from './minify';

module.exports = (options, callback) => {
  try {
    // 'use strict' => this === undefined (Clean Scope)
    // Safer for possible security issues, albeit not critical at all here
    // eslint-disable-next-line no-new-func, no-param-reassign
    options = new Function(`'use strict'\nreturn ${options}`)();

    const result = minify(options);

    // Communication channel employed by process.send() converts everything to JSON first.
    // So custom object types (like Errors) can't possibly work, since object types aren't represented in JSON.
    if (result.error) {
      result.error = serializeError(result.error);
    }

    callback(null, result);
  } catch (errors) {
    callback(errors);
  }
};
