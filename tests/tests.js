"use strict";

// const

	const MAX_TIMOUT = 30 * 1000;

// deps

	const 	path = require("path"),
			assert = require("assert"),

			fs = require("node-promfs");

// private

	var oPluginsManager = new (require(path.join(__dirname, "..", "lib", "main.js")))(),
		testsPluginsDirectory = path.join(__dirname, "plugins");

// tests

describe("events", () => {

	let pluginsDirectory = path.join(__dirname, "..", "plugins");

	before(() => {

		oPluginsManager.directory = pluginsDirectory;

		return fs.rmdirpProm(pluginsDirectory).then(() => {
			return oPluginsManager.unloadAll();
		});

	});

	after(() => {

		return fs.rmdirpProm(pluginsDirectory).then(() => {
			return oPluginsManager.unloadAll();
		});

	});

	it("should test not existing directory without event", () => {
		return oPluginsManager.loadAll();
	});

	it("should test not existing directory with events", () => {

		// errors

		return oPluginsManager.on("error", (msg) => {
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
		oPluginsManager.directory = testsPluginsDirectory;
		return oPluginsManager.unloadAll();
	});

	after(() => { return oPluginsManager.unloadAll(); });

	it("should test file plugin", () => {

		let sFilePlugin = path.join(testsPluginsDirectory, "TestFilePlugin.txt");

		return fs.writeFileProm(sFilePlugin, "").then(() => {
			return oPluginsManager.loadByDirectory(sFilePlugin);
		}).then(() => {

			assert.deepStrictEqual("object", typeof oPluginsManager.plugins, "plugins is not an object");
			assert.strictEqual(true, oPluginsManager.plugins instanceof Array, "plugins is not an Array");
			assert.strictEqual(0, oPluginsManager.plugins.length, "plugins length is not valid");

			return Promise.resolve();

		}).then(() => {
			return fs.unlinkProm(sFilePlugin);
		});

	});

	it("should test empty plugin", () => {

		let sEmptyPluginDirectory = path.join(testsPluginsDirectory, "TestEmptyPlugin");

		return fs.mkdirpProm(sEmptyPluginDirectory).then(() => {
			return oPluginsManager.loadByDirectory(sEmptyPluginDirectory);
		}).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
				assert.strictEqual("\"TestEmptyPlugin\" => Cannot find module '" + sEmptyPluginDirectory + "'", err.message, "this is not the expected message");

				assert.deepStrictEqual("object", typeof oPluginsManager.plugins, "plugins is not an object");
				assert.strictEqual(true, oPluginsManager.plugins instanceof Array, "plugins is not an Array");
				assert.strictEqual(0, oPluginsManager.plugins.length, "plugins length is not valid");

				resolve();

			});

		}).then(() => {
			return fs.rmdirpProm(sEmptyPluginDirectory);
		});

	});

	it("should test normal loading", () => {

		return oPluginsManager.loadAll().then(() => {

			assert.strictEqual(true, oPluginsManager.plugins instanceof Array, "loaded plugins are incorrects");
			assert.strictEqual(2, oPluginsManager.plugins.length, "loaded plugins are incorrects");

			assert.strictEqual(2, oPluginsManager.plugins.length, "loaded plugins are incorrects");

			return Promise.resolve();

		}).then(() => {
			return oPluginsManager.unloadAll();
		});

	});

});

