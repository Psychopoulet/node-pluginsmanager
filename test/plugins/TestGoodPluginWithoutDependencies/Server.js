
"use strict";

// deps

	// natives
	const { parse } = require("url");

	// externals
	const { Server } = require("node-pluginsmanager-plugin");

// consts

	const REQUEST_PATHNAME = "/TestGoodPluginWithoutDependencies";
	const RESPONSE_CODE = 200;
	const RESPONSE_CONTENT = "Hello World";

// module

module.exports = class ServerGoodPluginWithoutDependencies extends Server {

	_initWorkSpace () {

		return Promise.resolve();

	}

	_releaseWorkSpace () {

		return Promise.resolve();

	}

	appMiddleware (req, res, next) {

		switch (req.url) {

			case REQUEST_PATHNAME:

				res.writeHead(RESPONSE_CODE, {
					"Content-Type": "text/plain; charset=utf-8"
				});

				res.end(RESPONSE_CONTENT);

			break;

			default:
				return next();

		}

		return null;

	}

	httpMiddleware (req, res) {

		const { pathname } = parse(req.url);

		if (REQUEST_PATHNAME === pathname) {

			res.writeHead(RESPONSE_CODE, {
				"Content-Type": "text/plain; charset=utf-8"
			});

			res.end(RESPONSE_CONTENT);

			return true;

		}

		return false;

	}

};
