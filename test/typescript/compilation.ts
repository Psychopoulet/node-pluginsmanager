/// <reference path="../../lib/index.d.ts" />

import * as PluginManager from '../../lib/main.js';

console.log(PluginManager);

const manager = new PluginManager();

console.log(manager);

console.log(manager.getPluginsNames());

manager.setOrder([ "1", "2" ]).then(() => {

	return manager.beforeInitAll(() => {
		return manager.releaseAll();
	});

}).then(() => {
	return manager.initAll();
});