describe("load all with order", () => {

	before(() => {
		oPluginsManager.directory = testsPluginsDirectory;
		return oPluginsManager.unloadAll();
	});

	after(() => {
		oPluginsManager.orderedDirectoriesBaseNames = [];
		return oPluginsManager.unloadAll();
	});

	it("should add empty order", () => {

		return oPluginsManager.setOrder().then(() => {
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

		return oPluginsManager.setOrder(false).then(() => {
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

		return oPluginsManager.setOrder([ false, false ]).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
				assert.strictEqual("The directory at index \"0\" must be a string\r\nThe directory at index \"1\" must be a string", err.message, "this is not the expected message");

				resolve();

			});

		});

	});

	it("should add normal order with empty directories basenames", () => {

		return oPluginsManager.setOrder([ "", "" ]).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			new Promise((resolve) => {

				assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
				assert.strictEqual("The directory at index \"0\" must be not empty\r\nThe directory at index \"1\" must be not empty", err.message, "this is not the expected message");

				resolve();

			});

		});

	});

	it("should add normal order with normal directories basenames", () => {
		return oPluginsManager.setOrder([ "TestGoodPlugin" ]);
	});

	it("should test normal loading with order and twice the same plugin", () => {

		return oPluginsManager.setOrder([ "TestGoodPlugin", "TestGoodPlugin" ]).then(() => {
			return oPluginsManager.loadAll();
		}).then(() => {

			assert.strictEqual(2, oPluginsManager.plugins.length, "too much plugins loaded");

			return oPluginsManager.unloadAll();

		});

	});

	it("should test normal loading with order", () => {

		return oPluginsManager.setOrder([ "TestGoodPlugin", "TestGoodPluginWithoutDependencies" ]).then(() => {
			return oPluginsManager.loadAll();
		}).then(() => {

			new Promise((resolve) => {
				
				assert.strictEqual(true, oPluginsManager.plugins instanceof Array, "loaded plugins are incorrects");
				assert.strictEqual(2, oPluginsManager.plugins.length, "loaded plugins are incorrects");

				// TestGoodPlugin

				assert.strictEqual(true, "object" === typeof oPluginsManager.plugins[0], "loaded plugins are incorrects");
				assert.deepStrictEqual([ "Sébastien VIDAL" ], oPluginsManager.plugins[0].authors, "loaded plugins are incorrects");
				assert.deepStrictEqual("A test for node-pluginsmanager", oPluginsManager.plugins[0].description, "loaded plugins are incorrects");
				assert.deepStrictEqual({ "simpletts": "^1.4.1" }, oPluginsManager.plugins[0].dependencies, "loaded plugins are incorrects");

				// TestGoodPluginWithoutDependencies

				assert.strictEqual(true, "object" === typeof oPluginsManager.plugins[1], "loaded plugins are incorrects");
				assert.deepStrictEqual([ "Sébastien VIDAL", "test" ], oPluginsManager.plugins[1].authors, "loaded plugins are incorrects");
				assert.deepStrictEqual("A test for node-pluginsmanager", oPluginsManager.plugins[1].description, "loaded plugins are incorrects");
				assert.deepStrictEqual({ }, oPluginsManager.plugins[1].dependencies, "loaded plugins are incorrects");

				resolve();

			}).then(() => {
				return oPluginsManager.unloadAll();
			});

		});

	});

});

