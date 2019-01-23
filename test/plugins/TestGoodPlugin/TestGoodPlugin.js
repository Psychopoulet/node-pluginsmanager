
"use strict";

module.exports = class TestGoodPlugin extends require(require("path").join("..", "..", "..", "lib", "main.js")).plugin {

	// load

	load (data) {

		return super.load().then(() => {

			(0, console).log(" => [TestGoodPlugin] - load TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));

			return Promise.resolve();

		});

	}

	unload (data) {

		return super.unload().then(() => {

			(0, console).log(" => [TestGoodPlugin] - unload TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));

			return Promise.resolve();

		});

	}

	// write

	install (data) {

		return super.install().then(() => {

			(0, console).log(" => [TestGoodPlugin] - install TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));

			return Promise.resolve();

		});

	}

	update (data) {

		return super.update().then(() => {

			(0, console).log(" => [TestGoodPlugin] - update TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));

			return Promise.resolve();

		});

	}

	uninstall (data) {

		return super.uninstall().then(() => {

			(0, console).log(" => [TestGoodPlugin] - install TestGoodPlugin" + (data ? " with \"" + data + "\" data" : ""));

			return Promise.resolve();

		});

	}

};
