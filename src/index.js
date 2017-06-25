/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";
/* eslint-disable no-plusplus, no-continue, no-loop-func */

const SourceMapConsumer = require("source-map").SourceMapConsumer;
const SourceMapSource = require("webpack-sources").SourceMapSource;
const RawSource = require("webpack-sources").RawSource;
const ConcatSource = require("webpack-sources").ConcatSource;
const RequestShortener = require("webpack/lib/RequestShortener");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const uglify = require("uglify-js");

const WARN_PATTERN = /\[.+:([0-9]+),([0-9]+)\]/;

function ensureConditionFunc(condition, key) {
	switch(typeof condition[key]) {
		case "boolean": {
			const b = condition[key];
			condition[key] = () => b;
			break;
		}
		case "function":
			break;
		case "string": {
			if(condition[key] === "all") {
				condition[key] = () => true;
				break;
			}
			const regex = new RegExp(condition[key]);
			condition[key] = (astNode, comment) => regex.test(comment.value);
			break;
		}
		default: {
			const defaultRegex = condition[key];
			condition[key] = (astNode, comment) => defaultRegex.test(comment.value);
		}
	}
}

class UglifyJsPlugin {
	constructor(options) {
		if(typeof options !== "object" || Array.isArray(options)) options = {};
		if(typeof options.compressor !== "undefined") options.compress = options.compressor;
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		options.test = options.test || /\.js($|\?)/i;

		const warningsFilter = options.warningsFilter || (() => true);
		const requestShortener = new RequestShortener(compiler.context);

		compiler.plugin("compilation", (compilation) => {
			if(options.sourceMap) {
				compilation.plugin("build-module", (module) => {
					// to get detailed location info about errors
					module.useSourceMap = true;
				});
			}

			compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
				const warnings = [];
				const output = {
					comments: options.comments || /^\**!|@preserve|@license/,
					beautify: options.beautify,
					...options.output
				};
				const outputSourceSet = new WeakSet();
				const files = compilation.additionalChunkAssets || [];

				let file;
				let i = chunks.length;

				while(i--) {
					files.push.apply(files, chunks[i].files); // eslint-disable-line prefer-spread
				}

				i = files.length;
				while(i--) {
					file = files[i];

					if(!ModuleFilenameHelpers.matchObject(options, file)) continue;

					var asset = compilation.assets[file];
					if(outputSourceSet.has(asset)) continue;

					var oldWarnFunction = uglify.AST_Node.warn_function;
					var inputSourceMap;
					var input;
					var sourceMap;
					var map;
					var outputSource;
					var stream;

					try {
						if(options.sourceMap) {
							if(asset.sourceAndMap) {
								const sourceAndMap = asset.sourceAndMap();
								inputSourceMap = sourceAndMap.map;
								input = sourceAndMap.source;
							} else {
								inputSourceMap = asset.map();
								input = asset.source();
							}
							sourceMap = new SourceMapConsumer(inputSourceMap);
							uglify.AST_Node.warn_function = (warning) => { // eslint-disable-line camelcase
								const match = WARN_PATTERN.exec(warning);
								const line = +match[1];
								const column = +match[2];
								const original = sourceMap.originalPositionFor({
									line,
									column,
								});
								if(!original || !original.source || original.source === file) return;
								if(!warningsFilter(original.source)) return;
								warnings.push(warning.replace(WARN_PATTERN, "") +
									"[" + requestShortener.shorten(original.source) + ":" + original.line + "," + original.column + "]");
							};
						} else {
							input = asset.source();
							uglify.AST_Node.warn_function = (warning) => { // eslint-disable-line camelcase
								warnings.push(warning);
							};
						}
						uglify.base54.reset();

						var ast = uglify.parse(input, {
							filename: file,
						});
						if(options.compress !== false) {
							ast.figure_out_scope();
							const compress = uglify.Compressor(options.compress || {
								warnings: false,
							}); // eslint-disable-line new-cap
							ast = compress.compress(ast);
						}
						if(options.mangle !== false) {
							ast.figure_out_scope(options.mangle || {});
							ast.compute_char_frequency(options.mangle || {});
							ast.mangle_names(options.mangle || {});
							if(options.mangle && options.mangle.props) {
								uglify.mangle_properties(ast, options.mangle.props);
							}
						}

						const extractedComments = [];
						if(options.extractComments) {
							const condition = {};
							if(typeof options.extractComments === "string" || options.extractComments instanceof RegExp) {
								// extractComments specifies the extract condition and output.comments specifies the preserve condition
								condition.preserve = output.comments;
								condition.extract = options.extractComments;
							} else if(Object.prototype.hasOwnProperty.call(options.extractComments, "condition")) {
								// Extract condition is given in extractComments.condition
								condition.preserve = output.comments;
								condition.extract = options.extractComments.condition;
							} else {
								// No extract condition is given. Extract comments that match output.comments instead of preserving them
								condition.preserve = false;
								condition.extract = output.comments;
							}

							// Ensure that both conditions are functions
							ensureConditionFunc(condition, "preserve");
							ensureConditionFunc(condition, "extract");

							// Redefine the comments function to extract and preserve
							// comments according to the two conditions
							output.comments = (astNode, comment) => {
								if(condition.extract(astNode, comment)) {
									extractedComments.push(
										comment.type === "comment2" ? "/*" + comment.value + "*/" : "//" + comment.value
									);
								}
								return condition.preserve(astNode, comment);
							};
						}

						if(options.sourceMap) {
							map = uglify.SourceMap({ // eslint-disable-line new-cap
								file,
								root: "",
							});
							output.source_map = map; // eslint-disable-line camelcase
							map = "" + map;
							stream = uglify.OutputStream(output); // eslint-disable-line new-cap
							ast.print(stream);
							outputSource = new SourceMapSource(
								`${stream}`, file, JSON.parse(map), input, inputSourceMap // eslint-disable-line comma-dangle
							);
						} else {
							stream = uglify.OutputStream(output); // eslint-disable-line new-cap
							ast.print(stream);
							outputSource = new RawSource(`${stream}`);
						}

						if(extractedComments.length) {
							let commentsFile = options.extractComments.filename || file + ".LICENSE";

							if(typeof commentsFile === "function") {
								commentsFile = commentsFile(file);
							}

							// Write extracted comments to commentsFile
							const commentsSource = new RawSource(extractedComments.join("\n\n") + "\n");
							if(commentsFile in compilation.assets) {
								// commentsFile already exists, append new comments...
								if(compilation.assets[commentsFile] instanceof ConcatSource) {
									compilation.assets[commentsFile].add("\n");
									compilation.assets[commentsFile].add(commentsSource);
								} else {
									compilation.assets[commentsFile] = new ConcatSource(
										compilation.assets[commentsFile], "\n", commentsSource
									);
								}
							} else {
								compilation.assets[commentsFile] = commentsSource;
							}

							// Add a banner to the original file
							if(options.extractComments.banner !== false) {
								let banner = options.extractComments.banner || "For license information please see " + commentsFile;
								if(typeof banner === "function") {
									banner = banner(commentsFile);
								}
								if(banner) {
									outputSource = new ConcatSource(
										"/*! " + banner + " */\n", outputSource
									);
								}
							}
						}

						compilation.assets[file] = outputSource;
						outputSourceSet.add(outputSource);

						if(warnings.length) {
							compilation.warnings.push(new Error(file + " from UglifyJs\n" + warnings.join("\n")));
						}

					} catch(err) {
						if(err.line) {
							const original = sourceMap && sourceMap.originalPositionFor({
								line: err.line,
								column: err.col,
							});
							if(original && original.source) {
								compilation.errors.push(new Error(file + " from UglifyJs\n" + err.message + " [" + requestShortener.shorten(original.source) + ":" + original.line + "," + original.column + "][" + file + ":" + err.line + "," + err.col + "]"));
							} else {
								compilation.errors.push(new Error(file + " from UglifyJs\n" + err.message + " [" + file + ":" + err.line + "," + err.col + "]"));
							}
						} else if(err.msg) {
							compilation.errors.push(new Error(file + " from UglifyJs\n" + err.msg));
						} else
							compilation.errors.push(new Error(file + " from UglifyJs\n" + err.stack));
					} finally {
						uglify.AST_Node.warn_function = oldWarnFunction; // eslint-disable-line camelcase
					}
				}
				callback();
			});
		});
	}
}

module.exports = UglifyJsPlugin;
