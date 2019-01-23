
"use strict";

module.exports = class TestGoodPluginWithoutDependencies extends require(require("path").join("..", "..", "..", "lib", "main.js")).plugin {

	// load

	load (data) {

		return super.load().then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies] - load TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	unload (data) {

		return super.unload().then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies] - unload TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	// write

	install (data) {

		return super.install().then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies] - install TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	update (data) {

		return super.update().then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies] - update TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	uninstall (data) {

		return super.uninstall().then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies] - install TestGoodPluginWithoutDependencies" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

};
