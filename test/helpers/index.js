/* eslint-disable
 * import/order,
 * import/no-extraneous-dependencies,
 * consistent-return,
 */
export function removeCWD(path) {
  return path.split(`${process.cwd()}/`).join('');
}

export function cleanErrorStack(err) {
  return exports
    .removeCWD(err.toString())
    .split('\n')
    .slice(0, 2)
    .join('\n');
}
