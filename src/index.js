/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const SourceMapSource = require("webpack-sources").SourceMapSource;
const RawSource = require("webpack-sources").RawSource;
const ConcatSource = require("webpack-sources").ConcatSource;
const RequestShortener = require("webpack/lib/RequestShortener");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const uglify = require("uglify-es");
const extractCommentsHandler = require("./extract-comments-handling");

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

		this.options = Object.assign({}, options);
		this.options.test = this.options.test || /\.js($|\?)/i;
		this.options.warningsFilter = this.options.warningsFilter || (() => true);

		this.uglifyOptions = Object.assign({}, this.options.uglifyOptions || {}, { sourceMap: null });

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

					let sourceMap;
					try {
						const asset = compilation.assets[file];
						if(asset.__UglifyJsPlugin) {
							compilation.assets[file] = asset.__UglifyJsPlugin;
							return;
						}
						let input;
						let inputSourceMap;
						if(this.options.sourceMap) {
							if(asset.sourceAndMap) {
								const sourceAndMap = asset.sourceAndMap();
								inputSourceMap = sourceAndMap.map;
								input = sourceAndMap.source;
							} else {
								inputSourceMap = asset.map();
								input = asset.source();
							}
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
							uglifyOptions.comments = extractCommentsHandler(this.options, uglifyOptions, extractedComments);

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

						// Call uglify
						let minifyResult = uglify.minify({ [file]: input }, uglifyOptions);

						// Handling results
						let outputSource = (minifyResult.map ?
							new SourceMapSource(minifyResult.code, file, JSON.parse(minifyResult.map), input, inputSourceMap) :
							new RawSource(minifyResult.code));


						if(minifyResult.error) {
							throw minifyResult.error;
						}

						asset.__UglifyJsPlugin = compilation.assets[file] = outputSource;

						if(minifyResult.warnings && minifyResult.warnings.filter(this.options.warningsFilter).length > 0) {
							compilation.warnings.push(new Error(file + " from UglifyJs\n" + minifyResult.warnings.filter(this.options.warningsFilter).join("\n")));
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

					} catch(err) {
						if(err.line) {
							const original = sourceMap && sourceMap.originalPositionFor({
								line: err.line,
								column: err.col
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
					}
				});
				callback();
			});
		});
	}
}

module.exports = UglifyJsPlugin;
