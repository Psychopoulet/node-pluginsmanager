# simplepluginsmanager
A plugins manager, using simpleplugin


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

var oPluginsManager = new SimplePluginsManager();

oPluginsManager.load().then(function() {

	console.log('all plugins loaded');
	console.log(oPluginsManager.getPluginsNames());

	oPluginsManager.addByGithub('https://github.com/<account>/<plugin>')
	.then(function(plugin) {
		console.log(plugin.name + ' loaded');
	})
	.catch(function(err) {
		console.log(err);
	});

	oPluginsManager.remove(5);

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
