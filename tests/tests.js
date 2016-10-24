"use strict";

// const

	const MAX_TIMOUT = 10 * 1000;

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

	it("should test empty plugin", (done) => {

		let sEmptyPluginDirectory = path.join(testsPluginsDirectory, "TestEmptyPlugin");

		fs.mkdirpProm(sEmptyPluginDirectory).then(() => {
			return oPluginsManager.loadByDirectory(sEmptyPluginDirectory);
		}).then(() => {
			done("tests does not generate error");
		}).catch((err) => {

			assert.strictEqual("string", typeof err, "generated error is not a string");

			fs.rmdirpProm(sEmptyPluginDirectory).then(() => {
				return oPluginsManager.unloadAll();
			}).then(() => {
				done();
			}).catch(done);

		});

	});

	it("should test normal loading", () => {

		return oPluginsManager.loadAll().then(() => {
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

	it("should add empty order", (done) => {

		oPluginsManager.setOrder().then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should add wrong order", (done) => {

		oPluginsManager.setOrder(false).then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should add normal order with wrong directories basenames", (done) => {

		oPluginsManager.setOrder([ false, false ]).then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should add normal order with empty directories basenames", (done) => {

		oPluginsManager.setOrder([ "", "" ]).then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
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

			return oPluginsManager.unloadAll()

		});

	});

	it("should test normal loading with order", () => {

		return oPluginsManager.setOrder([ "TestGoodPluginWithoutDependencies" ]).then(() => {
			return oPluginsManager.loadAll();
		}).then(() => {

			assert.strictEqual(2, oPluginsManager.plugins.length, "too much plugins loaded");

			return oPluginsManager.unloadAll()

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

	it("should test download an empty url", (done) => {

		oPluginsManager.installViaGithub("").then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(MAX_TIMOUT);

	it("should test download an invalid github url", (done) => {

		oPluginsManager.installViaGithub("test").then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(MAX_TIMOUT);

	it("should test download an invalid node-containerpattern", (done) => {

		oPluginsManager.installViaGithub("https://github.com/Psychopoulet/node-containerpattern").then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
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

		assert.strictEqual(0, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

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

	it("should unload good plugin", (done) => {

		assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

		if (0 < oPluginsManager.plugins.length) {
			oPluginsManager.plugins[0].unload("test").then(() => { done(); }).catch(done);
			oPluginsManager.plugins.splice(0, 1);
		}
		else {
			done();
		}

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

	it("should fail on beforeLoadAll creation", (done) => {

		oPluginsManager.beforeLoadAll(false).then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should fail on beforeLoadAll call", (done) => {

		oPluginsManager.beforeLoadAll(() => {}).then(() => {
			return oPluginsManager.loadAll();
		}).then(() => {
			done("tests does not generate error");
		}).catch((err) => {

			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();

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

	it("should test update on an inexistant plugin", (done) => {

		oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, "node-containerpattern")).then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
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
