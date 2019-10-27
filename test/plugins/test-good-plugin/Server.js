
"use strict";

// deps

	// externals
	const { Server } = require("node-pluginsmanager-plugin");

// module

module.exports = class ServerGoodPlugin extends Server {

	appMiddleware (req, res, next) {

		(0, console).log("ServerGoodPlugin", "appMiddleware");

		super.appMiddleware(req, res, next);

	}

};
