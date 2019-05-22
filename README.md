# node-pluginsmanager
A plugins manager

[![Build status](https://api.travis-ci.org/Psychopoulet/node-pluginsmanager.svg?branch=master)](https://travis-ci.org/Psychopoulet/node-pluginsmanager)
[![Coverage status](https://coveralls.io/repos/github/Psychopoulet/node-pluginsmanager/badge.svg?branch=master)](https://coveralls.io/github/Psychopoulet/node-pluginsmanager)
[![Dependency status](https://david-dm.org/Psychopoulet/node-pluginsmanager/status.svg)](https://david-dm.org/Psychopoulet/node-pluginsmanager)
[![Dev dependency status](https://david-dm.org/Psychopoulet/node-pluginsmanager/dev-status.svg)](https://david-dm.org/Psychopoulet/node-pluginsmanager?type=dev)
[![Issues](https://img.shields.io/github/issues/Psychopoulet/node-pluginsmanager.svg)](https://github.com/Psychopoulet/node-pluginsmanager/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/Psychopoulet/node-pluginsmanager.svg)](https://github.com/Psychopoulet/node-pluginsmanager/pulls)

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

### Plugin ([node-pluginsmanager-plugin](https://www.npmjs.com/package/node-pluginsmanager-plugin))

### PluginsManager (extends "events")

  -- Attributes -- 

  * ``` directory: string ``` plugins' directory path
  * ``` array plugins: Array<Plugin> ``` plugins' data

  * ``` static plugin: AbstractPlugin ``` abstract class for plugin creation

  -- Constructor --

  * ``` constructor([string directory = "<PluginsManager>/plugins"]) ```

  -- Methods --

  * ``` setOrder(pluginsDirectoriesBaseNames: Array<string>): Promise<void> ``` create a forced order to synchronously load plugins. not ordered plugins are asynchronously loaded after.
  * ``` getPluginsNames(): Array<string> ``` return plugins' names

  * ``` beforeLoadAll(callback: () => Promise<any>): Promise<void> ``` add a function executed before loading all plugins ("callback" must return a Promise instance)
  * ``` loadAll(data?: any): Promise<void> ``` load all plugins asynchronously, using "data" in arguments for "load" plugin's method
  * ``` loadAll(data?: any): Promise<Plugin> ``` load a plugin by its directory, using "data" in arguments for "load" plugin's method

  * ``` unload(plugin: Plugin, data?: any): Promise<void> ``` unload a plugin, using "data" in arguments for "unload" plugin's method
  * ``` unloadByDirectory(directory: string, data?: any): Promise<void> ``` unload a plugin by its directory, using "data" in arguments for "unload" plugin's method
  * ``` unloadByKey(directory: string, data?: any): Promise<void> ``` unload a plugin by its key (in "plugins" placement), using "data" in arguments for "unload" plugin's method
  * ``` unloadAll(data?: any): Promise<void> ``` unload all plugins, using "data" in arguments for "unload" plugin's method

  * ``` installViaGithub(user: string, repo: string, data?: any): Promise<void> ``` install a plugin via github, using "data" in arguments for "install" and "load" plugin's methods

  * ``` update(plugin: Plugin, data?: any): Promise<void> ``` update a plugin, using "data" in arguments for "unload", "update" and "load" plugin's methods
  * ``` updateByDirectory(directory: string, data?: any): Promise<void> ``` update a plugin by its directory, using "data" in arguments for "unload", "update" and "load" plugin's methods
  * ``` updateByKey(url: string, data?: any): Promise<void> ``` update a plugin by its key (in "plugins" placement), using "data" in arguments for "unload", "update" and "load" plugin's method

  * ``` uninstall(plugin: Plugin, data?: any): Promise<string> ``` uninstall a plugin, using "data" in arguments for "unload" and "uninstall" plugin's methods
  * ``` uninstallByDirectory(directory: string, data?: any): Promise<string> ``` uninstall a plugin by its directory, using "data" in arguments for "unload" and "uninstall" plugin's methods
  * ``` uninstallByKey(url: string, data?: any): Promise<string> ``` uninstall a plugin by its key (in "plugins" placement), using "data" in arguments for "unload" and "uninstall" plugin's methods

  -- Events --

  * ``` on("error", (err: Error) => void) : this ``` fires if an error occurs

  * ``` on("loaded", (plugin: AbstractPlugin) => void) : this ``` fires if a plugin is loaded
  * ``` on("allloaded", () => void) : this ``` fires if all the plugins are loaded
  
  * ``` on("unloaded", (plugin: AbstractPlugin) => void) : this ``` fires if a plugin is unloaded
  * ``` on("allunloaded", (plugin: AbstractPlugin) => void) : this ``` fires if all the plugins are unloaded

  * ``` on("installed", (plugin: AbstractPlugin) => void) : this ``` fires if a plugin is installed
  * ``` on("updated", (plugin: AbstractPlugin) => void) : this ``` fires if a plugin is updated
  * ``` on("uninstalled", (plugin: AbstractPlugin) => void) : this ``` fires if a plugin is uninstalled

## Examples

### Use PluginsManager

```javascript
"use strict";

const { join } = require('path');
const PluginManager = require('node-pluginsmanager');

const manager = new PluginManager(join(__dirname, 'plugins')); // param optional : automatically setted to this value if not given...
manager.directory = join(__dirname, 'plugins'); // ... or changed like this

manager

  .on('error', (msg) => {
      console.log("--- [event/error] '" + msg.error + "' ---");
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
  console.log(manager.getPluginsNames());

  manager.installViaGithub(
    <account>,
    <plugin>,
    <optional data to pass to the 'install' && 'load' plugins methods>
  ).then((plugin) => {
    console.log(plugin.name + ' installed & loaded');
  }).catch((err) => {
    console.log(err);
  });

  manager.update( // use "github"'s plugin data if exists
    <plugin>,
    <optional data to pass to the 'unload', 'update', && 'load' plugins methods>
  ).then((plugin) => {
    console.log(plugin.name + ' updated & loaded');
  }).catch((err) => {
    console.log(err);
  });

  // works also with updateByDirectory(<pluginDirectory>, <optional data>)

  manager.uninstall(
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

### Typescript

```typescript
"use strict";

import PluginManager = require('node-pluginsmanager');

const manager = new PluginManager();
// then, use it like before
```

## Tests

```bash
$ npm run-script tests
```

## License

  [ISC](LICENSE)
