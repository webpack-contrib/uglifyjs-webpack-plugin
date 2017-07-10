import minify from './minify';
import { decode } from './serialization';

module.exports = (options, callback) => {
  try {
    const result = minify(decode(options));
    callback(null, result);
  } catch (errors) {
    /* istanbul ignore next */
    callback(errors);
  }
};
