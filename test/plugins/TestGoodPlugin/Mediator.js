
"use strict";

// deps

	// externals
	const { Mediator } = require("node-pluginsmanager-plugin");

// module

module.exports = class MediatorGoodPlugin extends Mediator {

	init (data) {

		return super.init(data).then(() => {

			(0, console).log(
				" => [TestGoodPlugin|Mediator] - init" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	release (data) {

		return super.release().then(() => {

			(0, console).log(
				" => [TestGoodPlugin|Mediator] - release" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

};
