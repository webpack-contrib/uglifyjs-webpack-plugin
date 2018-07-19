/* eslint-disable
  no-param-reassign
*/
import crypto from 'crypto';
import path from 'path';
import { SourceMapConsumer } from 'source-map';
import { SourceMapSource, RawSource, ConcatSource } from 'webpack-sources';
import RequestShortener from 'webpack/lib/RequestShortener';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';
import validateOptions from 'schema-utils';
import schema from './options.json';
import Runner from './uglify/Runner';
import versions from './uglify/versions';
import utils from './utils';

const warningRegex = /\[.+:([0-9]+),([0-9]+)\]/;

class UglifyJsPlugin {
  constructor(options = {}) {
    validateOptions(schema, options, 'UglifyJs Plugin');

    const {
      minify,
      uglifyOptions = {},
      test = /\.js(\?.*)?$/i,
      warningsFilter = () => true,
      extractComments = false,
      sourceMap = false,
      cache = false,
      cacheKeys = defaultCacheKeys => defaultCacheKeys,
      parallel = false,
      include,
      exclude,
    } = options;

    this.options = {
      test,
      warningsFilter,
      extractComments,
      sourceMap,
      cache,
      cacheKeys,
      parallel,
      include,
      exclude,
      minify,
      uglifyOptions: {
        compress: {
          inline: 1,
        },
        output: {
          comments: extractComments ? false : /^\**!|@preserve|@license|@cc_on/,
        },
        ...uglifyOptions,
      },
    };
  }

  static buildSourceMap(inputSourceMap) {
    if (!inputSourceMap || !utils.isSourceMap(inputSourceMap)) {
      return null;
    }

    return new SourceMapConsumer(inputSourceMap);
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
    } else if (err.stack) {
      return new Error(`${file} from UglifyJs\n${err.stack}`);
    }
    return new Error(`${file} from UglifyJs\n${err.message}`);
  }

  static buildWarning(warning, file, sourceMap, warningsFilter, requestShortener) {
    if (!file || !sourceMap) {
      return warning;
    }

    const match = warningRegex.exec(warning);
    const line = +match[1];
    const column = +match[2];
    const original = sourceMap.originalPositionFor({
      line,
      column,
    });

    if (!warningsFilter(original.source)) {
      return null;
    }

    let warningMessage = warning.replace(warningRegex, '');

    if (original && original.source && original.source !== file) {
      warningMessage += `[${requestShortener.shorten(original.source)}:${original.line},${original.column}]`;
    }

    return `UglifyJs Plugin: ${warningMessage} in ${file}`;
  }

  apply(compiler) {
    const requestShortener = new RequestShortener(compiler.context);

    const buildModuleFn = (moduleArg) => {
      // to get detailed location info about errors
      moduleArg.useSourceMap = true;
    };

    const optimizeFn = (compilation, chunks, callback) => {
      const runner = new Runner({
        cache: this.options.cache,
        parallel: this.options.parallel,
      });

      const uglifiedAssets = new WeakSet();
      const tasks = [];

      chunks.reduce((acc, chunk) => acc.concat(chunk.files || []), [])
        .concat(compilation.additionalChunkAssets || [])
        .filter(ModuleFilenameHelpers.matchObject.bind(null, this.options))
        .forEach((file) => {
          let inputSourceMap;
          const asset = compilation.assets[file];
          if (uglifiedAssets.has(asset)) {
            return;
          }

          try {
            let input;

            if (this.options.sourceMap && asset.sourceAndMap) {
              const { source, map } = asset.sourceAndMap();

              input = source;

              if (utils.isSourceMap(map)) {
                inputSourceMap = map;
              } else {
                inputSourceMap = map;
                compilation.warnings.push(
                  new Error(`${file} contains invalid source map`),
                );
              }
            } else {
              input = asset.source();
              inputSourceMap = null;
            }

            // Handling comment extraction
            let commentsFile = false;
            if (this.options.extractComments) {
              commentsFile = this.options.extractComments.filename || `${file}.LICENSE`;
              if (typeof commentsFile === 'function') {
                commentsFile = commentsFile(file);
              }
            }

            const task = {
              file,
              input,
              inputSourceMap,
              commentsFile,
              extractComments: this.options.extractComments,
              uglifyOptions: this.options.uglifyOptions,
              minify: this.options.minify,
            };

            if (this.options.cache) {
              const defaultCacheKeys = {
                terser: versions.uglify,
                'uglifyjs-webpack-plugin': versions.plugin,
                'uglifyjs-webpack-plugin-options': this.options,
                path: compiler.outputPath ? `${compiler.outputPath}/${file}` : file,
                hash: crypto.createHash('md4').update(input).digest('hex'),
              };

              task.cacheKeys = this.options.cacheKeys(defaultCacheKeys, file);
            }

            tasks.push(task);
          } catch (error) {
            compilation.errors.push(
              UglifyJsPlugin.buildError(
                error,
                file,
                UglifyJsPlugin.buildSourceMap(inputSourceMap),
                requestShortener,
              ),
            );
          }
        });

      runner.runTasks(tasks, (tasksError, results) => {
        if (tasksError) {
          compilation.errors.push(tasksError);
          return;
        }

        results.forEach((data, index) => {
          const { file, input, inputSourceMap, commentsFile } = tasks[index];
          const { error, map, code, warnings, extractedComments } = data;

          let sourceMap = null;

          if (error || (warnings && warnings.length > 0)) {
            sourceMap = UglifyJsPlugin.buildSourceMap(inputSourceMap);
          }

          // Handling results
          // Error case: add errors, and go to next file
          if (error) {
            compilation.errors.push(
              UglifyJsPlugin.buildError(
                error,
                file,
                sourceMap,
                requestShortener,
              ),
            );

            return;
          }

          let outputSource;
          if (map) {
            outputSource = new SourceMapSource(
              code,
              file,
              JSON.parse(map), input, inputSourceMap,
            );
          } else {
            outputSource = new RawSource(code);
          }

          // Write extracted comments to commentsFile
          if (commentsFile && extractedComments.length > 0) {
            // Add a banner to the original file
            if (this.options.extractComments.banner !== false) {
              let banner = this.options.extractComments.banner
                || `For license information please see ${path.posix.basename(commentsFile)}`;

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
          if (warnings && warnings.length > 0) {
            warnings.forEach((warning) => {
              const builtWarning = UglifyJsPlugin.buildWarning(
                warning,
                file,
                sourceMap,
                this.options.warningsFilter,
                requestShortener,
              );

              if (builtWarning) {
                compilation.warnings.push(builtWarning);
              }
            });
          }
        });

        runner.exit();

        callback();
      });
    };

    if (compiler.hooks) {
      const plugin = { name: 'UglifyJSPlugin' };

      compiler.hooks.compilation.tap(plugin, (compilation) => {
        if (this.options.sourceMap) {
          compilation.hooks.buildModule.tap(plugin, buildModuleFn);
        }

        compilation.hooks.optimizeChunkAssets.tapAsync(plugin, optimizeFn.bind(this, compilation));
      });
    } else {
      compiler.plugin('compilation', (compilation) => {
        if (this.options.sourceMap) {
          compilation.plugin('build-module', buildModuleFn);
        }

        compilation.plugin('optimize-chunk-assets', optimizeFn.bind(this, compilation));
      });
    }
  }
}

export default UglifyJsPlugin;
