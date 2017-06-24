"use strict";

const UglifyJsPlugin = require("../src/index");
const PluginEnvironment = require("./helpers").PluginEnvironment;

describe("when options.extractComments", () => {
	let compilation;
	let compilationEventBinding;

	beforeEach(() => {
		const pluginEnvironment = new PluginEnvironment();
		const compilerEnv = pluginEnvironment.getEnvironmentStub();
		compilerEnv.context = "";

		const plugin = new UglifyJsPlugin({
			compress: {
				warnings: true,
			},
			comments: false,
			extractComments: 1,
			mangle: {
				props: {
					builtins: true
				}
			}
		});
		plugin.apply(compilerEnv);

		let eventBinding = pluginEnvironment.getEventBindings()[0];
		let chunkPluginEnvironment = new PluginEnvironment();

		compilation = chunkPluginEnvironment.getEnvironmentStub();
		compilation.assets = {
			"test.js": {
				source: () => {
					return "var foo = 1;";
				}
			},
			"test1.js": {
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
		compilation.warnings = [];
		compilation.errors = [];

		eventBinding.handler(compilation);
		compilationEventBinding = chunkPluginEnvironment.getEventBindings()[0];
	});

	it("normalizes extractConmments", () => {
		compilationEventBinding.handler([{
			files: ["test.js"]
		}], () => {
			expect(compilation.errors.length).toBe(0);
		});
	});

	it("outputs warnings for unreachable code", () => {
		compilationEventBinding.handler([{
			files: ["test.js", "test1.js"]
		}], () => {
			expect(compilation.warnings.length).toBe(1);
			expect(compilation.warnings[0]).toBeInstanceOf(Error);
			expect(compilation.warnings[0].message).toEqual(expect.stringContaining("Dropping unreachable code"));
		});
	});

	describe("normalizes when options.extractComments is regex", () => {
		const pluginEnvironment = new PluginEnvironment();
		const compilerEnv = pluginEnvironment.getEnvironmentStub();
		compilerEnv.context = "";

		const plugin = new UglifyJsPlugin({
			comments: false,
			extractComments: /foo/
		});
		plugin.apply(compilerEnv);
		let eventBinding = pluginEnvironment.getEventBindings()[0];
		let chunkPluginEnvironment = new PluginEnvironment();
		const compilation = chunkPluginEnvironment.getEnvironmentStub();
		compilation.assets = {
			"test.js": {
				source: () => {
					return "var foo = 1;";
				}
			}
		};
		compilation.errors = [];

		eventBinding.handler(compilation);
		const compilationEventBinding = chunkPluginEnvironment.getEventBindings()[0];

		compilationEventBinding.handler([{
			files: ["test.js"]
		}], () => {
			expect(compilation.errors.length).toBe(0);
		});
	});

	describe("converts boolean options.extractComments.condition to function", () => {
		const pluginEnvironment = new PluginEnvironment();
		const compilerEnv = pluginEnvironment.getEnvironmentStub();
		compilerEnv.context = "";

		const plugin = new UglifyJsPlugin({
			comments: false,
			extractComments: {
				condition: true,
				filename: function(file) {
					return file.replace(/(\.\w+)$/, ".license$1");
				},
				banner: function(licenseFile) {
					return "License information can be found in " + licenseFile;
				}
			}
		});
		plugin.apply(compilerEnv);
		let eventBinding = pluginEnvironment.getEventBindings()[0];
		let chunkPluginEnvironment = new PluginEnvironment();
		const compilation = chunkPluginEnvironment.getEnvironmentStub();
		compilation.assets = {
			"test.js": {
				source: () => {
					return "var foo = 1;";
				}
			}
		};
		compilation.errors = [];

		eventBinding.handler(compilation);
		const compilationEventBinding = chunkPluginEnvironment.getEventBindings()[0];

		compilationEventBinding.handler([{
			files: ["test.js"]
		}], () => {
			expect(compilation.errors.length).toBe(0);
		});
	});
});
