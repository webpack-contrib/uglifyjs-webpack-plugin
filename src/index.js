/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

import { SourceMapConsumer } from 'source-map';
import { SourceMapSource, RawSource, ConcatSource } from 'webpack-sources';
import RequestShortener from 'webpack/lib/RequestShortener';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';
import uglify from 'uglify-es';

const defaultUglifyOptions = {
  output: {
    comments: /^\**!|@preserve|@license|@cc_on/,
    beautify: false,
    semicolons: true,
    shebang: true,
  },
};

class UglifyJsPlugin {
  constructor(options) {
    if (typeof options !== 'object' || Array.isArray(options)) {
      this.options = {};
    } else {
      this.options = options || {};
    }

    this.options.test = this.options.test || /\.js($|\?)/i;
    this.options.warningsFilter = this.options.warningsFilter || (() => true);

    this.uglifyOptions = this.options.uglifyOptions || {};
  }

  static buildDefaultUglifyOptions({ ecma, warnings, parse, compress, mangle, output, toplevel, ie8 }) {
    return {
      ecma,
      warnings,
      parse: parse || {},
      compress: compress || {},
      // eslint-disable-next-line no-undefined
      mangle: mangle === undefined || mangle === null ? true : mangle,
      // Ignoring sourcemap from options
      sourceMap: null,
      output: { ...defaultUglifyOptions.output, ...output },
      toplevel,
      ie8,
    };
  }

  static buildError(err, file, sourceMap, requestShortener) {
    // Handling error which should have line, col, filename and message
    if (err.line) {
      const original = sourceMap && sourceMap.originalPositionFor({
        line: err.line,
        column: err.col,
      });
      if (original && original.source) {
        return new Error(`${file} from UglifyJs\n${err.message} [${requestShortener.shorten(original.source)}:${original.line},${original.column}][${file}:${err.line},${err.col}]`);
      }
      return new Error(`${file} from UglifyJs\n${err.message} [${file}:${err.line},${err.col}]`);
    } else if (err.msg) {
      return new Error(`${file} from UglifyJs\n${err.msg}`);
    }
    return new Error(`${file} from UglifyJs\n${err.stack}`);
  }

  static buildWarnings(warnings, file, sourceMap, warningsFilter, requestShortener) {
    return warnings.reduce((accWarnings, warning) => {
      if (!sourceMap) {
        accWarnings.push(warning);
      } else {
        const match = /\[.+:([0-9]+),([0-9]+)\]/.exec(warning);
        const line = +match[1];
        const column = +match[2];
        const original = sourceMap.originalPositionFor({
          line,
          column,
        });

        if (original && original.source && original.source !== file && warningsFilter(original.source)) {
          accWarnings.push(`${warning.replace(/\[.+:([0-9]+),([0-9]+)\]/, '')}[${requestShortener.shorten(original.source)}:${original.line},${original.column}]`);
        }
      }
      return accWarnings;
    }, []);
  }

  static buildCommentsFunction(options, uglifyOptions, extractedComments) {
    const condition = {};
    const commentsOpts = uglifyOptions.output.comments;
    if (typeof options.extractComments === 'string' || options.extractComments instanceof RegExp) {
      // extractComments specifies the extract condition and commentsOpts specifies the preserve condition
      condition.preserve = commentsOpts;
      condition.extract = options.extractComments;
    } else if (Object.prototype.hasOwnProperty.call(options.extractComments, 'condition')) {
      // Extract condition is given in extractComments.condition
      condition.preserve = commentsOpts;
      condition.extract = options.extractComments.condition;
    } else {
      // No extract condition is given. Extract comments that match commentsOpts instead of preserving them
      condition.preserve = false;
      condition.extract = commentsOpts;
    }

    // Ensure that both conditions are functions
    ['preserve', 'extract'].forEach((key) => {
      let regexStr;
      let regex;
      switch (typeof (condition[key])) {
        case 'boolean':
          condition[key] = condition[key] ? () => true : () => false;
          break;
        case 'function':
          break;
        case 'string':
          if (condition[key] === 'all') {
            condition[key] = () => true;
            break;
          }
          if (condition[key] === 'some') {
            condition[key] = (astNode, comment) => comment.type === 'comment2' && /@preserve|@license|@cc_on/i.test(comment.value);
            break;
          }
          regexStr = condition[key];
          condition[key] = (astNode, comment) => new RegExp(regexStr).test(comment.value);
          break;
        default:
          regex = condition[key];
          condition[key] = (astNode, comment) => (regex.test(comment.value));
      }
    });

    // Redefine the comments function to extract and preserve
    // comments according to the two conditions
    return (astNode, comment) => {
      if (condition.extract(astNode, comment)) {
        extractedComments.push(
          comment.type === 'comment2' ? `/*${comment.value}*/` : `//${comment.value}`,
        );
      }
      return condition.preserve(astNode, comment);
    };
  }

