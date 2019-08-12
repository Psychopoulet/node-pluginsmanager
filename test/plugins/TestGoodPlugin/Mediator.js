
"use strict";

// deps

	// externals
	const { Mediator } = require("node-pluginsmanager-plugin");

// module

module.exports = class MediatorGoodPlugin extends Mediator {

	_initWorkSpace (data) {

		(0, console).log(
			" => [TestGoodPlugin|Mediator] - init" + (data ? " with \"" + data + "\" data" : "")
		);

		return Promise.resolve();

	}

	_releaseWorkSpace (data) {

		(0, console).log(
			" => [TestGoodPlugin|Mediator] - release" + (data ? " with \"" + data + "\" data" : "")
		);

		return Promise.resolve();

	}

};
