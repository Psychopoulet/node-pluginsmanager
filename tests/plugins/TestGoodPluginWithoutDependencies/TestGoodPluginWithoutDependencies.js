
"use strict";

module.exports = class TestGoodPluginWithoutDependencies extends require(require("path").join("..", "..", "..", "lib", "main.js")).plugin {

	// load

	load (data) {

		(0, console).log(" => [TestGoodPluginWithoutDependencies] - load TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	unload (data) {

		super.unload();

		(0, console).log(" => [TestGoodPluginWithoutDependencies] - unload TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	// write

	install (data) {

		(0, console).log(" => [TestGoodPluginWithoutDependencies] - install TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	update (data) {
		
		(0, console).log(" => [TestGoodPluginWithoutDependencies] - update TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

	uninstall (data) {
		
		(0, console).log(" => [TestGoodPluginWithoutDependencies] - install TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : ""));
		return Promise.resolve();

	}

};
