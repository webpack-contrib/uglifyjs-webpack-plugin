/* eslint-disable
  no-new-func
*/
const toType = value => (Object.prototype.toString.call(value).slice(8, -1));
const TYPES = ['RegExp', 'Function'];

export const encode = (key, value) => {
  const type = toType(value);
  if (TYPES.indexOf(type) !== -1) {
    return `<${type}|${value.toString()}>`;
  }
  return value;
};

export const decode = (key, value) => {
  const type = toType(value);

  if (type === 'String') {
    const reg = /^<(\w+)\|([\w\W]*)>$/;
    const match = value.match(reg);
    if (match) {
      if (match[1] === 'Function') {
        return Function(`
          try {
            return (${match[2]}).apply(null, arguments);
          } catch(err) {
            if (err instanceof ReferenceError && ~err.message.indexOf('is not defined')) {
              throw new Error('If the option "${key}" is a function, and it relies on external var, may not work in multi-process mode after serialization: ' + err.message);
            } else {
              throw err;
            }
          }
        `);
      } else if (TYPES.indexOf(match[1]) !== -1) {
        return Function(`return ${match[2]}`)();
      }
    }
  }

  return value;
};

