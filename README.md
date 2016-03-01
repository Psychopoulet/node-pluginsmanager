# simplepluginsmanager
A plugins manager's object, using SimplePlugin

## Installation

```bash
$ npm install simplepluginsmanager
```

## Features

  * simply manage plugins (on SimplePlugin model)
  * add plugins manually or via github & load them
  * remove plugins and free there ressources

## Create your plugin with SimplePlugin

```js
"use strict";

class MyPlugin extends require('simplepluginsmanager').SimplePlugin {

    constructor () {

        super(); // must be called

        this.directory = __dirname; // must be used
        this.loadDataFromPackageFile(); // must be used, used to parse your 'package.json' file

        /* package.json (must be created in the plugin's main directory)

            "github" => optional, used for updates

            {
              "name": "MyPlugin",
              "version": "0.0.1",
              "description": "My own plugin",
              "main": "MyPlugin.js",
              "author": "Psychopoulet",
              "license": "ISC",
              "github" : "https://github.com/<account>/<plugin>",
              "widget": "widget.html",
              "templates" : [ "template.html" ],
              "javascripts" :[ "javascript.js"]
            }

        */

    }

    // 'data' is optionnal, null if not sended by the manager
    run (data) {
        console.log('run'); // your working place
    }


    /* this method is optional */

    // 'data' is optionnal, null if not sended by the manager
    // 'isADelete' == true if is called by a 'remove' method of the manager
    free (data, isADelete) {

        super.free(); // must be called

        console.log('free'); // used on delete plugin, free ressources like objects, created files, etc...

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
        console.log(msg);
    })
    .on('add', function(plugin) {
        console.log("--- [event/add] '" + plugin.name + "' (v" + plugin.version + ") added ---");
    })
    .on('update', function(plugin) {
        console.log("--- [event/update] '" + plugin.name + "' (v" + plugin.version + ") updated ---");
    })
    .on('remove', function(pluginName) {
        console.log("--- [event/remove] '" + pluginName + "' removed ---");
    })
    .on('load', function(plugin) {
        console.log("--- [event/load] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
    })

.loadAll(<optional data to pass to the 'run' plugins methods>).then(function() {

    console.log('all plugins loaded');
    console.log(oPluginsManager.getPluginsNames());

    oPluginsManager.addByGithub(
        'https://github.com/<account>/<plugin>',
        <optional data to pass to the 'run' plugins methods>
    ).then(function(plugin) {
        console.log(plugin.name + ' added & loaded');
    }).catch(function(err) {
        console.log(err);
    });

    oPluginsManager.updateByDirectory( // use "github"'s plugin data if exists
        path.join(oPluginsManager.directory, <plugin>),
        <optional data to pass to the 'run' && 'free' plugins methods>
    ).then(function(plugin) {
        console.log(plugin.name + ' updated & loaded');
    }).catch(function(err) {
        console.log(err);
    });

    oPluginsManager.removeByDirectory(
        path.join(oPluginsManager.directory, <plugin>),
        <optional data to pass to the 'free' plugins methods>
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
