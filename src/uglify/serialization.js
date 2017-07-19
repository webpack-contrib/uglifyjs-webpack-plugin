/* eslint-disable no-new-func */
const toType = value => (Object.prototype.toString.call(value).slice(8, -1));

export const encode = (key, value) => {
  const type = toType(value);
  if (encode[type]) {
    return `<${type}>${encode[type](value, key)}`;
  }
  return value;
};

encode.RegExp = value => String(value);
encode.Function = value => String(value);

export const decode = (key, value) => {
  if (typeof value === 'string') {
    const regex = /^<([A-Z]\w+)>([\w\W]*)$/;
    const match = value.match(regex);
    if (match && decode[match[1]]) {
      return decode[match[1]](match[2], key);
    }
  }

  return value;
};

decode.RegExp = value => (Function(`return ${value}`)());
decode.Function = (value, key) => Function(`
  try {
    return ${value}.apply(null, arguments);
  } catch(err) {
    throw new Error('the option "${key}" performs an error in the child process: ' + err.message);
  }
`);