describe("install via github", () => {

	before(() => {
		oPluginsManager.directory = testsPluginsDirectory;
		return oPluginsManager.unloadAll();
	});

	after(() => {

		return fs.rmdirpProm(path.join(testsPluginsDirectory, "node-containerpattern")).then(() => {
			return oPluginsManager.unloadAll();
		});

	});

	it("should test download an empty url", () => {

		oPluginsManager.installViaGithub("").then(() => {
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

		return oPluginsManager.installViaGithub("test").then(() => {
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

		return oPluginsManager.installViaGithub("https://github.com/Psychopoulet/node-containerpattern").then(() => {

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

	let sEmptyPlugin = path.join(testsPluginsDirectory, "TestEmptyPlugin");

	before(() => {

		oPluginsManager.directory = testsPluginsDirectory;

		return fs.mkdirpProm(sEmptyPlugin).then(() => {
			return oPluginsManager.unloadAll();
		});

	});

	after(() => {

		return fs.rmdirpProm(sEmptyPlugin).then(() => {
			return oPluginsManager.unloadAll();
		});

	});

	it("should uninstall empty plugin", () => {
		return oPluginsManager.uninstallByDirectory(sEmptyPlugin);
	});

});

describe("load", () => {

	before(() => {
		oPluginsManager.directory = testsPluginsDirectory;
		return oPluginsManager.unloadAll();
	});

	after(() => { return oPluginsManager.unloadAll(); });

	it("should load good plugin", () => {

		return new Promise((resolve) => {

			assert.strictEqual(0, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

			resolve();

		}).then(() => {

			return oPluginsManager.loadByDirectory(path.join(oPluginsManager.directory, "TestGoodPlugin")).then((plugin) => {

				assert.strictEqual("TestGoodPlugin", plugin.name, "Loaded plugin name is no correct");
				assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

				assert.deepStrictEqual(["Sébastien VIDAL"], plugin.authors, "Loaded plugin's authors is not correct");
				assert.strictEqual("A test for node-pluginsmanager", plugin.description, "Loaded plugin's description is not correct");
				assert.deepStrictEqual([path.join(__dirname, "plugins", "TestGoodPlugin", "design.css")], plugin.designs, "Loaded plugin's designs is not correct");
				assert.strictEqual(path.join(__dirname, "plugins", "TestGoodPlugin"), plugin.directory, "Loaded plugin's directory is not correct");
				assert.strictEqual("", plugin.github, "Loaded plugin's github is not correct");
				assert.deepStrictEqual([path.join(__dirname, "plugins", "TestGoodPlugin", "javascript.js")], plugin.javascripts, "Loaded plugin's javascripts is not correct");
				assert.strictEqual("ISC", plugin.license, "Loaded plugin's license is not correct");
				assert.strictEqual("TestGoodPlugin", plugin.name, "Loaded plugin's name is not correct");
				assert.deepStrictEqual([path.join(__dirname, "plugins", "TestGoodPlugin", "template.html")], plugin.templates, "Loaded plugin's templates is not correct");
				assert.strictEqual("0.0.2", plugin.version, "Loaded plugin's version is not correct");

			});

		});

	});

	it("should unload good plugin", () => {

		return new Promise((resolve) => {

			assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

			resolve();

		}).then(() => {

			if (0 < oPluginsManager.plugins.length) {

				return oPluginsManager.plugins[0].unload("test").then(() => {
					oPluginsManager.plugins.splice(0, 1); return Promise.resolve();
				});
				
			}
			else {
				return Promise.resolve();
			}

		});

	});

	it("should load all", () => {

		return oPluginsManager.loadAll("test").then(() => {
			assert.strictEqual(2, oPluginsManager.plugins.length, "Loaded plugins length is no correct");
		});

	});

});

describe("beforeLoadAll", () => {

	before(() => {
		oPluginsManager.directory = testsPluginsDirectory;
		return oPluginsManager.unloadAll();
	});

	after(() => { return oPluginsManager.unloadAll(); });

	it("should fail on beforeLoadAll creation", () => {

		return oPluginsManager.beforeLoadAll(false).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");

				resolve();

			});

		});

	});

	it("should fail on beforeLoadAll call", () => {

		return oPluginsManager.beforeLoadAll(() => {}).then(() => {
			return oPluginsManager.loadAll();
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

		return oPluginsManager.beforeLoadAll(() => {
			return Promise.resolve();
		}).then(() => {
			return oPluginsManager.loadAll();
		});

	});

});

describe("update via github", () => {

	let TestGoodPluginDirectory = path.join(path.join(testsPluginsDirectory, "TestGoodPlugin")),
		npmDirectory = path.join(TestGoodPluginDirectory, "node_modules");

	before(() => {
		oPluginsManager.directory = testsPluginsDirectory;
		return oPluginsManager.unloadAll();
	});

	after(() => {

		return fs.rmdirpProm(npmDirectory).then(() => {
			return oPluginsManager.unloadAll();
		});

	});

	it("should test update on an inexistant plugin", () => {

		return oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, "node-containerpattern")).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(true, err instanceof Error, "generated error is not an instance of Error");
			
				resolve();

			});

		});

	}).timeout(MAX_TIMOUT);

	it("should test update plugins and dependances", () => {

		return oPluginsManager.loadAll().then(() => {
			return oPluginsManager.updateByDirectory(TestGoodPluginDirectory);
		}).then(() => {

			return fs.isDirectoryProm(npmDirectory).then((exists) => {

				if (exists) {
					return Promise.resolve();
				}
				else {
					return Promise.reject("There is no npm udpate performed");
				}

			});

		});

	}).timeout(MAX_TIMOUT);

});
