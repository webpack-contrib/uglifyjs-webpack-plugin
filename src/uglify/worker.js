import minify from './minify';
import { decode } from './serialization';

process.on('message', (options) => {
  try {
    const result = minify(decode(options));
    process.send([null, result]);
  } catch ({ name, message, stack }) {
    process.send([{ name, message, stack }]);
  }
});
