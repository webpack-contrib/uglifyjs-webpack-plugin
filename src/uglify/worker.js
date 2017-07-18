import minify from './minify';
import { decode } from './serialization';

module.exports = (options, callback) => {
  try {
    callback(null, minify(JSON.parse(options, decode)));
  } catch (errors) {
    callback(errors);
  }
};
