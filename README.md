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
  * uninstall plugins and free there ressources

## Create your plugin with SimplePlugin

```js
"use strict";

const SimplePluginsManager = require('simplepluginsmanager');

class MyPlugin extends SimplePluginsManager.SimplePlugin {

    // load

        // 'data' is optionnal, null if not sended by the manager
        load (data) {
            // your working place
        }

        // 'data' is optionnal, null if not sended by the manager
        unload (data) {
            super.unload(); // must be called
            // used on delete & update plugin, unload ressources like array, sockets, etc...
        }

    // write

        // 'data' is optionnal, null if not sended by the manager
        install (data) {
            // on the first use, create ressources like directories, files, etc...
        }

        // 'data' is optionnal, null if not sended by the manager
        update (data) {
            // update your ressources like sql database, etc...
        }

        // 'data' is optionnal, null if not sended by the manager
        uninstall (data) {
            // remove all the created ressources like directories, files, etc...
        }

}
```

## Examples

```js
"use strict";

const SimplePluginsManager = require('simplepluginsmanager'),
      path = require('path');

var oPluginsManager = new SimplePluginsManager(path.join(__dirname, 'plugins')); // param optional : automaticly set to this value if not given...
oPluginsManager.directory = path.join(__dirname, 'plugins'); // ... or changed like this

oPluginsManager

    .on('error', function(msg) {
        console.log("--- [event/error] '" + msg + "' ---");
    })

    // load

        .on('loaded', function(plugin) {
            console.log("--- [event/loaded] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
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

    oPluginsManager.remove(
        <plugin>,
        <optional data to pass to the 'unload' && 'uninstall' plugins methods>
    ).then(function(pluginName) {
        console.log(pluginName + ' removed');
    }).catch(function(err) {
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
