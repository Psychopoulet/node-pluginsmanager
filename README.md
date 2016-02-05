# simplepluginsmanager
A plugins manager's object, using simpleplugin


## Installation

```bash
$ npm install simplepluginsmanager
```

## Features

  * simply manage plugins (on simpleplugin model)
  * add plugins manually or via github & load them
  * remove plugins and free there ressources

## Examples

```js

"use strict";

const SimplePluginsManager = require('simplepluginsmanager');

var oPluginsManager = new SimplePluginsManager(path.join(__dirname, 'plugins'));

oPluginsManager

		.on('error', function(msg) {
			console.log(msg);
		})
		.on('add', function(pluginPath) {
			console.log("--- [event] '" + pluginPath + "' added ---");
		})
		.on('remove', function(pluginName) {
			console.log("--- [event] '" + pluginName + "' removed ---");
		})
		.on('load', function(plugin) {
			console.log("--- [event] '" + plugin.name + "' loaded ---");
		})

.loadAll(<optional data to pass to the 'run' plugins methods>).then(function() {

	console.log('all plugins loaded');
	console.log(oPluginsManager.getPluginsNames());

	oPluginsManager.addByGithub('https://github.com/<account>/<plugin>')
	.then(function(plugin) {
		console.log(plugin.name + ' added & loaded');
	})
	.catch(function(err) {
		console.log(err);
	});

	oPluginsManager.remove(5)
	.then(function(pluginName) {
		console.log(pluginName + ' removed');
	})
	.catch(function(err) {
		console.log(err);
	});

})
.catch(function(err) {
	console.log(err);
});

```

## Tests

```bash
$ node tests/tests.js
```

## License

  [ISC](LICENSE)
