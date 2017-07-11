/* eslint-disable
  no-new-func
*/
const toType = value => (Object.prototype.toString.call(value).slice(8, -1));
const replace = (target, replacer, _defaults, _key) => {
  let object;
  const val = replacer(target, _key);
  const type = toType(val);

  if (type === 'Object') {
    object = Object.create(_defaults || {});
  } else if (type === 'Array') {
    object = [].concat(_defaults || []);
  } else {
    object = val;
  }

  if (type === 'Object' || type === 'Array') {
    for (const index in val) {
      if (Object.prototype.hasOwnProperty.call(val, index)) {
        object[index] = replace(val[index], replacer, object[index], index);
      }
    }
    return object;
  }

  return object;
};

export const encode = options => replace(options, (value) => {
  const type = toType(value);
  if (type === 'RegExp' || type === 'Function') {
    return `<${type}|${value.toString()}>`;
  }
  return value;
});

export const decode = options => replace(options, (value, key) => {
  const type = toType(value);

  if (type === 'String') {
    const reg = /^<(\w+)\|([\w\W]*)>$/;
    const match = value.match(reg);
    if (match) {
      if (match[1] === 'RegExp') {
        return Function(`return ${match[2]}`)();
      } else if (match[1] === 'Function') {
        // TODO Use ESlint to pre-check options
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
      }
    }
  }

  return value;
});

