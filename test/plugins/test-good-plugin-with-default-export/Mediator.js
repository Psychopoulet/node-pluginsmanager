
"use strict";

// deps

	// externals
	const { Mediator } = require("node-pluginsmanager-plugin");

// module

module.exports = class MediatorGoodPluginWithDefaultExport extends Mediator {

	_initWorkSpace () {

		return Promise.resolve();

	}

	_releaseWorkSpace () {

		return Promise.resolve();

	}

};
