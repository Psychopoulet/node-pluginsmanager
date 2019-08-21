"use strict";

// deps

	// natives
	const { join } = require("path");
	const Events = require("events");

	// locals
	const isFunction = require(join(__dirname, "isFunction.js"));

// module

module.exports = function isOrchestrator (dataName, data) {

	if ("undefined" === typeof data) {
		return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
	}
		else if ("object" !== typeof data || !(data instanceof Events)) {
			return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not an Event"));
		}

	else {

		return isFunction("isOrchestrator/load", data.load).then(() => {
			return isFunction("isOrchestrator/destroy", data.destroy);
		}).then(() => {
			return isFunction("isOrchestrator/init", data.init);
		}).then(() => {
			return isFunction("isOrchestrator/release", data.release);
		}).then(() => {
			return isFunction("isOrchestrator/install", data.install);
		}).then(() => {
			return isFunction("isOrchestrator/update", data.update);
		}).then(() => {
			return isFunction("isOrchestrator/uninstall", data.uninstall);
		});

	}

};
