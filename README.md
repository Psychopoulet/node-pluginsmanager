# node-pluginsmanager
A plugins manager

[![Build Status](https://api.travis-ci.org/Psychopoulet/node-pluginsmanager.svg?branch=develop)](https://travis-ci.org/Psychopoulet/node-pluginsmanager)
[![Coverage Status](https://coveralls.io/repos/github/Psychopoulet/node-pluginsmanager/badge.svg?branch=develop)](https://coveralls.io/github/Psychopoulet/node-pluginsmanager)
[![Dependency Status](https://img.shields.io/david/Psychopoulet/node-pluginsmanager/develop.svg)](https://github.com/Psychopoulet/node-pluginsmanager)

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

### AbstractPlugin

  -- Attributes --

  * ``` array authors ``` plugin's author
  * ``` string description ``` plugin's description
  * ``` array designs ``` plugin's designs (CSS)
  * ``` string directory ``` plugin's directory path
  * ``` string github ``` plugin's github
  * ``` array javascripts ``` plugin's scripts (javascript)
  * ``` string license ``` plugin's license
  * ``` string name ``` plugin's name
  * ``` array templates ``` plugin's templates (HTML)
  * ``` string version ``` plugin's version

  -- Constructor --

  * ``` constructor() ```

  -- Methods --

  * ``` loadDataFromPackageFile() : Promise ``` used in PluginsManager
  * ``` load([mixed data]) : Promise ``` fired on "load", "update" or "install" plugin event
  * ``` unload([mixed data]) : Promise ``` fired on "update" or "uninstall" plugin event
  * ``` install([mixed data]) : Promise ``` fired on "install" plugin event
  * ``` update([mixed data]) : Promise ``` fired on "update" plugin event
  * ``` uninstall([mixed data]) : Promise ``` fired on "uninstall" plugin event

### PluginsManager (extends [asynchronous-eventemitter](https://www.npmjs.com/package/asynchronous-eventemitter))

  -- Attributes -- 

  * ``` string directory ``` plugins' directory path
  * ``` array plugins ``` plugins' data
  * ``` static AbstractPlugin plugin ``` abstract class for plugin creation

  -- Constructor --

  * ``` constructor([string directory = "<PluginsManager>/plugins"]) ```

  -- Methods --

  * ``` setOrder(array pluginsDirectoriesBaseNames) : this ``` create a forced order to synchronously load plugins. not ordered plugins are asynchronously loaded after.
  
  * ``` getPluginsNames() : array ``` return plugins' names
  * ``` beforeLoadAll(function callback) : Promise ``` add a function executed before loading all plugins ("callback" must return a Promise instance)

  * ``` loadAll([mixed data]) : Promise ``` load all plugins asynchronously, using "data" in arguments for "load" plugin's method
  * ``` loadByDirectory(string directory [, mixed data ]) : array ``` load a plugin by its directory, using "data" in arguments for "load" plugin's method

  * ``` unload(object plugin [, mixed data]) : Promise ``` unload a plugin, using "data" in arguments for "unload" plugin's method
  * ``` unloadByDirectory(string directory [, mixed data]) : Promise ``` unload a plugin by its directory, using "data" in arguments for "unload" plugin's method
  * ``` updateByKey(string directory [, mixed data]) : Promise ``` unload a plugin by its key (in "plugins" placement), using "data" in arguments for "unload" plugin's method
  * ``` unloadAll([mixed data]) : Promise ``` unload all plugins, using "data" in arguments for "unload" plugin's method

  * ``` installViaGithub(string url [, mixed data]) : Promise ``` install a plugin via github, using "data" in arguments for "install" and "load" plugin's methods

  * ``` update(object plugin [, mixed data]) : Promise ``` update a plugin, using "data" in arguments for "unload", "update" and "load" plugin's methods
  * ``` updateByDirectory(string directory [, mixed data]) : Promise ``` update a plugin by its directory, using "data" in arguments for "unload", "update" and "load" plugin's methods
  * ``` updateByKey(integer key, [mixed data]) : Promise ``` update a plugin by its key (in "plugins" placement), using "data" in arguments for "unload", "update" and "load" plugin's method

  * ``` uninstall(object plugin [, mixed data]) : Promise ``` uninstall a plugin, using "data" in arguments for "unload" and "uninstall" plugin's methods
  * ``` uninstallByDirectory(string directory [, mixed data]) : Promise ``` uninstall a plugin by its directory, using "data" in arguments for "unload" and "uninstall" plugin's methods
  * ``` uninstallByKey(integer key, [mixed data]) : Promise ``` uninstall a plugin by its key (in "plugins" placement), using "data" in arguments for "unload" and "uninstall" plugin's methods

  -- Events --

  * ``` on("error", (string err) => {}) : this ``` fires if an error occurs

  * ``` on("loaded", (AbstractPlugin plugin) => {}) : this ``` fires if a plugin is loaded
  * ``` on("allloaded", () => {}) : this ``` fires if all the plugins are loaded
  
  * ``` on("unloaded", (AbstractPlugin plugin) => {}) : this ``` fires if a plugin is unloaded
  * ``` on("allunloaded", (AbstractPlugin plugin) => {}) : this ``` fires if all the plugins are unloaded

  * ``` on("installed", (AbstractPlugin plugin) => {}) : this ``` fires if a plugin is installed
  * ``` on("updated", (AbstractPlugin plugin) => {}) : this ``` fires if a plugin is updated
  * ``` on("uninstalled", (AbstractPlugin plugin) => {}) : this ``` fires if a plugin is uninstalled

## Examples

### Create your plugin with "plugin" extend and add a package.json file to the plugin's directory

 * package.json sample

```js
{
  "authors": [ "Sébastien VIDAL" ],
  "dependencies": {
    "simpletts": "^1.3.0"
  },
  "designs": [ "design.css"],
  "description": "A test for simpleplugin",
  "javascripts": [ "javascript.js"],
  "license": "ISC",
  "main": "main.js",
  "name": "MyPlugin",
  "version": "0.0.2",
  "templates": [ "template.html" ]
}
```

 * main.js sample

```js
"use strict";

class MyPlugin extends require('node-pluginsmanager').plugin {

  // load

    // 'data' is optionnal, null if not sended by the manager
    load (data) {

      return super.load().then(() => {

        // your working place
        // used on install & update, create ressources like array, sockets, etc...

        return Promise.resolve();

      });

    }

    // 'data' is optionnal, null if not sended by the manager
    unload (data) {

      return super.unload().then(() => {

        // your working place
        // used on delete & update, close & remove ressources like array, sockets, etc...

        return Promise.resolve();

      });

    }

  // write

    // 'data' is optionnal, null if not sended by the manager
    install (data) {

      return super.install().then(() => {

        // your working place
        // on the first use, create ressources like directories, files, etc...

        return Promise.resolve();

      });

    }

    // 'data' is optionnal, null if not sended by the manager
    update (data) {

      return super.update().then(() => {

        // your working place
        // update your ressources like sql database, etc...

        return Promise.resolve();

      });

    }

    // 'data' is optionnal, null if not sended by the manager
    uninstall (data) {

      return super.uninstall().then(() => {

        // your working place
        // remove all the created ressources like directories, files, etc...

        return Promise.resolve();

      });

    }

}
```

### Use PluginsManager

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
