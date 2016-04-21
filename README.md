# simplepluginsmanager
A plugins manager's object, using SimplePlugin

## Installation

```bash
$ npm install simplepluginsmanager
```

## Features

  * simply manage plugins (on SimplePlugin model)
  * install plugins manually or via github & load them
  * update plugins via github
  * uninstall plugins and unload there ressources

## Create your plugin with SimplePlugin

```js

"use strict";

const SimplePluginsManager = require('simplepluginsmanager');

class MyPlugin extends SimplePluginsManager.SimplePlugin {

    // load

        // 'data' is optionnal, null if not sended by the manager
        load (data) {

            return new Promise(function(resolve, reject) {
                // your working place
                resolve();
            });

        }

        // 'data' is optionnal, null if not sended by the manager
        unload (data) {

            super.unload(); // must be called

            return new Promise(function(resolve, reject) {
                // used on delete & update plugin, unload ressources like array, sockets, etc...
                resolve();
            });

        }

    // write

        // 'data' is optionnal, null if not sended by the manager
        install (data) {

            return new Promise(function(resolve, reject) {
                // on the first use, create ressources like directories, files, etc...
                resolve();
            });

        }

        // 'data' is optionnal, null if not sended by the manager
        update (data) {

            return new Promise(function(resolve, reject) {
                // update your ressources like sql database, etc...
                resolve();
            });

        }

        // 'data' is optionnal, null if not sended by the manager
        uninstall (data) {

            return new Promise(function(resolve, reject) {
                // remove all the created ressources like directories, files, etc...
                resolve();
            });

        }

}

```

## Examples

```js

"use strict";

const SimplePluginsManager = require('simplepluginsmanager'), path = require('path');

var oPluginsManager = new SimplePluginsManager(path.join(__dirname, 'plugins')); // param optional : automatically setted to this value if not given...
oPluginsManager.directory = path.join(__dirname, 'plugins'); // ... or changed like this

oPluginsManager

    .on('error', function(msg) {
        console.log("--- [event/error] '" + msg + "' ---");
    })

    // load

        .on('loaded', function(plugin) {
            console.log("--- [event/loaded] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
        })
        .on('allloaded', function() {
            console.log("--- [event/loaded] all loaded ---");
        })
        .on('unloaded', function(plugin) {
            console.log("--- [event/unloaded] '" + plugin.name + "' (v" + plugin.version + ") unloaded ---");
        })

    // write

        .on('installed', function(plugin) {
            console.log("--- [event/installed] '" + plugin.name + "' (v" + plugin.version + ") installed ---");
        })
        .on('updated', function(plugin) {
            console.log("--- [event/updated] '" + plugin.name + "' (v" + plugin.version + ") updated ---");
        })
        .on('uninstalled', function(plugin) {
            console.log("--- [event/uninstalled] '" + plugin.name + "' uninstalled ---");
        })

.loadAll(<optional data to pass to the 'load' plugins methods>).then(function() {

    console.log('all plugins loaded');
    console.log(oPluginsManager.getPluginsNames());

    oPluginsManager.installViaGithub(
        'https://github.com/<account>/<plugin>',
        <optional data to pass to the 'install' && 'load' plugins methods>
    ).then(function(plugin) {
        console.log(plugin.name + ' installed & loaded');
    }).catch(function(err) {
        console.log(err);
    });

    oPluginsManager.update( // use "github"'s plugin data if exists
        <plugin>,
        <optional data to pass to the 'unload', 'update', && 'load' plugins methods>
    ).then(function(plugin) {
        console.log(plugin.name + ' updated & loaded');
    }).catch(function(err) {
        console.log(err);
    });

    // works also with updateByDirectory(<pluginDirectory>, <optional data>)

    oPluginsManager.uninstall(
        <plugin>,
        <optional data to pass to the 'unload' && 'uninstall' plugins methods>
    ).then(function(pluginName) {
        console.log(pluginName + ' removed');
    }).catch(function(err) {
        console.log(err);
    });

    // works also with uninstallByDirectory(<pluginDirectory>, <optional data>)

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
