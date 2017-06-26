/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const SourceMapConsumer = require("source-map").SourceMapConsumer;
const SourceMapSource = require("webpack-sources").SourceMapSource;
const RawSource = require("webpack-sources").RawSource;
const ConcatSource = require("webpack-sources").ConcatSource;
const RequestShortener = require("webpack/lib/RequestShortener");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const uglify = require("uglify-es");

// TODO: temporarily disabled rules
/* eslint-disable
  no-undefined,
  no-param-reassign,
  no-underscore-dangle,
  import/order
*/

class UglifyJsPlugin {
	constructor(options) {
		if(typeof options !== "object" || Array.isArray(options)) options = {};

		this.options = options || {};
		this.options.test = this.options.test || /\.js($|\?)/i;
		this.options.warningsFilter = this.options.warningsFilter || (() => true);

		this.uglifyOptions = Object.assign({}, this.options.uglifyOptions || {}, { sourceMap: null });
	}

	buildError(err, file, sourceMap, requestShortener) {
		if(err.line) { // Handling error which should have line, col, filename and message
			const original = sourceMap && sourceMap.originalPositionFor({
				line: err.line,
				column: err.col
			});
			if(original && original.source) {
				return new Error(file + " from UglifyJs\n" + err.message + " [" + requestShortener.shorten(original.source) + ":" + original.line + "," + original.column + "][" + file + ":" + err.line + "," + err.col + "]");
			}
			return new Error(file + " from UglifyJs\n" + err.message + " [" + file + ":" + err.line + "," + err.col + "]");
		} else if(err.msg) {
			return new Error(file + " from UglifyJs\n" + err.msg);
		} else if(err.message) { //Pretty sure if should be message and not msg
			return new Error(file + " from UglifyJs\n" + err.message);
		}
		return new Error(file + " from UglifyJs\n" + err.stack);
	}

	buildWarnings(warnings, file, sourceMap, warningsFilter, requestShortener) {
		return warnings.reduce((accWarnings, warning) => {
			if(!sourceMap) {
				accWarnings.push(warning);
			} else {
				const match = /\[.+:([0-9]+),([0-9]+)\]/.exec(warning);
				const line = +match[1];
				const column = +match[2];
				const original = sourceMap.originalPositionFor({
					line: line,
					column: column
				});

				if(original && !original.source && original.source !== file && !warningsFilter(original.source)) {
					accWarnings.push(warning.replace(/\[.+:([0-9]+),([0-9]+)\]/, "") + "[" + requestShortener.shorten(original.source) + ":" + original.line + "," + original.column + "]");
				}

			}
			return accWarnings;
		}, []);
	}

	buildCommentsFunction(options, uglifyOptions, extractedComments) {
		const condition = {};
		const commentsOpts = uglifyOptions.comments || "some";
		if(typeof options.extractComments === "string" || options.extractComments instanceof RegExp) {
			// extractComments specifies the extract condition and commentsOpts specifies the preserve condition
			condition.preserve = commentsOpts;
			condition.extract = options.extractComments;
		} else if(Object.prototype.hasOwnProperty.call(options.extractComments, "condition")) {
			// Extract condition is given in extractComments.condition
			condition.preserve = commentsOpts;
			condition.extract = options.extractComments.condition;
		} else {
			// No extract condition is given. Extract comments that match commentsOpts instead of preserving them
			condition.preserve = false;
			condition.extract = commentsOpts;
		}

		// Ensure that both conditions are functions
		["preserve", "extract"].forEach(key => {
			switch(typeof condition[key]) {
				case "boolean":
					condition[key] = () => condition[key];
					break;
				case "function":
					break;
				case "string":
					if(condition[key] === "all") {
						condition[key] = () => true;
						break;
					}
					if(condition[key] === "some") {
						condition[key] = (astNode, comment) => comment.type === "comment2" && /@preserve|@license|@cc_on/i.test(comment.value);
					}
					condition[key] = (astNode, comment) => new RegExp(condition[key]).test(comment.value);
					break;
				default:
					condition[key] = (astNode, comment) => condition[key].test(comment.value);
			}
		});

		// Redefine the comments function to extract and preserve
		// comments according to the two conditions
		return (astNode, comment) => {
			if(condition.extract(astNode, comment)) {
				extractedComments.push(
					comment.type === "comment2" ? "/*" + comment.value + "*/" : "//" + comment.value
				);
			}
			return condition.preserve(astNode, comment);
		};
	}

	apply(compiler) {

		const requestShortener = new RequestShortener(compiler.context);
		compiler.plugin("compilation", (compilation) => {

			if(this.options.sourceMap) {
				compilation.plugin("build-module", (module) => {
					// to get detailed location info about errors
					module.useSourceMap = true;
				});
			}

			compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
				const files = [];
				chunks.forEach((chunk) => files.push.apply(files, chunk.files));
				files.push.apply(files, compilation.additionalChunkAssets);
				const filteredFiles = files.filter(ModuleFilenameHelpers.matchObject.bind(undefined, this.options));
				filteredFiles.forEach((file) => {
					// Copy uglify options
					const uglifyOptions = Object.assign({}, this.uglifyOptions);

					const asset = compilation.assets[file];
					if(asset.__UglifyJsPlugin) {
						compilation.assets[file] = asset.__UglifyJsPlugin;
						return;
					}
					let input, inputSourceMap, sourceMap;

					if(this.options.sourceMap) {
						if(asset.sourceAndMap) {
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
							content: inputSourceMap
						};
					} else {
						input = asset.source();
					}

					// Handling comment extraction
					const extractedComments = [];
					let commentsFile = false;
					if(this.options.extractComments) {
						uglifyOptions.comments = this.buildCommentsFunction(this.options, uglifyOptions, extractedComments);

						let commentsFile = this.options.extractComments.filename || file + ".LICENSE";
						if(typeof commentsFile === "function") {
							commentsFile = commentsFile(file);
						}

						// Handling banner
						if(this.options.extractComments.banner !== false) {
							let banner = this.options.extractComments.banner || "For license information please see " + commentsFile;
							if(typeof banner === "function") {
								banner = banner(commentsFile);
							}
							if(banner) {
								uglifyOptions.output = uglifyOptions.output || {};
								uglifyOptions.output.preamble = uglifyOptions.output.preamble ? banner + "\n" + uglifyOptions.output.preamble : banner;
							}
						}
					}

					// Calling uglify
					let minifyResult = uglify.minify({ [file]: input }, uglifyOptions);

					// Handling results
					if(minifyResult.error) {
						compilation.errors.push(this.buildError(minifyResult.error, file, sourceMap, compilation, requestShortener));
					} else {
						let outputSource = (minifyResult.map ?
							new SourceMapSource(minifyResult.code, file, JSON.parse(minifyResult.map), input, inputSourceMap) :
							new RawSource(minifyResult.code));

						asset.__UglifyJsPlugin = compilation.assets[file] = outputSource;

						// Handling warnings
						if(minifyResult.warnings) {
							const buildWarnings = this.buildWarnings(minifyResult.warnings, file, sourceMap, this.options.warningsFilter, requestShortener);
							compilation.warnings.push(new Error(file + " from UglifyJs\n" + buildWarnings.join("\n")));
						}

						// Write extracted comments to commentsFile
						if(commentsFile) {
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
						}
					}
				});
				callback();
			});
		});
	}
}

module.exports = UglifyJsPlugin;
