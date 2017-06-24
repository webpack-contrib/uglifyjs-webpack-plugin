"use strict";

const UglifyJsPlugin = require("../src/index");

describe("UglifyJsPlugin", () => {
	it("has apply function", () => {
		expect(typeof new UglifyJsPlugin().apply).toBe("function");
	});
});
