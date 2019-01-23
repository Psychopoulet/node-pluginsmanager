/// <reference path="../../lib/index.d.ts" />

import PluginManager = require("../../lib/main.js");

console.log(PluginManager);
console.log(PluginManager.plugin);

const manager = new PluginManager();

console.log(manager);

console.log(manager.getPluginsNames());

manager.setOrder([ "1", "2" ]).then(() => {

	return manager.beforeLoadAll(() => {
		return manager.unloadAll();
	});

}).then(() => {
	return manager.loadAll();
});
