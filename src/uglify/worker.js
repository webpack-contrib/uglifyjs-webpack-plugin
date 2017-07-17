import minify from './minify';
import { decode } from './serialization';

module.exports = (options, callback) => {
  let minifyOptions;
  try {
    minifyOptions = JSON.parse(options, decode);
  } catch (errors) {
    callback(new Error(`options serialization failed: ${errors.message}`));
    return;
  }
  try {
    const result = minify(minifyOptions);
    callback(null, result);
  } catch (errors) {
    callback(errors);
  }
};
