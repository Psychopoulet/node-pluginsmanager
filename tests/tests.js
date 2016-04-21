"use strict";

// deps

	const 	path = require('path'),
			SimplePluginsManager = require('../main.js');

// private

	var oPluginsManager = new SimplePluginsManager();

// tests

	function testErrorsLoad() {

		return new Promise(function(resolve, reject) {

			try {

				console.log("");
				console.log("----------------");
				console.log("test errors load");
				console.log("----------------");
				console.log("");

				console.log("must be == 'SimplePluginsManager/loadAll : '<path>' does not exist.' :");

				oPluginsManager.loadAll().then(reject).catch(function(err) {

					console.log(err);

					console.log("");
					console.log("----------------");
					console.log("");

					resolve();

				});

			}
			catch(e) {
				reject((e.message) ? e.message : e);
			}

		});

	}

	function testErrorsEmptyPlugin() {

		return new Promise(function(resolve, reject) {

			try {

				let sEmptyPlugin = path.join(oPluginsManager.directory, 'TestEmptyPlugin');

				console.log("");
				console.log("----------------");
				console.log("test errors empty plugin");
				console.log("----------------");
				console.log("");

				require('simplefs').mkdirpProm(sEmptyPlugin).then(function() {

					console.log("must be == 'SimplePluginsManager/loadByDirectory : 'Cannot find module '<path>''");
					oPluginsManager.loadByDirectory(sEmptyPlugin).then(reject).catch(function(err) {

						console.log(err);

						console.log("");
						console.log("must be == ''<name>' uninstalled'");
						oPluginsManager.uninstallByDirectory(sEmptyPlugin).then(function (name) {

							console.log("'" + name + "' uninstalled");

							console.log("");
							console.log("----------------");
							console.log("");

							resolve();

						}).catch(reject);

					});


				}).catch(reject);

			}
			catch(e) {
				reject((e.message) ? e.message : e);
			}

		});

	}

	function testErrorsInstallation() {

		return new Promise(function(resolve, reject) {

			try {

				console.log("");
				console.log("----------------");
				console.log("test errors installation");
				console.log("----------------");
				console.log("");

				console.log("must be == 'SimplePluginsManager/installViaGithub : '' is not a valid github url.' :");
				oPluginsManager.installViaGithub('').then(reject).catch(function(err) {

					console.log(err);

					console.log("");
					console.log("must be == 'SimplePluginsManager/installViaGithub : '<path>' is not a SimplePlugin class' :");
					oPluginsManager.installViaGithub('https://github.com/Psychopoulet/simplecontainer').then(reject).catch(function(err) {

						console.log(err);

						console.log("");
						console.log("----------------");
						console.log("");

						resolve();

					});

				});

			}
			catch(e) {
				reject((e.message) ? e.message : e);
			}

		});

	}

	function testErrorsUpdate() {

		return new Promise(function(resolve, reject) {

			try {

				console.log("");
				console.log("----------------");
				console.log("test errors update");
				console.log("----------------");
				console.log("");

				console.log("must be == 'SimplePluginsManager/updateByDirectory : there is no '<path>' plugins' directory. :");
				oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, 'simplefs')).then(reject).catch(function(err) {
					
					console.log(err);

					console.log("");
					console.log("----------------");
					console.log("");

					resolve();

				});

			}
			catch(e) {
				reject((e.message) ? e.message : e);
			}

		});

	}

	function testErrorsUninstall() {

		return new Promise(function(resolve, reject) {

			try {

				console.log("");
				console.log("----------------");
				console.log("test errors uninstall");
				console.log("----------------");
				console.log("");

				console.log("must be == 'simplefs' uninstalled :");
				oPluginsManager.uninstallByDirectory(path.join(oPluginsManager.directory, 'simplefs')).then(function(pluginName) {

					console.log(pluginName + ' uninstalled');

					console.log("");
					console.log("----------------");
					console.log("");

					resolve();

				}).catch(reject);

			}
			catch(e) {
				reject((e.message) ? e.message : e);
			}

		});

	}

	function testLoads() {

		return new Promise(function(resolve, reject) {

			try {

				console.log("");
				console.log("----------------");
				console.log("test loads");
				console.log("----------------");
				console.log("");

				console.log("must be == 'load TestGoodPlugin with 'test' data' :");
				oPluginsManager.loadByDirectory(path.join(oPluginsManager.directory, 'TestGoodPlugin'), 'test').then(function(plugin) {

					console.log("");
					console.log("must be == 1 :", oPluginsManager.plugins.length);

					console.log("");
					console.log("must be == 'unload TestGoodPlugin with 'test' data' :");

					return plugin.unload('test');

				}).then(function() {

					console.log("");
					console.log("must be == 'load TestGoodPlugin with 'test' data' and 'all loaded' :");

					return oPluginsManager.loadAll('test');

				}).then(function() {
					
					console.log("all loaded");

					console.log("");
					console.log("----------------");
					console.log("");

					resolve();

				}).catch(reject);

			}
			catch(e) {
				reject((e.message) ? e.message : e);
			}

		});

	}

// run

	oPluginsManager

		.on('error', function(msg) {
			console.log("--- [event/error] '" + msg + "' ---");
		})

		// load

		.on('loaded', function(plugin) {
			console.log("--- [event/loaded] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
		})
		.on('allloaded', function() {
			console.log("--- [event/allloaded] ---");
		})
		.on('unloaded', function(plugin) {
			console.log("--- [event/unloaded] '" + plugin.name + "' (v" + plugin.version + ") unloaded ---");
		})

		// write

		.on('installed', function(plugin) {
			console.log("--- [event/installed] '" + plugin.name + "' (v" + plugin.version + ") installed ---");
		})
		.on('updated', function(plugin) {
			console.log("--- [event/updated] '" + plugin.name + "' (v" + plugin.version + ") updated ---");
		})
		.on('uninstalled', function(plugin) {
			console.log("--- [event/uninstalled] '" + plugin.name + "' uninstalled ---");
		});

	testErrorsLoad().then(function() {

		oPluginsManager.directory = path.join(__dirname, 'plugins');
		return testErrorsEmptyPlugin();

	}).then(function() {
		return testErrorsInstallation();
	}).then(function() {
		return testErrorsUpdate();
	}).then(function() {
		return testErrorsUninstall();
	}).then(function() {
		return testLoads();
	}).catch(function(err) {
		console.log('tests interruption', err);
	});
