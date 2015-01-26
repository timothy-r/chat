"use strict";

var Config = require('./config'),
    Channels = require('./lib/channels'),
    web = require("./web"),
    socket = require("./socket"),
    logger = require("./lib/logger");

// connect clients to the 'current' channel before they pick a room
for (var c in Config.channels.all) {
    Channels.add(Config.channels.all[c]);
}

// This name is shown in 'ps' or 'top' command
process.title = Config.process.title;

// Port where we'll run the websocket server - configure via an env var
var port = Config.port;

socket.connect(web.server, Config.channels.current);

web.start(port);

logger.log('info', 'Starting server on port ' + port);

