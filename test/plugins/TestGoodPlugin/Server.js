
"use strict";

// deps

	// natives
	const { parse } = require("url");

	// externals
	const { Server } = require("node-pluginsmanager-plugin");

// consts

	const REQUEST_PATHNAME = "/TestGoodPlugin";
	const RESPONSE_CODE = 201;
	const RESPONSE_CONTENT = "Hello World";

// module

module.exports = class ServerGoodPlugin extends Server {

	_initWorkSpace (data) {

		(0, console).log(
			" => [TestGoodPlugin|Server] - init" + (data ? " with \"" + data + "\" data" : "")
		);

		return Promise.resolve();

	}

	_releaseWorkSpace (data) {

		(0, console).log(
			" => [TestGoodPlugin|Server] - release" + (data ? " with \"" + data + "\" data" : "")
		);

		return Promise.resolve();

	}

	appMiddleware (req, res, next) {

		switch (req.url) {

			case REQUEST_PATHNAME:

				res.status(RESPONSE_CODE).send(RESPONSE_CONTENT);

			break;

			default:
				return next();

		}

		return null;

	}

	httpMiddleware (req, res) {

		const { pathname } = parse(req.url);

		if (REQUEST_PATHNAME === pathname) {

			res.writeHead(RESPONSE_CODE, { "Content-Type": "text/html; charset=utf-8" });
			res.end(RESPONSE_CONTENT, "utf-8");

			return true;

		}

		return false;

	}

};
