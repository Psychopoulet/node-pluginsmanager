
"use strict";

// deps

	const { Server } = require("node-pluginsmanager-plugin");

// module

module.exports = class ServerGoodPlugin extends Server {

	init (data) {

		return super.init(data).then(() => {

			(0, console).log(
				" => [TestGoodPlugin|Server] - init" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	release (data) {

		return super.release().then(() => {

			(0, console).log(
				" => [TestGoodPlugin|Server] - release" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

};
