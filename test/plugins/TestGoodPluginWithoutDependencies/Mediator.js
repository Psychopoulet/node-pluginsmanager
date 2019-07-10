
"use strict";

// deps

	const { Mediator } = require("node-pluginsmanager-plugin");

// module

module.exports = class MediatorGoodPluginWithoutDependencies extends Mediator {

	init (data) {

		return super.init(data).then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies|Mediator] - init" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	release (data) {

		return super.release().then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies|Mediator] - release" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

};
