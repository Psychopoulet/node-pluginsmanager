
"use strict";

module.exports = class TestGoodPlugin extends require(require("path").join("..", "..", "..", "lib", "main.js")).plugin {

	// load

	load (data) {

		(0, console).log(" => [TestGoodPlugin] - load TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	unload (data) {

		super.unload();

		(0, console).log(" => [TestGoodPlugin] - unload TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	// write

	install (data) {

		(0, console).log(" => [TestGoodPlugin] - install TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	update (data) {
		
		(0, console).log(" => [TestGoodPlugin] - update TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	uninstall (data) {
		
		(0, console).log(" => [TestGoodPlugin] - install TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

};
