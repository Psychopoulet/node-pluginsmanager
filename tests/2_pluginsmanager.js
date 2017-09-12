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

	const pluginsManager = new PluginsManager();
	const testsPluginsDirectory = join(__dirname, "plugins");

// tests

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

describe("load all", () => {

	before(() => {
		pluginsManager.directory = testsPluginsDirectory;
		return pluginsManager.unloadAll();
	});

	after(() => {
		return pluginsManager.unloadAll();
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

describe("load all with order", () => {

	before(() => {
		pluginsManager.directory = testsPluginsDirectory;
		return pluginsManager.unloadAll();
	});

	after(() => {
		pluginsManager.orderedDirectoriesBaseNames = [];
		return pluginsManager.unloadAll();
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

			return pluginsManager.unloadAll();

		});

	});

	it("should test normal loading with order", () => {

		return pluginsManager.setOrder([ "TestGoodPlugin", "TestGoodPluginWithoutDependencies" ]).then(() => {
			return pluginsManager.loadAll();
		}).then(() => {

			return new Promise((resolve) => {

				assert.strictEqual(true, pluginsManager.plugins instanceof Array, "loaded plugins are incorrects");
				assert.strictEqual(2, pluginsManager.plugins.length, "loaded plugins are incorrects");

				// TestGoodPlugin

				assert.strictEqual(true, "object" === typeof pluginsManager.plugins[0], "loaded plugins are incorrects");
				assert.deepStrictEqual([ "Sébastien VIDAL" ], pluginsManager.plugins[0].authors, "loaded plugins are incorrects");
				assert.deepStrictEqual("A test for node-pluginsmanager", pluginsManager.plugins[0].description, "loaded plugins are incorrects");
				assert.deepStrictEqual({ "simpletts": "^1.4.1" }, pluginsManager.plugins[0].dependencies, "loaded plugins are incorrects");

				// TestGoodPluginWithoutDependencies

				assert.strictEqual(true, "object" === typeof pluginsManager.plugins[1], "loaded plugins are incorrects");
				assert.deepStrictEqual([ "Sébastien VIDAL", "test" ], pluginsManager.plugins[1].authors, "loaded plugins are incorrects");
				assert.deepStrictEqual("A test for node-pluginsmanager", pluginsManager.plugins[1].description, "loaded plugins are incorrects");
				assert.deepStrictEqual({ }, pluginsManager.plugins[1].dependencies, "loaded plugins are incorrects");

				resolve();

			}).then(() => {
				return pluginsManager.unloadAll();
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

describe("uninstall", () => {

	const sEmptyPlugin = join(testsPluginsDirectory, "TestEmptyPlugin");

	beforeEach(() => {

		pluginsManager.directory = testsPluginsDirectory;

		return mkdirpProm(sEmptyPlugin).then(() => {
			return pluginsManager.unloadAll();
		});

	});

	afterEach(() => {

		return rmdirpProm(sEmptyPlugin).then(() => {
			return pluginsManager.unloadAll();
		});

	});

	it("should uninstall inexistant plugin by directory", () => {
		return pluginsManager.uninstallByDirectory("szofuhzesifguhezifu");
	});

	it("should uninstall empty plugin by directory", () => {
		return pluginsManager.uninstallByDirectory(sEmptyPlugin);
	});

	it("should uninstall plugin by plugin", () => {

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
