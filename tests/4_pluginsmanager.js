"use strict";

// deps

	const { join } = require("path");
	const assert = require("assert");

	const { isDirectoryProm, mkdirpProm, rmdirpProm, unlinkProm, writeFileProm } = require("node-promfs");

	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));
// const

	const MAX_TIMOUT = 30 * 1000;

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const PLUGINS_TMP_DIRECTORY = join(PLUGINS_DIRECTORY, "tmp");
		const EMPTY_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestEmptyPlugin");
		const GOOD_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestGoodPlugin");
			const GOOD_PLUGIN_MODULES_DIRECTORY = join(GOOD_PLUGIN_DIRECTORY, "node_modules");

// tests

describe("main", () => {

	describe("constructor", () => {

		it("should test empty params", () => {

			const pluginsManager = new PluginsManager();

			// private
			assert.strictEqual(pluginsManager._beforeLoadAll, null, "Generated plugin is not as expected");
			assert.deepStrictEqual(pluginsManager._orderedDirectoriesBaseNames, [], "Generated plugin is not as expected");
			assert.strictEqual(pluginsManager._maxListeners, 0, "Generated plugin is not as expected");

			// public
			assert.strictEqual(pluginsManager.directory, join(__dirname, "..", "lib", "plugins"), "Generated plugin is not as expected");
			assert.deepStrictEqual(pluginsManager.plugins, [], "Generated plugin is not as expected");

		});

		it("should test given directory", () => {

			const pluginsManager = new PluginsManager(join(__dirname, "plugins2"));

			// private
			assert.strictEqual(pluginsManager._beforeLoadAll, null, "Generated plugin is not as expected");
			assert.deepStrictEqual(pluginsManager._orderedDirectoriesBaseNames, [], "Generated plugin is not as expected");
			assert.strictEqual(pluginsManager._maxListeners, 0, "Generated plugin is not as expected");

			// public
			assert.strictEqual(pluginsManager.directory, join(__dirname, "plugins2"), "Generated plugin is not as expected");
			assert.deepStrictEqual(pluginsManager.plugins, [], "Generated plugin is not as expected");

		});

	});

	describe("events", () => {

		const pluginsManager = new PluginsManager();

		before(() => {

			pluginsManager.directory = PLUGINS_TMP_DIRECTORY;

			return rmdirpProm(PLUGINS_TMP_DIRECTORY).then(() => {
				return pluginsManager.unloadAll();
			});

		});

		after(() => {

			return rmdirpProm(PLUGINS_TMP_DIRECTORY).then(() => {
				return pluginsManager.unloadAll();
			});

		});

		it("should test not existing directory without event", () => {
			return pluginsManager.loadAll();
		});

		it("should test not existing directory with events", () => {

			// errors

			return pluginsManager.on("error", (msg) => {
				(0, console).log("--- [PluginsManager/events/error] \"" + msg + "\" ---");
			})

			// load

			.on("loaded", (plugin) => {
				(0, console).log("--- [PluginsManager/events/loaded] \"" + plugin.name + "\" (v" + plugin.version + ") loaded ---");
			}).on("allloaded", () => {
				(0, console).log("--- [PluginsManager/events/allloaded] ---");
			}).on("unloaded", (plugin) => {
				(0, console).log("--- [PluginsManager/events/unloaded] \"" + plugin.name + "\" (v" + plugin.version + ") unloaded ---");
			}).on("allunloaded", () => {
				(0, console).log("--- [PluginsManager/events/allunloaded] ---");
			})

			// write

			.on("installed", (plugin) => {
				(0, console).log("--- [PluginsManager/events/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
			}).on("updated", (plugin) => {
				(0, console).log("--- [PluginsManager/events/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
			}).on("uninstalled", (plugin) => {
				(0, console).log("--- [PluginsManager/events/uninstalled] \"" + plugin.name + "\" uninstalled ---");
			}).loadAll();

		});

	});

	describe("public", () => {

		const pluginsManager = new PluginsManager();

		describe("loadByDirectory", () => {

			before(() => {
				pluginsManager.directory = PLUGINS_DIRECTORY;
				return pluginsManager.unloadAll();
			});

			after(() => {
				return pluginsManager.unloadAll();
			});

			it("should test without directory", (done) => {

				pluginsManager.loadByDirectory(false).then(() => {
					done(new Error("Wrong file plugin used"));
				}).catch((err) => {

					assert.strictEqual(typeof err, "object", "Generated error is not an object");
					assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test wrong file plugin", (done) => {

				pluginsManager.loadByDirectory(false).then(() => {
					done(new Error("Wrong file plugin used"));
				}).catch((err) => {

					assert.strictEqual(typeof err, "object", "Generated error is not an object");
					assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test file plugin", () => {

				const sFilePlugin = join(PLUGINS_DIRECTORY, "TestFilePlugin.txt");

				return writeFileProm(sFilePlugin, "").then(() => {
					return pluginsManager.loadByDirectory(sFilePlugin);
				}).then(() => {

					assert.deepStrictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
					assert.strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
					assert.strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

					return Promise.resolve();

				}).then(() => {
					return unlinkProm(sFilePlugin);
				});

			});

			it("should test empty plugin", () => {

				return mkdirpProm(EMPTY_PLUGIN_DIRECTORY).then(() => {
					return pluginsManager.loadByDirectory(EMPTY_PLUGIN_DIRECTORY);
				}).then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(
							err.message,
							"\"TestEmptyPlugin\" => Cannot find module '" + EMPTY_PLUGIN_DIRECTORY + "'",
							"this is not the expected message"
						);

						assert.deepStrictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
						assert.strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
						assert.strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

						resolve();

					});

				}).then(() => {
					return rmdirpProm(EMPTY_PLUGIN_DIRECTORY);
				});

			});

		});

		describe("getPluginsNames", () => {

			before(() => {
				pluginsManager.directory = PLUGINS_DIRECTORY;
				return pluginsManager.unloadAll();
			});

			after(() => {
				return pluginsManager.unloadAll();
			});

			it("should check plugins names before loading", () => {

				const pluginsNames = pluginsManager.getPluginsNames();

				assert.strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
				assert.strictEqual(pluginsNames instanceof Array, true, "plugins names is not an Array");
				assert.strictEqual(pluginsNames.length, 0, "plugins names length is incorrect");

			});

			it("should test normal loading", () => {

				return pluginsManager.loadAll().then(() => {

					assert.strictEqual(pluginsManager.plugins instanceof Array, true, "loaded plugins are incorrects");
					assert.strictEqual(pluginsManager.plugins.length, 2, "loaded plugins are incorrects");

					assert.strictEqual(pluginsManager.plugins.length, 2, "loaded plugins are incorrects");

					return Promise.resolve();

				}).then(() => {
					return pluginsManager.unloadAll();
				});

			});

			it("should check plugins names after loading", () => {

				const pluginsNames = pluginsManager.getPluginsNames();

				assert.strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
				assert.strictEqual(pluginsNames instanceof Array, true, "plugins names is not an Array");
				assert.strictEqual(pluginsNames.length, 1, "plugins names length is incorrect");
				assert.strictEqual(pluginsNames[0], "TestGoodPlugin", "first plugin name is incorrect");

			});

		});

		describe("loadAll & setOrder", () => {

			beforeEach(() => {
				pluginsManager.directory = PLUGINS_DIRECTORY;
				return pluginsManager.unloadAll();
			});

			afterEach(() => {
				pluginsManager._orderedDirectoriesBaseNames = [];
				return pluginsManager.unloadAll();
			});

			it("should load without directory", (done) => {

				const saveDirectory = pluginsManager.directory;
				pluginsManager.directory = "";

				pluginsManager.loadAll().then(() => {
					done(new Error("Inexistant directory used"));
				}).catch((err) => {

					assert.strictEqual(typeof err, "object", "Generated error is not an object");
					assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

					pluginsManager.directory = saveDirectory;

					done();

				});

			});

			it("should add empty order", () => {

				return pluginsManager.setOrder().then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(err.message, "This is not an array", "this is not the expected message");

						resolve();

					});

				});

			});

			it("should add wrong order", () => {

				return pluginsManager.setOrder(false).then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(err.message, "This is not an array", "this is not the expected message");

						resolve();

					});

				});

			});

			it("should add normal order with wrong directories basenames", () => {

				return pluginsManager.setOrder([ false, false ]).then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(
							err.message,
							"The directory at index \"0\" must be a string\r\nThe directory at index \"1\" must be a string",
							"this is not the expected message"
						);

						resolve();

					});

				});

			});

			it("should add normal order with empty directories basenames", () => {

				return pluginsManager.setOrder([ "", "" ]).then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(
							err.message,
							"The directory at index \"0\" must be not empty\r\nThe directory at index \"1\" must be not empty",
							"this is not the expected message"
						);

						resolve();

					});

				});

			});

			it("should add normal order with normal directories basenames", () => {
				return pluginsManager.setOrder([ "TestGoodPlugin" ]);
			});

			it("should test normal loading with order and twice the same plugin", () => {

				return pluginsManager.setOrder([ "TestGoodPlugin", "TestGoodPlugin" ]).then(() => {
					return pluginsManager.loadAll();
				}).then(() => {

					assert.strictEqual(pluginsManager.plugins.length, 2, "too much plugins loaded");

					return Promise.resolve();

				});

			});

			it("should test normal loading with order", () => {

				return pluginsManager.setOrder([ "TestGoodPluginWithoutDependencies", "TestGoodPlugin" ]).then(() => {

					let i = 0;
					pluginsManager.on("load", (plugin) => {

						if (0 === i) {
							assert.strictEqual(plugin.name, "TestGoodPluginWithoutDependencies", "loaded plugins are incorrects");
						}
						else if (1 === i) {
							assert.strictEqual(plugin.name, "TestGoodPlugin", "loaded plugins are incorrects");
						}

						++i;

					});

					return Promise.resolve();

				}).then(() => {
					return pluginsManager.loadAll();
				}).then(() => {

					return new Promise((resolve) => {

						assert.strictEqual(pluginsManager.plugins instanceof Array, true, "loaded plugins are incorrects");
						assert.strictEqual(pluginsManager.plugins.length, 2, "loaded plugins are incorrects");

						// TestGoodPlugin

						assert.strictEqual("object" === typeof pluginsManager.plugins[0], true, "loaded plugins are incorrects");
							assert.deepStrictEqual(pluginsManager.plugins[0].authors, [ "Sébastien VIDAL" ], "loaded plugins are incorrects");

							assert.deepStrictEqual(
								pluginsManager.plugins[0].dependencies, { "simpletts": "^1.4.1" }, "loaded plugins are incorrects"
							);

							assert.deepStrictEqual(
								pluginsManager.plugins[0].description, "A test for node-pluginsmanager", "loaded plugins are incorrects"
							);

							assert.deepStrictEqual(pluginsManager.plugins[0].name, "TestGoodPlugin", "loaded plugins are incorrects");

						// TestGoodPluginWithoutDependencies

						assert.strictEqual("object" === typeof pluginsManager.plugins[1], true, "loaded plugins are incorrects");
							assert.deepStrictEqual(pluginsManager.plugins[1].authors, [ "Sébastien VIDAL", "test" ], "loaded plugins are incorrects");
							assert.deepStrictEqual(pluginsManager.plugins[1].dependencies, { }, "loaded plugins are incorrects");
							assert.deepStrictEqual(
								pluginsManager.plugins[1].description, "A test for node-pluginsmanager", "loaded plugins are incorrects"
							);

							assert.deepStrictEqual(
								pluginsManager.plugins[1].name, "TestGoodPluginWithoutDependencies", "loaded plugins are incorrects"
							);

						resolve();

					});

				});

			});

		});

		describe("install via github", () => {

			before(() => {
				pluginsManager.directory = PLUGINS_DIRECTORY;
				return pluginsManager.unloadAll();
			});

			after(() => {

				return rmdirpProm(join(PLUGINS_DIRECTORY, "node-containerpattern")).then(() => {
					return pluginsManager.unloadAll();
				});

			});

			it("should test download an empty url", () => {

				pluginsManager.installViaGithub("").then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(err.message, "\"url\" is empty", "this is not the expected message");

						resolve();

					});

				});

			}).timeout(MAX_TIMOUT);

			it("should test download an invalid github url", () => {

				return pluginsManager.installViaGithub("test").then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(err.message, "\"test\" is not a valid github url", "this is not the expected message");

						resolve();

					});

				});

			}).timeout(MAX_TIMOUT);

			it("should test download an invalid node-containerpattern", () => {

				return pluginsManager.installViaGithub("https://github.com/Psychopoulet/node-containerpattern").then(() => {

					return Promise.reject(new Error("tests does not generate error"));

				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						assert.strictEqual(err.message, "\"node-containerpattern\" is not a plugin class", "this is not the expected message");

						resolve();

					});

				});

			}).timeout(MAX_TIMOUT);

		});

		describe("load", () => {

			before(() => {
				pluginsManager.directory = PLUGINS_DIRECTORY;
				return pluginsManager.unloadAll();
			});

			after(() => {
				return pluginsManager.unloadAll();
			});

			it("should load good plugin", () => {

				return new Promise((resolve) => {

					assert.strictEqual(pluginsManager.plugins.length, 0, "Loaded plugins length is no correct");
					resolve();

				}).then(() => {

					return pluginsManager.loadByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {

						assert.strictEqual(plugin.name, "TestGoodPlugin", "Loaded plugin name is no correct");
						assert.strictEqual(pluginsManager.plugins.length, 1, "Loaded plugins length is no correct");

						assert.deepStrictEqual(plugin.authors, [ "Sébastien VIDAL" ], "Loaded plugin's authors is not correct");
						assert.strictEqual(plugin.description, "A test for node-pluginsmanager", "Loaded plugin's description is not correct");

						assert.deepStrictEqual(
							plugin.designs,
							[ join(GOOD_PLUGIN_DIRECTORY, "design.css") ],
							"Loaded plugin's designs is not correct"
						);

						assert.strictEqual(
							plugin.directory, GOOD_PLUGIN_DIRECTORY, "Loaded plugin's directory is not correct"
						);

						assert.strictEqual(plugin.github, "", "Loaded plugin's github is not correct");

						assert.deepStrictEqual(
							plugin.javascripts,
							[ join(GOOD_PLUGIN_DIRECTORY, "javascript.js") ],
							"Loaded plugin's javascripts is not correct"
						);

						assert.strictEqual(plugin.license, "ISC", "Loaded plugin's license is not correct");
						assert.strictEqual(plugin.name, "TestGoodPlugin", "Loaded plugin's name is not correct");

						assert.deepStrictEqual(
							plugin.templates,
							[ join(GOOD_PLUGIN_DIRECTORY, "template.html") ],
							"Loaded plugin's templates is not correct"
						);

						assert.strictEqual(plugin.version, "0.0.2", "Loaded plugin's version is not correct");

					});

				});

			});

			it("should unload good plugin", () => {

				return new Promise((resolve) => {

					assert.strictEqual(pluginsManager.plugins.length, 1, "Loaded plugins length is no correct");

					resolve();

				}).then(() => {

					if (0 < pluginsManager.plugins.length) {

						return pluginsManager.plugins[0].unload("test").then(() => {
							pluginsManager.plugins.splice(0, 1); return Promise.resolve();
						});

					}
					else {
						return Promise.resolve();
					}

				});

			});

			it("should load all", () => {

				return pluginsManager.loadAll("test").then(() => {
					assert.strictEqual(pluginsManager.plugins.length, 2, "Loaded plugins length is no correct");
				});

			});

		});

		describe("beforeLoadAll", () => {

			before(() => {
				pluginsManager.directory = PLUGINS_DIRECTORY;
				return pluginsManager.unloadAll();
			});

			after(() => {
				return pluginsManager.unloadAll();
			});

			it("should fail on beforeLoadAll creation", () => {

				return pluginsManager.beforeLoadAll(false).then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						resolve();

					});

				});

			});

			it("should fail on beforeLoadAll call", () => {

				return pluginsManager.beforeLoadAll(() => {
					// nothing to do here
				}).then(() => {
					return pluginsManager.loadAll();
				}).then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
						resolve();

					});

				});

			});

			it("should success on beforeLoadAll call", () => {

				return pluginsManager.beforeLoadAll(() => {
					return Promise.resolve();
				}).then(() => {
					return pluginsManager.loadAll();
				});

			});

		});

		describe("unload", () => {

			describe("unloadByKey", () => {

				it("should unload without key", (done) => {

					pluginsManager.unloadByKey().then(() => {
						done(new Error("Missing key used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should unload with wrong key", (done) => {

					pluginsManager.unloadByKey(2000).then(() => {
						done(new Error("Wrong key used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

			});

			describe("unloadByDirectory", () => {

				it("should unload with inexistant directory", (done) => {

					pluginsManager.unloadByDirectory(join(__dirname, "teqfzqfzqevzqe")).then(() => {
						done(new Error("Inexistant directory used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should unload with wrong directory", (done) => {

					pluginsManager.unloadByDirectory(__dirname).then(() => {
						done(new Error("Wrong directory used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should unload with good directory", () => {

					return pluginsManager.loadByDirectory(GOOD_PLUGIN_DIRECTORY).then(() => {
						return pluginsManager.unloadByDirectory(GOOD_PLUGIN_DIRECTORY);
					});

				});

			});

			describe("unload", () => {

				it("should unload plugin without plugin", (done) => {

					pluginsManager.unload().then(() => {
						done(new Error("Empty plugin used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should unload plugin", () => {

					return pluginsManager.loadByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {
						return pluginsManager.unload(plugin);
					});

				});

			});

		});

		describe("install", () => {

			describe("installViaGithub", () => {

				it("should install via github with empty url", (done) => {

					pluginsManager.installViaGithub().then(() => {
						done(new Error("Empty url used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should install via github with wrong url", (done) => {

					pluginsManager.installViaGithub("github").then(() => {
						done(new Error("Wrong url used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should install via github with existing directory", (done) => {

					pluginsManager.installViaGithub("https://github/TestGoodPlugin").then(() => {
						done(new Error("Existing directory used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

			});

		});

		describe("update", () => {

			describe("update via github", () => {

				before(() => {
					pluginsManager.directory = PLUGINS_DIRECTORY;
					return pluginsManager.unloadAll();
				});

				after(() => {

					return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY).then(() => {
						return pluginsManager.unloadAll();
					});

				});

				it("should test update on an inexistant plugin", () => {

					return pluginsManager.updateByDirectory(join(pluginsManager.directory, "node-containerpattern")).then(() => {
						return Promise.reject(new Error("tests does not generate error"));
					}).catch((err) => {

						return new Promise((resolve) => {

							assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
							resolve();

						});

					});

				}).timeout(MAX_TIMOUT);

				it("should test update plugins and dependances", () => {

					return pluginsManager.loadAll().then(() => {
						return pluginsManager.updateByDirectory(GOOD_PLUGIN_DIRECTORY);
					}).then(() => {

						return isDirectoryProm(GOOD_PLUGIN_MODULES_DIRECTORY).then((exists) => {
							return exists ? Promise.resolve() : Promise.reject(new Error("There is no npm udpate performed"));
						});

					});

				}).timeout(MAX_TIMOUT);

			});

			describe("updateByKey", () => {

				after(() => {

					return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY).then(() => {
						return pluginsManager.unloadAll();
					});

				});

				it("should update with empty key", (done) => {

					pluginsManager.updateByKey().then(() => {
						done(new Error("Empty key used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should update with wrong key", (done) => {

					pluginsManager.updateByKey(2000).then(() => {
						done(new Error("Wrong key used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

			});

			describe("updateByDirectory", () => {

				after(() => {

					return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY).then(() => {
						return pluginsManager.unloadAll();
					});

				});

				it("should update with empty directory", (done) => {

					pluginsManager.updateByDirectory().then(() => {
						done(new Error("Empty directory used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

			});

			describe("update", () => {

				after(() => {

					return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY).then(() => {
						return pluginsManager.unloadAll();
					});

				});

				it("should update plugin without plugin", (done) => {

					pluginsManager.update().then(() => {
						done(new Error("Empty plugin used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should update plugin", () => {

					return pluginsManager.loadByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {
						return pluginsManager.update(plugin);
					});

				}).timeout(MAX_TIMOUT);

			});

		});

		describe("uninstall", () => {

			beforeEach(() => {
				return mkdirpProm(EMPTY_PLUGIN_DIRECTORY);
			});

			afterEach(() => {
				return rmdirpProm(EMPTY_PLUGIN_DIRECTORY);
			});

			describe("uninstallByKey", () => {

				it("should uninstall with empty key", (done) => {

					pluginsManager.uninstallByKey().then(() => {
						done(new Error("Empty key used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should uninstall with wrong key", (done) => {

					pluginsManager.uninstallByKey(2000).then(() => {
						done(new Error("Wrong key used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

			});

			describe("uninstallByDirectory", () => {

				it("should uninstall with empty directory", (done) => {

					pluginsManager.uninstallByDirectory().then(() => {
						done(new Error("Empty directory used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should uninstall inexistant plugin by directory", () => {
					return pluginsManager.uninstallByDirectory("szofuhzesifguhezifu");
				});

				it("should uninstall empty plugin by directory", () => {
					return pluginsManager.uninstallByDirectory(EMPTY_PLUGIN_DIRECTORY);
				});

			});

			describe("uninstall", () => {

				it("should uninstall plugin without plugin", (done) => {

					pluginsManager.uninstall().then(() => {
						done(new Error("Empty plugin used"));
					}).catch((err) => {

						assert.strictEqual(typeof err, "object", "Generated error is not an object");
						assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

						done();

					});

				});

				it("should uninstall plugin", () => {

					return writeFileProm(
						join(EMPTY_PLUGIN_DIRECTORY, "package.json"),
						JSON.stringify({
							"name": "test",
							"main": "TestEmptyPlugin.js"
						}),
						"utf8"
					).then(() => {

						return writeFileProm(
							join(EMPTY_PLUGIN_DIRECTORY, "TestEmptyPlugin.js"),
							"\n\"use strict\";" +
							"\n\nmodule.exports = class TestEmptyPlugin " +
							"extends require(require(\"path\").join(\"..\", \"..\", \"..\", \"lib\", \"main.js\")).plugin { };",
							"utf8"
						);

					}).then(() => {
						return pluginsManager.loadByDirectory(EMPTY_PLUGIN_DIRECTORY);
					}).then((plugin) => {
						return pluginsManager.uninstall(plugin);
					});

				});

			});

		});

	});

});
