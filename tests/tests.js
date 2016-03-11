
"use strict";

const 	path = require('path'),
		fs = require('simplefs'),
		SimplePluginsManager = require('../main.js');

try {

	var oPluginsManager = new SimplePluginsManager();

	console.log("----------------");
	console.log("tests");
	console.log("----------------");
	console.log("");
	console.log("must be == 'SimplePluginsManager/loadAll : '<path>' does not exist.' :");

	oPluginsManager

		.on('error', function(msg) {
			console.log("--- [event/error] '" + msg + "' ---");
		})

		// load

		.on('loaded', function(plugin) {
			console.log("--- [event/loaded] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
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
		})

	.loadAll().then(function() {

		console.log('plugins loaded');

		console.log("----------------");
		console.log("");

	})
	.catch(function(err) {

		console.log(err);

		oPluginsManager.directory = path.join(__dirname, 'plugins');

		var sEmptyPlugin = path.join(oPluginsManager.directory, 'TestEmptyPlugin');

		fs.mkdirp(sEmptyPlugin);

		console.log("");
		console.log("must be == 'SimplePluginsManager/loadByDirectory : 'Cannot find module '<path>''");
		oPluginsManager.loadByDirectory(sEmptyPlugin).then(function() {
			console.log('loaded');
		})
		.catch(function(err) {

			console.log(err);

			fs.mkdirp(sEmptyPlugin);

			console.log("");
			console.log("must be == ''<name>' uninstalled'");
			oPluginsManager.uninstallByDirectory(sEmptyPlugin).then(function (name) {

				console.log("'" + name + "' uninstalled");

				console.log("");
				console.log("must be == 'SimplePluginsManager/installViaGithub : '' is not a valid github url.' :");
				oPluginsManager.installViaGithub('').then(function() {

					console.log('added');

					console.log("----------------");
					console.log("");

				}).catch(function(err) {

					console.log(err);

					console.log("");
					console.log("must be == 'SimplePluginsManager/installViaGithub : '<path>' is not a SimplePlugin class' :");
					oPluginsManager.installViaGithub('https://github.com/Psychopoulet/simplecontainer').then(function() {
						
						console.log('simplecontainer added');

						console.log("----------------");
						console.log("");

					}).catch(function(err) {

						console.log(err);

						oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, 'simplefs')).then(function (plugin) {

							console.log("'" + plugin.name +  "' updated");

							console.log("----------------");
							console.log("");

						})
						.catch(function(err) {
							
							oPluginsManager.uninstallByDirectory(path.join(oPluginsManager.directory, 'simplefs')).then(function () {

								console.log("");
								console.log("must be == [] :");
								console.log(oPluginsManager.plugins);

								console.log("----------------");
								console.log("");

							})
							.catch(function(err) {

								console.log(err);

								console.log("----------------");
								console.log("");

							});

						});

					});

				});

			})
			.catch(function(err) {

				console.log(err);

				console.log("----------------");
				console.log("");

			});

		});

	});

}
catch(e) {
	console.log(e);
}
