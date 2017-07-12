import minify from './minify';
import { decode } from './serialization';

module.exports = (options, callback) => {
  try {
    const result = minify(JSON.parse(options, decode));
    callback(null, result);
  } catch (errors) {
    callback(errors);
  }
};
