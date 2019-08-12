
"use strict";

// deps

	// externals
	const { Mediator } = require("node-pluginsmanager-plugin");

// module

module.exports = class MediatorGoodPluginWithoutDependencies extends Mediator {

	_initWorkSpace (data) {

		(0, console).log(
			" => [TestGoodPluginWithoutDependencies|Mediator] - init" + (data ? " with \"" + data + "\" data" : "")
		);

		return Promise.resolve();

	}

	_releaseWorkSpace (data) {

		(0, console).log(
			" => [TestGoodPluginWithoutDependencies|Mediator] - release" + (data ? " with \"" + data + "\" data" : "")
		);

		return Promise.resolve();

	}

};
