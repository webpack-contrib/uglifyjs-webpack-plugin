/* eslint-disable
  no-new-func
*/
import espree from 'espree';
import { Linter } from 'eslint';

const toType = value => (Object.prototype.toString.call(value).slice(8, -1));
const formatMessage = ({ source, line, message }) => {
  const lines = source.split(/\n/);
  const start = Math.max(line - 3, 0);
  const end = Math.min(lines.length, line + 3);

  // Error context
  const context = lines.slice(start, end).map((code, index) => {
    const number = index + start + 1;
    const left = number === line ? ' >> ' : '    ';
    return `${left}${number}| ${code}`;
  }).join('\n');

  // Alter exception message
  return `${message}\n${context}`;
};

const linter = new Linter();

linter.defineRule('no-this', {
  create(context) {
    return {
      ThisExpression(node) {
        context.report({
          node,
          message: 'Unallowed use of `this`',
        });
      },
    };
  },
  meta: {
    docs: {
      description: 'Forbid the use of `this`.',
      recommended: 'error',
    },
  },
});


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
    const reg = /^<(\w+)>([\w\W]*)$/;
    const match = value.match(reg);
    if (match && decode[match[1]]) {
      return decode[match[1]](match[2], key);
    }
  }

  return value;
};

decode.RegExp = (value, key) => {
  decode.RegExp.validate(value, key);
  return Function(`return ${value}`)();
};
decode.RegExp.validate = (value, key) => {
  const ast = espree.parse(`(${value})`);

  if (ast.body[0].expression.type !== 'Literal' && !ast.body[0].expression.regex) {
    throw new Error(`"${key}" is not a regexp`);
  }
};

decode.Function = (value, key) => {
  decode.Function.validate(value, key);
  return Function(`return ${value}`)();
};
decode.Function.validate = (source, name) => {
  let ast;
  const parserOptions = {
    sourceType: 'module',
  };

  try {
    ast = espree.parse(`(${source})`, parserOptions);
  } catch (err) {
    throw new Error(`"${name}" parse failed: ${err.message}`);
  }
  if (ast.body[0].expression.type !== 'FunctionExpression' && ast.body[0].expression.type !== 'ArrowFunctionExpression') {
    throw new Error(`"${name}" is not a function`);
  }

  const messages = linter.verify(`(${source})`, {
    parserOptions,
    rules: {
      'no-undef': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-this': 'error',
    },
  }, {
    allowInlineConfig: false,
  });

  if (messages.length) {
    const [errors] = messages;
    const { line, message } = errors;
    throw new Error(`"${name}" parse failed: ${formatMessage({
      source,
      line,
      message,
    })}`);
  }
};
