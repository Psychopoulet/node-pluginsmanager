"use strict";

// deps

	// externals
	const { Orchestrator } = require("node-pluginsmanager-plugin");

// module

module.exports = function isOrchestrator (dataName, data) {

	if ("undefined" === typeof data) {
		return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
	}
	else if ("object" !== typeof data || !(data instanceof Orchestrator)) {
		return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not an Orchestrator"));
	}
	else {
		return Promise.resolve();
	}

};
