"use strict";

// deps

	const 	path = require("path"),
			assert = require("assert"),

			fs = require("simplefs");

// private

	var oPluginsManager = new (require(path.join(__dirname, "..", "lib", "main.js")))();

// tests

describe("events", function() {

	let cn = console;

	before(function() {
		oPluginsManager.directory = path.join(__dirname, "..", "plugins");
		return fs.rmdirpProm(path.join(__dirname, "..", "plugins"));
	});

	after(function() {
		return fs.rmdirpProm(path.join(__dirname, "..", "plugins"));
	});

	it("should test not existing directory without event", function(done) {

		oPluginsManager.loadAll().then(function() {
			assert.ok(false, "tests does not generate error");
			done();
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should test not existing directory with events", function(done) {

		// errors

		oPluginsManager.on("error", function(msg) {
			cn.log("--- [event/error] \"" + msg + "\" ---");
		})

		// load

		.on("loaded", function(plugin) {
			cn.log("--- [event/loaded] \"" + plugin.name + "\" (v" + plugin.version + ") loaded ---");
		}).on("allloaded", function() {
			cn.log("--- [event/allloaded] ---");
		}).on("unloaded", function(plugin) {
			cn.log("--- [event/unloaded] \"" + plugin.name + "\" (v" + plugin.version + ") unloaded ---");
		})

		// write

		.on("installed", function(plugin) {
			cn.log("--- [event/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
		}).on("updated", function(plugin) {
			cn.log("--- [event/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
		}).on("uninstalled", function(plugin) {
			cn.log("--- [event/uninstalled] \"" + plugin.name + "\" uninstalled ---");
		})

		.loadAll().then(function() {
			assert.ok(false, "tests does not generate error");
			done();
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
			assert.ok(false, "tests does not generate error");
			done();
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

});

describe("install via github", function() {

	after(function() {
		return fs.rmdirpProm(path.join(oPluginsManager.directory, "simplecontainer"));
	});

	it("should test download an empty url", function(done) {

		oPluginsManager.installViaGithub("").then(function() {
			assert.ok(false, "tests does not generate error");
			done();
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should test download an invalid github url", function(done) {

		oPluginsManager.installViaGithub("test").then(function() {
			assert.ok(false, "tests does not generate error");
			done();
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	});

	it("should test download an invalid SimplePlugin", function(done) {

		oPluginsManager.installViaGithub("https://github.com/Psychopoulet/simplecontainer").then(function() {
			assert.ok(false, "tests does not generate error");
			done();
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "generated error is not a string");
			done();
		});

	}).timeout(10000);

});

describe("update via github", function() {

	it("should test update on an inexistant plugin", function(done) {

		oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, "simplefs")).then(function() {
			assert.ok(false, "tests does not generate error");
			done();
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

	it("load good plugin", function(done) {

		oPluginsManager.loadByDirectory(path.join(oPluginsManager.directory, "TestGoodPlugin")).then(function(plugin) {

			assert.strictEqual("TestGoodPlugin", plugin.name, "Loaded plugin name is no correct");
			assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

			done();

		}).catch(done);

	});

	it("unload good plugin", function(done) {

		assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");

		if (0 < oPluginsManager.plugins.length) {
			oPluginsManager.plugins[0].unload("test").then(function() { done(); }).catch(done);
			oPluginsManager.plugins.splice(0, 1);
		}
		else {
			done();
		}

	});

	it("load all", function(done) {

		oPluginsManager.loadAll("test").then(function() {
			assert.strictEqual(1, oPluginsManager.plugins.length, "Loaded plugins length is no correct");
			done();
		}).catch(done);

	});

});
