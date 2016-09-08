# node-pluginsmanager
A plugins manager

## Installation

```bash
$ npm install node-pluginsmanager
```

## Features

  * simply manage plugins (on plugin model)
  * install plugins manually or via github & load them
  * update plugins via github
  * uninstall plugins and unload there ressources

## Doc
### PluginsManager (extends asynchronous-eventemitter)

  * ``` string directory ``` plugins' directory path
  * ``` array plugins ``` plugins' data
  * ``` static AbstractPlugin plugin ``` abstract class for plugin creation
  * ``` constructor([string directory = "<PluginsManager>/plugins"]) ```
  * ``` getPluginsNames() : array ``` return plugins' names
  * ``` loadByDirectory(string directory [, mixed data ]) : array ``` load a plugin by its directory, using "data" in arguments for "load" plugin's method
  * ``` beforeLoadAll(function callback) : Promise ``` add a function executed before loading all plugins ("callback" must return a Promise instance)
  * ``` loadAll([mixed data]) : Promise ``` load all plugins, using "data" in arguments for "load" plugin's method
  * ``` installViaGithub(string url [, mixed data]) : Promise ``` install a plugin via github, using "data" in arguments for "install" plugin's method
  * ``` updateByKey([mixed data]) : Promise ``` update a plugin, using "data" in arguments for "update" plugin's method

## Create your plugin with "plugin" extend

```js
"use strict";

class MyPlugin extends require('node-pluginsmanager').plugin {

    // load

        // 'data' is optionnal, null if not sended by the manager
        load (data) {

            return new Promise((resolve) => {
                // your working place
                resolve();
            });

        }

        // 'data' is optionnal, null if not sended by the manager
        unload (data) {

            super.unload(); // must be called

            return new Promise((resolve) => {
                // used on delete & update plugin, unload ressources like array, sockets, etc...
                resolve();
            });

        }

    // write

        // 'data' is optionnal, null if not sended by the manager
        install (data) {

            return new Promise((resolve) => {
                // on the first use, create ressources like directories, files, etc...
                resolve();
            });

        }

        // 'data' is optionnal, null if not sended by the manager
        update (data) {

            return new Promise((resolve) => {
                // update your ressources like sql database, etc...
                resolve();
            });

        }

        // 'data' is optionnal, null if not sended by the manager
        uninstall (data) {

            return new Promise((resolve) => {
                // remove all the created ressources like directories, files, etc...
                resolve();
            });

        }

}
```

## Examples

```js
"use strict";

const path = require('path');

var oPluginsManager = (new require('node-pluginsmanager'))(path.join(__dirname, 'plugins')); // param optional : automatically setted to this value if not given...
oPluginsManager.directory = path.join(__dirname, 'plugins'); // ... or changed like this

oPluginsManager

    .on('error', (msg) => {
        console.log("--- [event/error] '" + msg + "' ---");
    })

    // load

        .on('loaded', (plugin) => {
            console.log("--- [event/loaded] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
        })
        .on('allloaded', () => {
            console.log("--- [event/loaded] all loaded ---");
        })
        .on('unloaded', (plugin) => {
            console.log("--- [event/unloaded] '" + plugin.name + "' (v" + plugin.version + ") unloaded ---");
        })

    // write

        .on('installed', (plugin) => {
            console.log("--- [event/installed] '" + plugin.name + "' (v" + plugin.version + ") installed ---");
        })
        .on('updated', (plugin) => {
            console.log("--- [event/updated] '" + plugin.name + "' (v" + plugin.version + ") updated ---");
        })
        .on('uninstalled', (plugin) => {
            console.log("--- [event/uninstalled] '" + plugin.name + "' uninstalled ---");
        })

.beforeLoad(() => { // optionnal. MUST return a promise
    return Promise.resolve();
})

.loadAll(<optional data to pass to the 'load' plugins methods>).then(() => {

    console.log('all plugins loaded');
    console.log(oPluginsManager.getPluginsNames());

    oPluginsManager.installViaGithub(
        'https://github.com/<account>/<plugin>',
        <optional data to pass to the 'install' && 'load' plugins methods>
    ).then((plugin) => {
        console.log(plugin.name + ' installed & loaded');
    }).catch((err) => {
        console.log(err);
    });

    oPluginsManager.update( // use "github"'s plugin data if exists
        <plugin>,
        <optional data to pass to the 'unload', 'update', && 'load' plugins methods>
    ).then((plugin) => {
        console.log(plugin.name + ' updated & loaded');
    }).catch((err) => {
        console.log(err);
    });

    // works also with updateByDirectory(<pluginDirectory>, <optional data>)

    oPluginsManager.uninstall(
        <plugin>,
        <optional data to pass to the 'unload' && 'uninstall' plugins methods>
    ).then((pluginName) => {
        console.log(pluginName + ' removed');
    }).catch((err) => {
        console.log(err);
    });

    // works also with uninstallByDirectory(<pluginDirectory>, <optional data>)

}).catch((err) => {
    console.log(err);
});
```

## Tests

```bash
$ gulp
```

## License

  [ISC](LICENSE)
