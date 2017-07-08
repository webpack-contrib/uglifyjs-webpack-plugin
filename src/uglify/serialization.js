const toType = value => (Object.prototype.toString.call(value).slice(8, -1));
const replace = (target, replacer, _defaults, _key) => {
  let object;
  const type = toType(target);

  if (type === 'Object') {
    object = Object.create(_defaults || {});
  } else if (type === 'Array') {
    object = [].concat(_defaults || []);
  } else {
    object = replacer(target, _key);
  }

  if (type === 'Object' || type === 'Array') {
    for (const index in target) {
      if (Object.prototype.hasOwnProperty.call(target, index)) {
        object[index] = replace(target[index], replacer, object[index], index);
      }
    }
    return object;
  }

  return object;
};

export const encode = options => (replace(options, (value) => {
  const type = toType(value);
  if (type === 'RegExp' || type === 'Function') {
    return `<${type}|${value.toString()}>`;
  }
  return value;
}));

export const decode = options => (replace(options, (value) => {
  const type = toType(value);
  if (type === 'String') {
    const reg = /^<(\w+)\|([\w\W]*)>$/;
    const match = value.match(reg);
    if (match) {
      if (match[1] === 'RegExp' || match[1] === 'Function') {
        return Function(`return ${match[2]}`)(); // eslint-disable-line no-new-func
      }
    }
  }
  return value;
}));
