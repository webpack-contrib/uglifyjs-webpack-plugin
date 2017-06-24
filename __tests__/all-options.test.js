"use strict";

const UglifyJsPlugin = require("../src/index");
const SourceMapSource = require("webpack-sources").SourceMapSource;
const PluginEnvironment = require("./helpers").PluginEnvironment;
const cleanErrorStack = require("./helpers").cleanErrorStack;
const createCompiler = require("./helpers").createCompiler;
const compile = require("./helpers").compile;

describe("when applied with all options", () => {
	let eventBindings;
	let eventBinding;

	beforeEach(() => {
		const pluginEnvironment = new PluginEnvironment();
		const compilerEnv = pluginEnvironment.getEnvironmentStub();
		compilerEnv.context = "";

		const plugin = new UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: true,
			},
			mangle: false,
			beautify: true,
			comments: false,
			extractComments: {
				condition: "should be extracted",
				filename: function(file) {
					return file.replace(/(\.\w+)$/, ".license$1");
				},
				banner: function(licenseFile) {
					return "License information can be found in " + licenseFile;
				}
			}
		});
		plugin.apply(compilerEnv);
		eventBindings = pluginEnvironment.getEventBindings();
	});

	it("matches snapshot", () => {
		const compiler = createCompiler();
		new UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: true,
			},
			mangle: false,
			beautify: true,
			comments: false,
			extractComments: {
				condition: "should be extracted",
				filename: function(file) {
					return file.replace(/(\.\w+)$/, ".license$1");
				},
				banner: function(licenseFile) {
					return "License information can be found in " + licenseFile;
				}
			}
		}).apply(compiler);

		return compile(compiler).then((stats) => {
			const errors = stats.compilation.errors.map(cleanErrorStack);
			const warnings = stats.compilation.warnings.map(cleanErrorStack);

			expect(errors).toMatchSnapshot("errors");
			expect(warnings).toMatchSnapshot("warnings");

			for(let file in stats.compilation.assets) {
				expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
			}
		});
	});

	it("binds one event handler", () => {
		expect(eventBindings.length).toBe(1);
	});

	describe("compilation handler", () => {
		beforeEach(() => {
			eventBinding = eventBindings[0];
		});

		it("binds to compilation event", () => {
			expect(eventBinding.name).toBe("compilation");
		});

		describe("when called", () => {
			let chunkPluginEnvironment;
			let compilationEventBindings;
			let compilationEventBinding;
			let compilation;

			beforeEach(() => {
				chunkPluginEnvironment = new PluginEnvironment();
				compilation = chunkPluginEnvironment.getEnvironmentStub();
				compilation.assets = {
					"test.js": {
						source: () => {
							return "/** @preserve Foo Bar */ function foo(longVariableName) { longVariableName = 1; }";
						},
						map: () => {
							return {
								version: 3,
								sources: ["test.js"],
								names: ["foo", "longVariableName"],
								mappings: "AAAA,QAASA,KAAIC,kBACTA,iBAAmB"
							};
						}
					},
					"test1.js": {
						source: () => {
							return "invalid javascript";
						},
						map: () => {
							return {
								version: 3,
								sources: ["test1.js"],
								names: [""],
								mappings: "AAAA"
							};
						}
					},
					"test2.js": {
						source: () => {
							return "function foo(x) { if (x) { return bar(); not_called1(); } }";
						},
						map: () => {
							return {
								version: 3,
								sources: ["test1.js"],
								names: ["foo", "x", "bar", "not_called1"],
								mappings: "AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC"
							};
						}
					},
					"test3.js": {
						sourceAndMap: () => {
							return {
								source: "/** @preserve Foo Bar */ function foo(longVariableName) { longVariableName = 1; }",
								map: {
									version: 3,
									sources: ["test.js"],
									names: ["foo", "longVariableName"],
									mappings: "AAAA,QAASA,KAAIC,kBACTA,iBAAmB"
								}
							};
						},
					},
					"test4.js": {
						source: () => {
							return "/*! this comment should be extracted */ function foo(longVariableName) { /* this will not be extracted */ longVariableName = 1; } // another comment that should be extracted to a separate file\n function foo2(bar) { return bar; }";
						},
						map: () => {
							return {
								version: 3,
								sources: ["test.js"],
								names: ["foo", "longVariableName"],
								mappings: "AAAA,QAASA,KAAIC,kBACTA,iBAAmB"
							};
						}
					},
				};
				compilation.errors = [];
				compilation.warnings = [];

				eventBinding.handler(compilation);
				compilationEventBindings = chunkPluginEnvironment.getEventBindings();
			});

			it("binds two event handler", () => {
				expect(compilationEventBindings.length).toBe(2);
			});

			describe("build-module handler", () => {
				beforeEach(() => {
					compilationEventBinding = compilationEventBindings[0];
				});

				it("binds to build-module event", () => {
					expect(compilationEventBinding.name).toBe("build-module");
				});

				it("sets the useSourceMap flag", () => {
					const obj = {};
					compilationEventBinding.handler(obj);
					expect(obj.useSourceMap).toBeTruthy();
				});
			});

			describe("optimize-chunk-assets handler", () => {
				beforeEach(() => {
					compilationEventBinding = compilationEventBindings[1];
				});

				it("binds to optimize-chunk-assets event", () => {
					expect(compilationEventBinding.name).toBe("optimize-chunk-assets");
				});

				it("outputs no errors for valid javascript", () => {
					compilationEventBinding.handler([{
						files: ["test.js"]
					}], () => {
						expect(compilation.errors.length).toBe(0);
					});
				});

				it("outputs SourceMapSource for valid javascript", () => {
					compilationEventBinding.handler([{
						files: ["test.js"]
					}], () => {
						expect(compilation.assets["test.js"]).toBeInstanceOf(SourceMapSource);
					});
				});

				it("does not output mangled javascript", () => {
					compilationEventBinding.handler([{
						files: ["test.js"]
					}], () => {
						expect(compilation.assets["test.js"]._value).toEqual(expect.stringContaining("longVariableName"));
					});
				});

				it("outputs beautified javascript", () => {
					compilationEventBinding.handler([{
						files: ["test.js"]
					}], () => {
						expect(compilation.assets["test.js"]._value).toEqual(expect.stringContaining("\n"));
					});
				});

				it("does not preserve comments", () => {
					compilationEventBinding.handler([{
						files: ["test.js"]
					}], () => {
						expect(compilation.assets["test.js"]._value).not.toBe(expect.stringContaining("/**"));
					});
				});

				it("outputs parsing errors", () => {
					compilationEventBinding.handler([{
						files: ["test1.js"]
					}], () => {
						expect(compilation.errors.length).toBe(1);
						expect(compilation.errors[0]).toBeInstanceOf(Error);
						expect(compilation.errors[0].message).toEqual(expect.stringContaining("[test1.js:1,0][test1.js:1,8]"));
					});
				});

				it("outputs warnings for unreachable code", () => {
					compilationEventBinding.handler([{
						files: ["test2.js"]
					}], () => {
						expect(compilation.warnings.length).toBe(1);
						expect(compilation.warnings[0]).toBeInstanceOf(Error);
						expect(compilation.warnings[0].message).toEqual(expect.stringContaining("Dropping unreachable code"));
					});
				});

				it("works with sourceAndMap assets as well", () => {
					compilationEventBinding.handler([{
						files: ["test3.js"]
					}], () => {
						expect(compilation.errors.length).toBe(0);
						expect(compilation.assets["test3.js"]).toBeInstanceOf(SourceMapSource);
					});
				});

				describe("with warningsFilter set", () => {
					let compilationEventBindings, compilation;

					describe("and the filter returns true", () => {
						beforeEach(() => {
							const pluginEnvironment = new PluginEnvironment();
							const compilerEnv = pluginEnvironment.getEnvironmentStub();
							compilerEnv.context = "";

							const plugin = new UglifyJsPlugin({
								warningsFilter: () => {
									return true;
								},
								sourceMap: true,
								compress: {
									warnings: true,
								},
								mangle: false,
								beautify: true,
								comments: false
							});
							plugin.apply(compilerEnv);
							const eventBindings = pluginEnvironment.getEventBindings();

							const chunkPluginEnvironment = new PluginEnvironment();
							compilation = chunkPluginEnvironment.getEnvironmentStub();
							compilation.assets = {
								"test2.js": {
									source: () => {
										return "function foo(x) { if (x) { return bar(); not_called1(); } }";
									},
									map: () => {
										return {
											version: 3,
											sources: ["test1.js"],
											names: ["foo", "x", "bar", "not_called1"],
											mappings: "AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC"
										};
									}
								},
							};
							compilation.errors = [];
							compilation.warnings = [];

							eventBindings[0].handler(compilation);
							compilationEventBindings = chunkPluginEnvironment.getEventBindings();
						});

						it("should get all warnings", () => {
							compilationEventBindings[1].handler([{
								files: ["test2.js"]
							}], () => {
								expect(compilation.warnings.length).toBe(1);
								expect(compilation.warnings[0]).toBeInstanceOf(Error);
								expect(compilation.warnings[0].message).toEqual(expect.stringContaining("Dropping unreachable code"));
							});
						});
					});

					describe("and the filter returns false", () => {
						beforeEach(() => {
							const pluginEnvironment = new PluginEnvironment();
							const compilerEnv = pluginEnvironment.getEnvironmentStub();
							compilerEnv.context = "";

							const plugin = new UglifyJsPlugin({
								warningsFilter: () => {
									return false;
								},
								sourceMap: true,
								compressor: {
									warnings: true,
								},
								mangle: false,
								beautify: true,
								comments: false
							});
							plugin.apply(compilerEnv);
							const eventBindings = pluginEnvironment.getEventBindings();

							const chunkPluginEnvironment = new PluginEnvironment();
							compilation = chunkPluginEnvironment.getEnvironmentStub();
							compilation.assets = {
								"test2.js": {
									source: () => {
										return "function foo(x) { if (x) { return bar(); not_called1(); } }";
									},
									map: () => {
										return {
											version: 3,
											sources: ["test1.js"],
											names: ["foo", "x", "bar", "not_called1"],
											mappings: "AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC"
										};
									}
								},
							};
							compilation.errors = [];
							compilation.warnings = [];

							eventBindings[0].handler(compilation);
							compilationEventBindings = chunkPluginEnvironment.getEventBindings();
						});

						it("should get no warnings", () => {
							compilationEventBindings[1].handler([{
								files: ["test2.js"]
							}], () => {
								expect(compilation.warnings.length).toBe(0);
							});
						});
					});
				});

				it("extracts license information to separate file", () => {
					compilationEventBinding.handler([{
						files: ["test4.js"]
					}], () => {
						expect(compilation.errors.length).toBe(0);
						expect(compilation.assets["test4.license.js"]._value).toEqual(expect.stringContaining("/*! this comment should be extracted */"));
						expect(compilation.assets["test4.license.js"]._value).toEqual(expect.stringContaining("// another comment that should be extracted to a separate file"));
						expect(compilation.assets["test4.license.js"]._value).not.toEqual(expect.stringContaining("/* this will not be extracted */"));
					});
				});
			});
		});
	});
});
