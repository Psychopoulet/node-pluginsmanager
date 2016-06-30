"use strict";

// deps

	const 	path = require("path"),
			assert = require("assert"),

			fs = require("node-promfs");

// private

	var oPluginsManager = new (require(path.join(__dirname, "..", "lib", "main.js")))();

// tests

describe("events", function() {

	before(function() {
		oPluginsManager.directory = path.join(__dirname, "..", "plugins");
		return fs.rmdirpProm(path.join(__dirname, "..", "plugins"));
	});

	after(function() {
		return fs.rmdirpProm(path.join(__dirname, "..", "plugins"));
	});

	it("should test not existing directory without event", function(done) {

		oPluginsManager.loadAll().then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should test not existing directory with events", function(done) {

		// errors

		oPluginsManager.on("error", function(msg) {
			(1, console).log("--- [event/error] \"" + msg + "\" ---");
		})

		// load

		.on("loaded", function(plugin) {
			(1, console).log("--- [event/loaded] \"" + plugin.name + "\" (v" + plugin.version + ") loaded ---");
		}).on("allloaded", function() {
			(1, console).log("--- [event/allloaded] ---");
		}).on("unloaded", function(plugin) {
			(1, console).log("--- [event/unloaded] \"" + plugin.name + "\" (v" + plugin.version + ") unloaded ---");
		})

		// write

		.on("installed", function(plugin) {
			(1, console).log("--- [event/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
		}).on("updated", function(plugin) {
			(1, console).log("--- [event/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
		}).on("uninstalled", function(plugin) {
			(1, console).log("--- [event/uninstalled] \"" + plugin.name + "\" uninstalled ---");
		})

		.loadAll().then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

});

describe("load all", function() {

	let sEmptyPlugin;

	before(function() {
		oPluginsManager.directory = path.join(__dirname, "plugins");
		sEmptyPlugin = path.join(oPluginsManager.directory, "TestEmptyPlugin");
	});

	after(function() {

		return fs.rmdirpProm(path.join(__dirname, "..", "plugins")).then(function() {
			return fs.unlinkProm(sEmptyPlugin);
		});

	});

	it("should test empty plugin", function(done) {

		oPluginsManager.directory = path.join(__dirname, "plugins");

		fs.mkdirpProm(sEmptyPlugin).then(function() {
			return oPluginsManager.loadByDirectory(sEmptyPlugin);
		}).then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

});

describe("install via github", function() {

	after(function() {
		return fs.rmdirpProm(path.join(oPluginsManager.directory, "node-containerpattern"));
	});

	it("should test download an empty url", function(done) {

		oPluginsManager.installViaGithub("").then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should test download an invalid github url", function(done) {

		oPluginsManager.installViaGithub("test").then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should test download an invalid node-containerpattern", function(done) {

		oPluginsManager.installViaGithub("https://github.com/Psychopoulet/node-containerpattern").then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(10000);

});

describe("update via github", function() {

	it("should test update on an inexistant plugin", function(done) {

		oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, "node-containerpattern")).then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(10000);

});

describe("uninstall", function() {

	let sEmptyPlugin;

	before(function() {
		sEmptyPlugin = path.join(oPluginsManager.directory, "TestEmptyPlugin");
		return fs.mkdirpProm(sEmptyPlugin);
	});

	after(function() {
		return fs.rmdirpProm(sEmptyPlugin);
	});

	it("should uninstall empty plugin", function() {
		return oPluginsManager.uninstallByDirectory(sEmptyPlugin);
	});

});

describe("load", function() {

	it("should load good plugin", function() {

		return oPluginsManager.loadByDirectory(path.join(oPluginsManager.directory, "TestGoodPlugin")).then(function(plugin) {

			assert.strictEqual("TestGoodPlugin", plugin.name, "Loaded plugin name is no correct");
			assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

		});

	});

	it("should unload good plugin", function(done) {

		assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

		if (0 < oPluginsManager.plugins.length) {
			oPluginsManager.plugins[0].unload("test").then(function() { done(); }).catch(done);
			oPluginsManager.plugins.splice(0, 1);
		}
		else {
			done();
		}

	});

	it("should load all", function() {

		return oPluginsManager.loadAll("test").then(function() {
			assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");
		});

	});

});

describe("beforeLoadAll", function() {

	it("should fail on beforeLoadAll creation", function(done) {

		oPluginsManager.beforeLoadAll(false).then(function() {
			done("tests does not generate error");
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should fail on beforeLoadAll call", function(done) {

		oPluginsManager.beforeLoadAll(function() {}).then(function() {
			return oPluginsManager.loadAll();
		}).then(function() {
			done("tests does not generate error");
		}).catch(function(err) {

			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();

		});

	});

	it("should success on beforeLoadAll call", function() {

		return oPluginsManager.beforeLoadAll(function() {
			return Promise.resolve();
		}).then(function() {
			return oPluginsManager.loadAll();
		});

	});

});
