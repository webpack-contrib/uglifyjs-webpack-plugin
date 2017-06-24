"use strict";

const UglifyJsPlugin = require("../src/index");
const PluginEnvironment = require("./helpers").PluginEnvironment;
const cleanErrorStack = require("./helpers").cleanErrorStack;
const createCompiler = require("./helpers").createCompiler;
const compile = require("./helpers").compile;

describe("when applied with invalid options", () => {
	it("matches snapshot", () => {
		const compiler = createCompiler();
		new UglifyJsPlugin({
			output: {
				"invalid-option": true
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

	it("outputs uglify errors", () => {
		const pluginEnvironment = new PluginEnvironment();
		const compilerEnv = pluginEnvironment.getEnvironmentStub();
		compilerEnv.context = "";

		const plugin = new UglifyJsPlugin({
			output: {
				"invalid-option": true
			}
		});
		plugin.apply(compilerEnv);
		const eventBinding = pluginEnvironment.getEventBindings()[0];

		const chunkPluginEnvironment = new PluginEnvironment();
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
			expect(compilation.errors.length).toBe(1);
			expect(compilation.errors[0]).toBeInstanceOf(Error);
			expect(compilation.errors[0].message).toEqual(expect.stringContaining("from UglifyJs"));
		});
	});
});
