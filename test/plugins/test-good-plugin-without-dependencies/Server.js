
"use strict";

// deps

	// externals
	const { Server } = require("node-pluginsmanager-plugin");

// module

module.exports = class ServerGoodPluginWithoutDependencies extends Server {

	constructor (opt) {

		super(opt);

		this._socketServer = null;
		this._onConnection = null;

	}

	_releaseWorkSpace () {

		return this._socketServer ? Promise.resolve().then(() => {

			if ("function" === typeof this._onConnection) {

				this._socketServer.removeListener("connection", this._onConnection);
				this._onConnection = null;

			}

			this._socketServer = null;

		}) : Promise.resolve();

	}

	appMiddleware (req, res, next) {

		(0, console).log("ServerGoodPluginWithoutDependencies", "appMiddleware");

		super.appMiddleware(req, res, next);

	}

	socketMiddleware (server) {

		this._socketServer = server;
		this._onConnection = (socket) => {

			(0, console).log("server", "socket", "connection");

			socket.on("message", (payload) => {

				(0, console).log("server", "socket", "message", payload);

				const req = JSON.parse(payload);

				if (req.name && "ping" === req.name) {

					socket.send(JSON.stringify({
						"name": "pong",
						"params": [ "test" ]
					}));

				}

			}).on("close", () => {
				(0, console).log("server", "socket", "close");
			});

		};

		this._socketServer.on("connection", this._onConnection);

	}

};
