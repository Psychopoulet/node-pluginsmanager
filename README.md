# node-pluginsmanager
A plugins manager

[![Build status](https://api.travis-ci.org/Psychopoulet/node-pluginsmanager.svg?branch=master)](https://travis-ci.org/Psychopoulet/node-pluginsmanager)
[![Coverage status](https://coveralls.io/repos/github/Psychopoulet/node-pluginsmanager/badge.svg?branch=master)](https://coveralls.io/github/Psychopoulet/node-pluginsmanager)
[![Dependency status](https://david-dm.org/Psychopoulet/node-pluginsmanager/status.svg)](https://david-dm.org/Psychopoulet/node-pluginsmanager)
[![Dev dependency status](https://david-dm.org/Psychopoulet/node-pluginsmanager/dev-status.svg)](https://david-dm.org/Psychopoulet/node-pluginsmanager?type=dev)
[![Issues](https://img.shields.io/github/issues/Psychopoulet/node-pluginsmanager.svg)](https://github.com/Psychopoulet/node-pluginsmanager/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/Psychopoulet/node-pluginsmanager.svg)](https://github.com/Psychopoulet/node-pluginsmanager/pulls)

> please note that this version is only usable with node-pluginsmanager-plugin 4.x.x

## Installation

```bash
$ npm install node-pluginsmanager
```

## Features

  * simply manage plugins (extended from [node-pluginsmanager-plugin](https://github.com/Psychopoulet/node-pluginsmanager-plugin)) to interact with specifics hardwares / API / whatever
  * install plugins manually or via github & initialize them
  * update plugins via github
  * uninstall plugins and release there resources
  * run plugins' middlewares for server, to create specifics rules
  * check plugins' modules' versions

## Architecture

### Plugin

![Plugin](https://raw.githubusercontent.com/Psychopoulet/node-pluginsmanager-plugin/master/documentation/pictures/functional.jpg)

### Routes

![Routes](./documentation/routes.jpg)

## Interfaces

```typescript
interface iPluginManagerOptions {
  "directory": string; // plugins location. default : join(homedir(), "node-pluginsmanager-plugins")
  "externalRessourcesDirectory": string; // external resources locations (sqlite, files, cache, etc...). default : join(homedir(), "node-pluginsmanager-resources")
}
```

## Classes

### PluginManagerOptions (extends "Object")

  > can set optionnal options for "events" constructor

  -- Attributes --

  * ``` directory: string ``` used to set PluginsManager directory value

### PluginsManager (extends "events")

  -- Attributes --

  * ``` directory: string ``` plugins' directory path (must be writable, you can use [homedir](https://nodejs.org/api/os.html#os_os_homedir) for create specific directory)
  * ``` externalRessourcesDirectory: string ``` external resources locations (sqlite, files, cache, etc...) (must be writable, you can use [homedir](https://nodejs.org/api/os.html#os_os_homedir) for create specific directory)
  * ``` Array plugins: Array<[Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser)> ``` plugins' orchestrators

  -- Constructor --

  * ``` constructor(options? : iPluginManagerOptions) ```

  -- Methods --

  > Please note that the "httpMiddleware" method was removed, you juste have to use "appMiddleware" with basic http request, and use "next" parameter as a callback to execute some stuff with the request if it is not managed by the plugins

  * ``` getPluginsNames(): Array<string> ``` return plugins' names
  * ``` setOrder(pluginsNames: Array<string>): Promise<void> ``` create a forced order to synchronously initialize plugins. not ordered plugins are asynchronously initialized after.

  * ``` checkAllModules(): Promise<void> ``` check all modules' versions for all plugins
  * ``` checkModules(plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser)): Promise<void> ``` check all modules' versions for a specific plugin

  * ``` appMiddleware(req: Request, res: Response, next: Function): void ``` used for execute all plugins' middlewares in app (express or other)
  * ``` socketMiddleware(server: WebSocketServer): void ``` middleware for socket to add bilateral push events

  * ``` beforeInitAll(callback: () => Promise<any>): Promise<void> ``` add a function executed before initializing all plugins
  * ``` initAll(data?: any): Promise<void> ``` initialize all plugins asynchronously, using "data" in arguments for "init" plugin's Orchestrator method

  * ``` releaseAll(data?: any): Promise<void> ``` release a plugin (keep package but destroy [Mediator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#mediator-extends-bootable) & [Server](https://github.com/Psychopoulet/node-pluginsmanager-plugin#server-extends-mediatoruser)), using "data" in arguments for "release" plugin's [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser) method
  * ``` destroyAll(data?: any): Promise<void> ``` after releasing, destroy packages data & free "plugins" list, using "data" in arguments for "destroy" plugin's [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser) method

  * ``` installViaGithub(user: string, repo: string, data?: any): Promise<void> ``` install a plugin via github repo, using "data" in arguments for "install" and "init" plugin's [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser) methods
  * ``` updateViaGithub(plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser), data?: any): Promise<void> ``` update a plugin via its github repo, using "data" in arguments for "release", "update" and "init" plugin's methods
  * ``` uninstall(plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser), data?: any): Promise<string> ``` uninstall a plugin, using "data" in arguments for "release" and "uninstall" plugin's methods

  -- Events --

  * ``` on("error", (err: Error) => void) : this ``` fires if an error occurs

  * ``` on("initialized", (plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser)) => void) : this ``` fires if a plugin is initialized
  * ``` on("allinitialized", () => void) : this ``` fires if all the plugins are initialized

  * ``` on("released", (pluginName: string) => void) : this ``` fires if a plugin is released
  * ``` on("allreleased", (plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser)) => void) : this ``` fires if all the plugins are released
  * ``` on("destroyed", (pluginName: string) => void) : this ``` fires if a plugin is destroyed
  * ``` on("alldestroyed", (plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser)) => void) : this ``` fires if all the plugins are destroyed

  * ``` on("installed", (plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser)) => void) : this ``` fires if a plugin is installed
  * ``` on("updated", (plugin: [Orchestrator](https://github.com/Psychopoulet/node-pluginsmanager-plugin#orchestrator-extends-mediatoruser)) => void) : this ``` fires if a plugin is updated
  * ``` on("uninstalled", (pluginName: string) => void) : this ``` fires if a plugin is uninstalled

## Examples

### Use PluginsManager

```javascript
"use strict";

const { join } = require("path");
const { homedir } = require("os");
const PluginManager = require("node-pluginsmanager");

const manager = new PluginManager({
  "directory": join(homedir(), "MySoftware", "plugins")
});

manager

  .on("error", (msg) => {
      console.log("--- [event/error] '" + msg.error + "' ---");
  })

  // init

    .on("initialized", (plugin) => {
      console.log("--- [event/initialized] '" + plugin.name + "' (v" + plugin.version + ") initialized ---");
    })
    .on("allinitialized", () => {
      console.log("--- [event/initialized] all plugins initialized ---");
    })

  // release

    .on("released", (pluginName) => {
      console.log("--- [event/released] '" + pluginName + " released ---");
    })
    .on("allreleased", () => {
      console.log("--- [event/released] all plugins released ---");
    })
    .on("destroyed", (pluginName) => {
      console.log("--- [event/destroyed] '" + pluginName + " destroyed ---");
    })
    .on("alldestroyed", () => {
      console.log("--- [event/destroyed] all plugins destroyed ---");
    })

  // write

    .on("installed", (plugin) => {
      console.log("--- [event/installed] '" + plugin.name + "' (v" + plugin.version + ") installed ---");
    })
    .on("updated", (plugin) => {
      console.log("--- [event/updated] '" + plugin.name + "' (v" + plugin.version + ") updated ---");
    })
    .on("uninstalled", (pluginName) => {
      console.log("--- [event/uninstalled] '" + pluginName + "' uninstalled ---");
    })

.beforeInitAll(() => { // optionnal
    return Promise.resolve();
})

.initAll(<optional data to pass to the 'init' plugins methods>).then(() => {

  console.log('all plugins initialized');
  console.log(manager.getPluginsNames());

  manager.installViaGithub(
    <account>,
    <plugin>,
    <optional data to pass to the 'install' && 'init' plugins methods>
  ).then((plugin) => {
    console.log(plugin.name + ' installed & initialized');
  }).catch((err) => {
    console.log(err);
  });

  manager.updateViaGithub( // use "github"'s plugin data if exists
    <plugin>,
    <optional data to pass to the 'release', 'update', && 'init' plugins methods>
  ).then((plugin) => {
    console.log(plugin.name + ' updated & initialized');
  }).catch((err) => {
    console.log(err);
  });

  manager.uninstall(
    <plugin>,
    <optional data to pass to the 'release' && 'uninstall' plugins methods>
  ).then((pluginName) => {
    console.log(pluginName + ' removed');
  }).catch((err) => {
    console.log(err);
  });

}).catch((err) => {
  console.log(err);
});
```

### Typescript

```typescript
"use strict";

import join from "path";
import homedir from "os";
import PluginManager = require('node-pluginsmanager');

const manager = new PluginManager({
  "directory": join(homedir(), "MySoftware", "plugins")
});
// then, use it like before
```

## Tests

```bash
$ git clone git://github.com/Psychopoulet/node-pluginsmanager.git
$ cd ./node-pluginsmanager
$ npm install
$ npm run-script tests
```

## License

  [ISC](LICENSE)
