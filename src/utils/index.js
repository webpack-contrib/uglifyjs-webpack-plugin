function isSourceMap(input) {
  // All required options for `new SourceMapConsumer(...options)`
  // https://github.com/mozilla/source-map#new-sourcemapconsumerrawsourcemap
  return Boolean(input &&
    input.version &&
    input.sources &&
    input.names &&
    input.mappings);
}

export default {
  isSourceMap,
};