  apply(compiler) {
    const requestShortener = new RequestShortener(compiler.context);
    compiler.plugin('compilation', (compilationArg) => {
      const compilation = compilationArg;

      if (this.options.sourceMap) {
        compilation.plugin('build-module', (moduleArg) => {
          // to get detailed location info about errors
          const moduleVar = moduleArg;
          moduleVar.useSourceMap = true;
        });
      }

      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        const uglifiedAssets = new WeakSet();
        chunks.reduce((acc, chunk) => acc.concat(chunk.files || []), [])
          .concat(compilation.additionalChunkAssets || [])
          .filter(ModuleFilenameHelpers.matchObject.bind(null, this.options))
          .forEach((file) => {
            // Copy uglify options
            const uglifyOptions = UglifyJsPlugin.buildDefaultUglifyOptions(this.uglifyOptions);
            let sourceMap;
            const asset = compilation.assets[file];
            if (uglifiedAssets.has(asset)) {
              return;
            }

            try {
              let input;
              let inputSourceMap;
              if (this.options.sourceMap) {
                if (asset.sourceAndMap) {
                  const sourceAndMap = asset.sourceAndMap();
                  inputSourceMap = sourceAndMap.map;
                  input = sourceAndMap.source;
                } else {
                  inputSourceMap = asset.map();
                  input = asset.source();
                }
                sourceMap = new SourceMapConsumer(inputSourceMap);
                // Add source map data
                uglifyOptions.sourceMap = {
                  content: inputSourceMap,
                };
              } else {
                input = asset.source();
              }

              // Handling comment extraction
              const extractedComments = [];
              let commentsFile = false;
              if (this.options.extractComments) {
                uglifyOptions.output = uglifyOptions.output || {};
                uglifyOptions.output.comments = UglifyJsPlugin.buildCommentsFunction(this.options, uglifyOptions, extractedComments);

                commentsFile = this.options.extractComments.filename || `${file}.LICENSE`;
                if (typeof commentsFile === 'function') {
                  commentsFile = commentsFile(file);
                }
              }

              // Calling uglify
              const { error, map, code, warnings } = uglify.minify({ [file]: input }, uglifyOptions);

              // Handling results
              if (error) {
                throw error;
              }

              let outputSource;
              if (map) {
                outputSource = new SourceMapSource(code, file, JSON.parse(map), input, inputSourceMap);
              } else {
                outputSource = new RawSource(code);
              }

              // Write extracted comments to commentsFile
              if (commentsFile && extractedComments.length > 0) {
                // Add a banner to the original file
                if (this.options.extractComments.banner !== false) {
                  let banner = this.options.extractComments.banner || `For license information please see ${commentsFile}`;
                  if (typeof banner === 'function') {
                    banner = banner(commentsFile);
                  }
                  if (banner) {
                    outputSource = new ConcatSource(
                      `/*! ${banner} */\n`, outputSource,
                    );
                  }
                }

                const commentsSource = new RawSource(`${extractedComments.join('\n\n')}\n`);
                if (commentsFile in compilation.assets) {
                  // commentsFile already exists, append new comments...
                  if (compilation.assets[commentsFile] instanceof ConcatSource) {
                    compilation.assets[commentsFile].add('\n');
                    compilation.assets[commentsFile].add(commentsSource);
                  } else {
                    compilation.assets[commentsFile] = new ConcatSource(
                      compilation.assets[commentsFile], '\n', commentsSource,
                    );
                  }
                } else {
                  compilation.assets[commentsFile] = commentsSource;
                }
              }

              // Updating assets
              uglifiedAssets.add(compilation.assets[file] = outputSource);

              // Handling warnings
              if (warnings) {
                const warnArr = UglifyJsPlugin.buildWarnings(warnings, file, sourceMap, this.options.warningsFilter, requestShortener);
                if (warnArr.length > 0) {
                  compilation.warnings.push(new Error(`${file} from UglifyJs\n${warnArr.join('\n')}`));
                }
              }
            } catch (error) {
              compilation.errors.push(UglifyJsPlugin.buildError(error, file, sourceMap, compilation, requestShortener));
            }
          });
        callback();
      });
    });
  }
}

export default UglifyJsPlugin;
