
"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const { Orchestrator } = require("node-pluginsmanager-plugin");

// module

module.exports = class OrchestratorGoodPluginWithoutDependencies extends Orchestrator {

	constructor (options) {

		const opt = options || {};

		opt.packageFile = join(__dirname, "package.json");
		opt.mediatorFile = join(__dirname, "Mediator.js");
		opt.serverFile = join(__dirname, "Server.js");

		super(opt);

	}

	// load

	loadDataFromPackageFile () {

		return super.loadDataFromPackageFile().then(() => {

			(0, console).log(
				" => [OrchestratorGoodPluginWithoutDependencies] - loadDataFromPackageFile"
			);

			return Promise.resolve();

		});

	}

	init (data) {

		return super.init(data).then(() => {

			(0, console).log(
				" => [OrchestratorGoodPluginWithoutDependencies] - init TestGoodPlugin" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	release (data) {

		return super.release().then(() => {

			(0, console).log(
				" => [OrchestratorGoodPluginWithoutDependencies] - release" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	// write

	install (data) {

		return super.install().then(() => {

			(0, console).log(
				" => [OrchestratorGoodPluginWithoutDependencies] - install" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	update (data) {

		return super.update().then(() => {

			(0, console).log(
				" => [OrchestratorGoodPluginWithoutDependencies] - update" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

	uninstall (data) {

		return super.uninstall().then(() => {

			(0, console).log(
				" => [OrchestratorGoodPluginWithoutDependencies] - install" + (data ? " with \"" + data + "\" data" : "")
			);

			return Promise.resolve();

		});

	}

};
