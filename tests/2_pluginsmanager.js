"use strict";

// deps

	const { join } = require("path");
	const assert = require("assert");

	const { isDirectoryProm, mkdirpProm, rmdirpProm, unlinkProm, writeFileProm } = require("node-promfs");

	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));
// const

	const MAX_TIMOUT = 30 * 1000;
	const PLUGINS_DIRECTORY = join(__dirname, "..", "plugins");

// private

	let pluginsManager = null;
	const testsPluginsDirectory = join(__dirname, "plugins");

// tests

describe("constructor", () => {

	it("should test empty params", () => {
		pluginsManager = new PluginsManager();
	});

	it("should test given directory", () => {
		pluginsManager = new PluginsManager(join(__dirname, "plugins"));
	});

});

describe("private", () => {

	describe("_createPluginByDirectory", () => {

		const notPlugin = join(testsPluginsDirectory, "TestNotPlugin");

		beforeEach(() => {

			return mkdirpProm(notPlugin).then(() => {
				return pluginsManager.unloadAll();
			});

		});

		afterEach(() => {

			return rmdirpProm(notPlugin).then(() => {
				return pluginsManager.unloadAll();
			});

		});

		it("should test wrong directory", (done) => {

			pluginsManager._createPluginByDirectory(join(__dirname, "oqnzoefnzeofn")).then(() => {
				done(new Error("Inexistant directory used"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				done();

			});

		});

		it("should test relative directory", (done) => {

			pluginsManager._createPluginByDirectory(".").then(() => {
				done(new Error("Relative directory used"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				done();

			});

		});

		it("should test not plugin directory", (done) => {

			writeFileProm(
				join(notPlugin, "package.json"),
				JSON.stringify({
					"name": "test",
					"main": "TestNotPlugin.js"
				}),
				"utf8"
			).then(() => {

				return writeFileProm(
					join(notPlugin, "TestNotPlugin.js"),
					"console.log(\"This is not a plugin\");",
					"utf8"
				);

			}).then(() => {
				return pluginsManager._createPluginByDirectory(notPlugin);
			}).then(() => {
				done(new Error("Relative directory used"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				done();

			});

		});

	});

	describe("_GIT", () => {

		it("should test wrong parameters", (done) => {

			pluginsManager._GIT([ "zfefzefzefz" ]).then(() => {
				done(new Error("Wrong parameters used"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				done();

			});

		}).timeout(MAX_TIMOUT);

	});

	describe("_NPM", () => {

		it("should test wrong parameters", (done) => {

			pluginsManager._NPM(__dirname, "zfefzefzefz").then(() => {
				done(new Error("Wrong parameters used"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				done();

			});

		}).timeout(MAX_TIMOUT);

	});

	describe("_stdToString", () => {

		it("should test number", () => {
			assert.strictEqual("1", pluginsManager._stdToString(1), "It does not generate the wanted string");
		});

		it("should test Buffer", () => {
			assert.strictEqual("Test", pluginsManager._stdToString(Buffer.from("Test", "ascii")), "It does not generate the wanted string");
		});

		it("should test Error", () => {
			assert.strictEqual("Test", pluginsManager._stdToString(new Error("Test")), "It does not generate the wanted string");
		});

		it("should test string", () => {
			assert.strictEqual("[object Object]", pluginsManager._stdToString({ "code": "Test" }), "It does not generate the wanted string");
		});

	});

});

describe("events", () => {

	before(() => {

		pluginsManager.directory = PLUGINS_DIRECTORY;

		return rmdirpProm(PLUGINS_DIRECTORY).then(() => {
			return pluginsManager.unloadAll();
		});

	});

	after(() => {

		return rmdirpProm(PLUGINS_DIRECTORY).then(() => {
			return pluginsManager.unloadAll();
		});

	});

	it("should test not existing directory without event", () => {
		return pluginsManager.loadAll();
	});

	it("should test not existing directory with events", () => {

		// errors

		return pluginsManager.on("error", (msg) => {
			(1, console).log("--- [PluginsManager/events/error] \"" + msg + "\" ---");
		})

		// load

		.on("loaded", (plugin) => {
			(1, console).log("--- [PluginsManager/events/loaded] \"" + plugin.name + "\" (v" + plugin.version + ") loaded ---");
		}).on("allloaded", () => {
			(1, console).log("--- [PluginsManager/events/allloaded] ---");
		}).on("unloaded", (plugin) => {
			(1, console).log("--- [PluginsManager/events/unloaded] \"" + plugin.name + "\" (v" + plugin.version + ") unloaded ---");
		}).on("allunloaded", () => {
			(1, console).log("--- [PluginsManager/events/allunloaded] ---");
		})

		// write

		.on("installed", (plugin) => {
			(1, console).log("--- [PluginsManager/events/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
		}).on("updated", (plugin) => {
			(1, console).log("--- [PluginsManager/events/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
		}).on("uninstalled", (plugin) => {
			(1, console).log("--- [PluginsManager/events/uninstalled] \"" + plugin.name + "\" uninstalled ---");
		}).loadAll();

	});

});

describe("public", () => {

	describe("loadByDirectory", () => {

		before(() => {
			pluginsManager.directory = testsPluginsDirectory;
			return pluginsManager.unloadAll();
		});

		after(() => {
			return pluginsManager.unloadAll();
		});

		it("should test without directory", (done) => {

			pluginsManager.loadByDirectory(false).then(() => {
				done(new Error("Wrong file plugin used"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				done();

			});

		});

		it("should test wrong file plugin", (done) => {

			pluginsManager.loadByDirectory(false).then(() => {
				done(new Error("Wrong file plugin used"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				done();

			});

		});

		it("should test file plugin", () => {

			const sFilePlugin = join(testsPluginsDirectory, "TestFilePlugin.txt");

			return writeFileProm(sFilePlugin, "").then(() => {
				return pluginsManager.loadByDirectory(sFilePlugin);
			}).then(() => {

				assert.deepStrictEqual("object", typeof pluginsManager.plugins, "plugins is not an object");
				assert.strictEqual(true, pluginsManager.plugins instanceof Array, "plugins is not an Array");
				assert.strictEqual(0, pluginsManager.plugins.length, "plugins length is not valid");

				return Promise.resolve();

			}).then(() => {
				return unlinkProm(sFilePlugin);
			});

		});

		it("should test empty plugin", () => {

			const sEmptyPluginDirectory = join(testsPluginsDirectory, "TestEmptyPlugin");

			return mkdirpProm(sEmptyPluginDirectory).then(() => {
				return pluginsManager.loadByDirectory(sEmptyPluginDirectory);
			}).then(() => {
				return Promise.reject(new Error("tests does not generate error"));
			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual(
						"\"TestEmptyPlugin\" => Cannot find module '" + sEmptyPluginDirectory + "'",
						err.message,
						"this is not the expected message"
					);

					assert.deepStrictEqual("object", typeof pluginsManager.plugins, "plugins is not an object");
					assert.strictEqual(true, pluginsManager.plugins instanceof Array, "plugins is not an Array");
					assert.strictEqual(0, pluginsManager.plugins.length, "plugins length is not valid");

					resolve();

				});

			}).then(() => {
				return rmdirpProm(sEmptyPluginDirectory);
			});

		});

	});

	describe("getPluginsNames", () => {

		before(() => {
			pluginsManager.directory = testsPluginsDirectory;
			return pluginsManager.unloadAll();
		});

		after(() => {
			return pluginsManager.unloadAll();
		});

		it("should check plugins names before loading", () => {

			const pluginsNames = pluginsManager.getPluginsNames();

			assert.strictEqual("object", typeof pluginsNames, "plugins names is not an object");
			assert.strictEqual(true, pluginsNames instanceof Array, "plugins names is not an Array");
			assert.strictEqual(0, pluginsNames.length, "plugins names length is incorrect");

		});

		it("should test normal loading", () => {

			return pluginsManager.loadAll().then(() => {

				assert.strictEqual(true, pluginsManager.plugins instanceof Array, "loaded plugins are incorrects");
				assert.strictEqual(2, pluginsManager.plugins.length, "loaded plugins are incorrects");

				assert.strictEqual(2, pluginsManager.plugins.length, "loaded plugins are incorrects");

				return Promise.resolve();

			}).then(() => {
				return pluginsManager.unloadAll();
			});

		});

		it("should check plugins names after loading", () => {

			const pluginsNames = pluginsManager.getPluginsNames();

			assert.strictEqual("object", typeof pluginsNames, "plugins names is not an object");
			assert.strictEqual(true, pluginsNames instanceof Array, "plugins names is not an Array");
			assert.strictEqual(1, pluginsNames.length, "plugins names length is incorrect");
			assert.strictEqual("TestGoodPlugin", pluginsNames[0], "first plugin name is incorrect");

		});

	});

	describe("loadAll & setOrder", () => {

		beforeEach(() => {
			pluginsManager.directory = testsPluginsDirectory;
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

				assert.strictEqual("object", typeof err, "Generated error is not an object");
				assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

				pluginsManager.directory = saveDirectory;

				done();

			});

		});

		it("should add empty order", () => {

			return pluginsManager.setOrder().then(() => {
				return Promise.reject(new Error("tests does not generate error"));
			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual("This is not an array", err.message, "this is not the expected message");

					resolve();

				});

			});

		});

		it("should add wrong order", () => {

			return pluginsManager.setOrder(false).then(() => {
				return Promise.reject(new Error("tests does not generate error"));
			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual("This is not an array", err.message, "this is not the expected message");

					resolve();

				});

			});

		});

		it("should add normal order with wrong directories basenames", () => {

			return pluginsManager.setOrder([ false, false ]).then(() => {
				return Promise.reject(new Error("tests does not generate error"));
			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual(
						"The directory at index \"0\" must be a string\r\nThe directory at index \"1\" must be a string",
						err.message,
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

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual(
						"The directory at index \"0\" must be not empty\r\nThe directory at index \"1\" must be not empty",
						err.message,
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

				assert.strictEqual(2, pluginsManager.plugins.length, "too much plugins loaded");

				return Promise.resolve();

			});

		});

		it("should test normal loading with order", () => {

			return pluginsManager.setOrder([ "TestGoodPluginWithoutDependencies", "TestGoodPlugin" ]).then(() => {

				let i = 0;
				pluginsManager.on("load", (plugin) => {

					if (0 === i) {
						assert.strictEqual("TestGoodPluginWithoutDependencies", plugin.name, "loaded plugins are incorrects");
					}
					else if (1 === i) {
						assert.strictEqual("TestGoodPlugin", plugin.name, "loaded plugins are incorrects");
					}

					++i;

				});

				return Promise.resolve();

			}).then(() => {
				return pluginsManager.loadAll();
			}).then(() => {

				return new Promise((resolve) => {

					assert.strictEqual(true, pluginsManager.plugins instanceof Array, "loaded plugins are incorrects");
					assert.strictEqual(2, pluginsManager.plugins.length, "loaded plugins are incorrects");

					// TestGoodPlugin

					assert.strictEqual(true, "object" === typeof pluginsManager.plugins[0], "loaded plugins are incorrects");
						assert.deepStrictEqual([ "Sébastien VIDAL" ], pluginsManager.plugins[0].authors, "loaded plugins are incorrects");
						assert.deepStrictEqual({ "simpletts": "^1.4.1" }, pluginsManager.plugins[0].dependencies, "loaded plugins are incorrects");
						assert.deepStrictEqual(
							"A test for node-pluginsmanager", pluginsManager.plugins[0].description, "loaded plugins are incorrects"
						);
						assert.deepStrictEqual("TestGoodPlugin", pluginsManager.plugins[0].name, "loaded plugins are incorrects");

					// TestGoodPluginWithoutDependencies

					assert.strictEqual(true, "object" === typeof pluginsManager.plugins[1], "loaded plugins are incorrects");
						assert.deepStrictEqual([ "Sébastien VIDAL", "test" ], pluginsManager.plugins[1].authors, "loaded plugins are incorrects");
						assert.deepStrictEqual({ }, pluginsManager.plugins[1].dependencies, "loaded plugins are incorrects");
						assert.deepStrictEqual(
							"A test for node-pluginsmanager", pluginsManager.plugins[1].description, "loaded plugins are incorrects"
						);
						assert.deepStrictEqual("TestGoodPluginWithoutDependencies", pluginsManager.plugins[1].name, "loaded plugins are incorrects");

					resolve();

				});

			});

		});

	});

	describe("install via github", () => {

		before(() => {
			pluginsManager.directory = testsPluginsDirectory;
			return pluginsManager.unloadAll();
		});

		after(() => {

			return rmdirpProm(join(testsPluginsDirectory, "node-containerpattern")).then(() => {
				return pluginsManager.unloadAll();
			});

		});

		it("should test download an empty url", () => {

			pluginsManager.installViaGithub("").then(() => {
				return Promise.reject(new Error("tests does not generate error"));
			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual("\"url\" is empty", err.message, "this is not the expected message");

					resolve();

				});

			});

		}).timeout(MAX_TIMOUT);

		it("should test download an invalid github url", () => {

			return pluginsManager.installViaGithub("test").then(() => {
				return Promise.reject(new Error("tests does not generate error"));
			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual("\"test\" is not a valid github url", err.message, "this is not the expected message");

					resolve();

				});

			});

		}).timeout(MAX_TIMOUT);

		it("should test download an invalid node-containerpattern", () => {

			return pluginsManager.installViaGithub("https://github.com/Psychopoulet/node-containerpattern").then(() => {

				return Promise.reject(new Error("tests does not generate error"));

			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
					assert.strictEqual("\"node-containerpattern\" is not a plugin class", err.message, "this is not the expected message");

					resolve();

				});

			});

		}).timeout(MAX_TIMOUT);

	});

	describe("load", () => {

		before(() => {
			pluginsManager.directory = testsPluginsDirectory;
			return pluginsManager.unloadAll();
		});

		after(() => {
			return pluginsManager.unloadAll();
		});

		it("should load good plugin", () => {

			return new Promise((resolve) => {

				assert.strictEqual(0, pluginsManager.plugins.length, "Loaded plugins length is no correct");
				resolve();

			}).then(() => {

				return pluginsManager.loadByDirectory(join(pluginsManager.directory, "TestGoodPlugin")).then((plugin) => {

					assert.strictEqual("TestGoodPlugin", plugin.name, "Loaded plugin name is no correct");
					assert.strictEqual(1, pluginsManager.plugins.length, "Loaded plugins length is no correct");

					assert.deepStrictEqual([ "Sébastien VIDAL" ], plugin.authors, "Loaded plugin's authors is not correct");
					assert.strictEqual("A test for node-pluginsmanager", plugin.description, "Loaded plugin's description is not correct");

					assert.deepStrictEqual(
						[ join(__dirname, "plugins", "TestGoodPlugin", "design.css") ],
						plugin.designs, "Loaded plugin's designs is not correct"
					);

					assert.strictEqual(join(__dirname, "plugins", "TestGoodPlugin"), plugin.directory, "Loaded plugin's directory is not correct");

					assert.strictEqual("", plugin.github, "Loaded plugin's github is not correct");

					assert.deepStrictEqual(
						[ join(__dirname, "plugins", "TestGoodPlugin", "javascript.js") ],
						plugin.javascripts,
						"Loaded plugin's javascripts is not correct"
					);

					assert.strictEqual("ISC", plugin.license, "Loaded plugin's license is not correct");
					assert.strictEqual("TestGoodPlugin", plugin.name, "Loaded plugin's name is not correct");

					assert.deepStrictEqual(
						[ join(__dirname, "plugins", "TestGoodPlugin", "template.html") ],
						plugin.templates,
						"Loaded plugin's templates is not correct"
					);

					assert.strictEqual("0.0.2", plugin.version, "Loaded plugin's version is not correct");

				});

			});

		});

		it("should unload good plugin", () => {

			return new Promise((resolve) => {

				assert.strictEqual(1, pluginsManager.plugins.length, "Loaded plugins length is no correct");

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
				assert.strictEqual(2, pluginsManager.plugins.length, "Loaded plugins length is no correct");
			});

		});

	});

	describe("beforeLoadAll", () => {

		before(() => {
			pluginsManager.directory = testsPluginsDirectory;
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

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");

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

					assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
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

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should unload with wrong key", (done) => {

				pluginsManager.unloadByKey(2000).then(() => {
					done(new Error("Wrong key used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

		});

		describe("unloadByDirectory", () => {

			it("should unload with inexistant directory", (done) => {

				pluginsManager.unloadByDirectory(join(__dirname, "teqfzqfzqevzqe")).then(() => {
					done(new Error("Inexistant directory used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should unload with wrong directory", (done) => {

				pluginsManager.unloadByDirectory(__dirname).then(() => {
					done(new Error("Wrong directory used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should unload with good directory", () => {

				const TestGoodPlugin = join(__dirname, "plugins", "TestGoodPlugin");

				return pluginsManager.loadByDirectory(TestGoodPlugin).then(() => {
					return pluginsManager.unloadByDirectory(TestGoodPlugin);
				});

			});

		});

		describe("unload", () => {

			it("should unload plugin without plugin", (done) => {

				pluginsManager.unload().then(() => {
					done(new Error("Empty plugin used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should unload plugin", () => {

				const TestGoodPlugin = join(__dirname, "plugins", "TestGoodPlugin");

				return pluginsManager.loadByDirectory(TestGoodPlugin).then((plugin) => {
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

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should install via github with wrong url", (done) => {

				pluginsManager.installViaGithub("github").then(() => {
					done(new Error("Wrong url used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should install via github with existing directory", (done) => {

				pluginsManager.installViaGithub("https://github/TestGoodPlugin").then(() => {
					done(new Error("Existing directory used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

		});

	});

	describe("update", () => {

		describe("update via github", () => {

			const TestGoodPluginDirectory = join(join(testsPluginsDirectory, "TestGoodPlugin"));
			const npmDirectory = join(TestGoodPluginDirectory, "node_modules");

			before(() => {
				pluginsManager.directory = testsPluginsDirectory;
				return pluginsManager.unloadAll();
			});

			after(() => {

				return rmdirpProm(npmDirectory).then(() => {
					return pluginsManager.unloadAll();
				});

			});

			it("should test update on an inexistant plugin", () => {

				return pluginsManager.updateByDirectory(join(pluginsManager.directory, "node-containerpattern")).then(() => {
					return Promise.reject(new Error("tests does not generate error"));
				}).catch((err) => {

					return new Promise((resolve) => {

						assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
						resolve();

					});

				});

			}).timeout(MAX_TIMOUT);

			it("should test update plugins and dependances", () => {

				return pluginsManager.loadAll().then(() => {
					return pluginsManager.updateByDirectory(TestGoodPluginDirectory);
				}).then(() => {

					return isDirectoryProm(npmDirectory).then((exists) => {

						if (exists) {
							return Promise.resolve();
						}
						else {
							return Promise.reject(new Error("There is no npm udpate performed"));
						}

					});

				});

			}).timeout(MAX_TIMOUT);

		});

		describe("updateByKey", () => {

			it("should update with empty key", (done) => {

				pluginsManager.updateByKey().then(() => {
					done(new Error("Empty key used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should update with wrong key", (done) => {

				pluginsManager.updateByKey(2000).then(() => {
					done(new Error("Wrong key used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

		});

		describe("updateByDirectory", () => {

			it("should update with empty directory", (done) => {

				pluginsManager.updateByDirectory().then(() => {
					done(new Error("Empty directory used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

		});

		describe("update", () => {

			it("should update plugin without plugin", (done) => {

				pluginsManager.update().then(() => {
					done(new Error("Empty plugin used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should update plugin", () => {

				const TestGoodPlugin = join(__dirname, "plugins", "TestGoodPlugin");

				return pluginsManager.loadByDirectory(TestGoodPlugin).then((plugin) => {
					return pluginsManager.update(plugin);
				});

			}).timeout(MAX_TIMOUT);

		});

	});

	describe("uninstall", () => {

		const sEmptyPlugin = join(testsPluginsDirectory, "TestEmptyPlugin");

		beforeEach(() => {
			return mkdirpProm(sEmptyPlugin);
		});

		afterEach(() => {
			return rmdirpProm(sEmptyPlugin);
		});

		describe("uninstallByKey", () => {

			it("should uninstall with empty key", (done) => {

				pluginsManager.uninstallByKey().then(() => {
					done(new Error("Empty key used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should uninstall with wrong key", (done) => {

				pluginsManager.uninstallByKey(2000).then(() => {
					done(new Error("Wrong key used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

		});

		describe("uninstallByDirectory", () => {

			it("should uninstall with empty directory", (done) => {

				pluginsManager.uninstallByDirectory().then(() => {
					done(new Error("Empty directory used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should uninstall inexistant plugin by directory", () => {
				return pluginsManager.uninstallByDirectory("szofuhzesifguhezifu");
			});

			it("should uninstall empty plugin by directory", () => {
				return pluginsManager.uninstallByDirectory(sEmptyPlugin);
			});

		});

		describe("uninstall", () => {

			it("should uninstall plugin without plugin", (done) => {

				pluginsManager.uninstall().then(() => {
					done(new Error("Empty plugin used"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "Generated error is not an object");
					assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

					done();

				});

			});

			it("should uninstall plugin", () => {

				return writeFileProm(
					join(sEmptyPlugin, "package.json"),
					JSON.stringify({
						"name": "test",
						"main": "TestEmptyPlugin.js"
					}),
					"utf8"
				).then(() => {

					return writeFileProm(
						join(sEmptyPlugin, "TestEmptyPlugin.js"),
						"\n\"use strict\";" +
						"\n\nmodule.exports = class TestEmptyPlugin " +
						"extends require(require(\"path\").join(\"..\", \"..\", \"..\", \"lib\", \"main.js\")).plugin { };",
						"utf8"
					);

				}).then(() => {
					return pluginsManager.loadByDirectory(sEmptyPlugin);
				}).then((plugin) => {
					return pluginsManager.uninstall(plugin);
				});

			});

		});

	});

});
