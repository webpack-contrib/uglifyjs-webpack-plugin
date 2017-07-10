/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

import path from 'path';
import { SourceMapConsumer } from 'source-map';
import { SourceMapSource, RawSource, ConcatSource } from 'webpack-sources';
import RequestShortener from 'webpack/lib/RequestShortener';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';
import Uglify from './uglify';

/* eslint-disable
  no-param-reassign
*/

const warningRegex = /\[.+:([0-9]+),([0-9]+)\]/;

class UglifyJsPlugin {
  constructor(options) {
    if (typeof options !== 'object' || Array.isArray(options)) {
      this.options = {};
    } else {
      this.options = options || /* istanbul ignore next */ {};
    }

    this.options.test = this.options.test || /\.js($|\?)/i;
    this.options.warningsFilter = this.options.warningsFilter || (() => true);
    this.options.uglifyOptions = this.options.uglifyOptions || {};
    this.options.parallel = this.options.parallel || {};
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
    } else if (err.message) {
      return new Error(`${file} from UglifyJs\n${err.message}`);
    }
    return new Error(`${file} from UglifyJs\n${err.stack}`);
  }

  static buildWarnings(warnings, file, sourceMap, warningsFilter, requestShortener) {
    if (!sourceMap) {
      return warnings;
    }
    return warnings.reduce((accWarnings, warning) => {
      const match = warningRegex.exec(warning);
      const line = +match[1];
      const column = +match[2];
      const original = sourceMap.originalPositionFor({
        line,
        column,
      });

      if (original && original.source && original.source !== file && warningsFilter(original.source)) {
        accWarnings.push(`${warning.replace(warningRegex, '')}[${requestShortener.shorten(original.source)}:${original.line},${original.column}]`);
      }

      return accWarnings;
    }, []);
  }

  apply(compiler) {
    const requestShortener = new RequestShortener(compiler.context);


    compiler.plugin('compilation', (compilation) => {
      if (this.options.sourceMap) {
        compilation.plugin('build-module', (moduleArg) => {
          // to get detailed location info about errors
          moduleArg.useSourceMap = true;
        });
      }

      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        const uglify = new Uglify(this.options.parallel);
        const exit = () => uglify.exit(callback);
        const uglifiedAssets = new WeakSet();
        const tasks = [];
        chunks.reduce((acc, chunk) => acc.concat(chunk.files || []), [])
          .concat(compilation.additionalChunkAssets || [])
          .filter(ModuleFilenameHelpers.matchObject.bind(null, this.options))
          .forEach((file) => {
            let sourceMap;
            const asset = compilation.assets[file];
            if (uglifiedAssets.has(asset)) {
              return;
            }

            try {
              let input;
              let inputSourceMap;
              const dist = compiler.options ? compiler.options.output.path : '';
              const id = path.join(dist, file);
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
              } else {
                input = asset.source();
              }

              // Handling comment extraction
              let commentsFile = false;
              if (this.options.extractComments) {
                commentsFile = this.options.extractComments.filename || `${file}.LICENSE`;
                if (typeof commentsFile === 'function') {
                  commentsFile = commentsFile(file);
                }
              }

              tasks.push({
                id,
                file,
                input,
                sourceMap,
                inputSourceMap,
                commentsFile,
                extractComments: this.options.extractComments,
                uglifyOptions: this.options.uglifyOptions,
              });
            } catch (error) {
              compilation.errors.push(UglifyJsPlugin.buildError(error, file, sourceMap, compilation, requestShortener));
            }
          });

        uglify.runTasks(tasks, (tasksError, results) => {
          if (tasksError) {
            compilation.errors.push(tasksError);
            return;
          }

          results.forEach((data, index) => {
            const { file, input, sourceMap, inputSourceMap, commentsFile } = tasks[index];
            const { error, map, code, warnings, extractedComments } = data;

            // Handling results
            // Error case: add errors, and go to next file
            if (error) {
              compilation.errors.push(UglifyJsPlugin.buildError(error, file, sourceMap, compilation, requestShortener));
              return;
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
          });

          exit();
        });
      });
    });
  }
}

export default UglifyJsPlugin;
