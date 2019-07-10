
"use strict";

// deps

	const { Server } = require("node-pluginsmanager-plugin");

// module

module.exports = class ServerGoodPluginWithoutDependencies extends Server {

	init (data) {

		return super.init(data).then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies|Server] - init" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	release (data) {

		return super.release().then(() => {

			(0, console).log(
				" => [TestGoodPluginWithoutDependencies|Server] - release" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

};
