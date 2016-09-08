"use strict";

// deps

	const 	path = require("path"),
			assert = require("assert"),

			fs = require("node-promfs");

// private

	var oPluginsManager = new (require(path.join(__dirname, "..", "lib", "main.js")))();

// tests

describe("events", () => {

	before(() => {
		oPluginsManager.directory = path.join(__dirname, "..", "plugins");
		return fs.rmdirpProm(path.join(__dirname, "..", "plugins"));
	});

	after(() => {
		return fs.rmdirpProm(path.join(__dirname, "..", "plugins"));
	});

	it("should test not existing directory without event", () => {
		return oPluginsManager.loadAll();
	});

	it("should test not existing directory with events", () => {

		// errors

		return oPluginsManager.on("error", (msg) => {
			(1, console).log("--- [event/error] \"" + msg + "\" ---");
		})

		// load

		.on("loaded", (plugin) => {
			(1, console).log("--- [event/loaded] \"" + plugin.name + "\" (v" + plugin.version + ") loaded ---");
		}).on("allloaded", () => {
			(1, console).log("--- [event/allloaded] ---");
		}).on("unloaded", (plugin) => {
			(1, console).log("--- [event/unloaded] \"" + plugin.name + "\" (v" + plugin.version + ") unloaded ---");
		})

		// write

		.on("installed", (plugin) => {
			(1, console).log("--- [event/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
		}).on("updated", (plugin) => {
			(1, console).log("--- [event/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
		}).on("uninstalled", (plugin) => {
			(1, console).log("--- [event/uninstalled] \"" + plugin.name + "\" uninstalled ---");
		}).loadAll();

	});

});

describe("load all", () => {

	let sEmptyPlugin;

	before(() => {
		oPluginsManager.directory = path.join(__dirname, "plugins");
		sEmptyPlugin = path.join(oPluginsManager.directory, "TestEmptyPlugin");
	});

	after(() => {

		return fs.rmdirpProm(path.join(__dirname, "..", "plugins")).then(() => {
			return fs.unlinkProm(sEmptyPlugin);
		});

	});

	it("should test empty plugin", (done) => {

		oPluginsManager.directory = path.join(__dirname, "plugins");

		fs.mkdirpProm(sEmptyPlugin).then(() => {
			return oPluginsManager.loadByDirectory(sEmptyPlugin);
		}).then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

});

describe("install via github", () => {

	after(() => {
		return fs.rmdirpProm(path.join(oPluginsManager.directory, "node-containerpattern"));
	});

	it("should test download an empty url", (done) => {

		oPluginsManager.installViaGithub("").then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(10000);

	it("should test download an invalid github url", (done) => {

		oPluginsManager.installViaGithub("test").then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(10000);

	it("should test download an invalid node-containerpattern", (done) => {

		oPluginsManager.installViaGithub("https://github.com/Psychopoulet/node-containerpattern").then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(10000);

});

describe("update via github", () => {

	it("should test update on an inexistant plugin", (done) => {

		oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, "node-containerpattern")).then(() => {
			done("tests does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(10000);

});

describe("uninstall", () => {

	let sEmptyPlugin;

	before(() => {
		sEmptyPlugin = path.join(oPluginsManager.directory, "TestEmptyPlugin");
		return fs.mkdirpProm(sEmptyPlugin);
	});

	after(() => {
		return fs.rmdirpProm(sEmptyPlugin);
	});

	it("should uninstall empty plugin", () => {
		return oPluginsManager.uninstallByDirectory(sEmptyPlugin);
	});

});

describe("load", () => {

	it("should load good plugin", () => {

		return oPluginsManager.loadByDirectory(path.join(oPluginsManager.directory, "TestGoodPlugin")).then((plugin) => {

			assert.strictEqual("TestGoodPlugin", plugin.name, "Loaded plugin name is no correct");
			assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

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
			assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");
		});

	});

});

describe("beforeLoadAll", () => {

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
