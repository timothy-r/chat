"use strict";

var SocketServer = require('websocket').server,
    http = require('http'),
    Channels = require('./lib/channels'),
    ClientStore = require('./lib/client_store'),
    Message = require('./lib/message'),
    Config = require('./config');

// connect clients to the 'current' channel before they pick a room
for (var c in Config.channels.all) {
    Channels.add(Config.channels.all[c]);
}

// This name is shown in 'ps' or 'top' command
process.title = Config.process.title;

// Port where we'll run the websocket server - configure via an env var
var socket_port = Config.port;

function logMessage(msg) {
    console.log((new Date()) + ' ' + msg);
}

var web_server = http.createServer(function(request, response) {});

web_server.listen(socket_port, function() {
    logMessage('Server is listening on port ' + socket_port);
});

var socket_server = new SocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: web_server
});

// Called on connecting to web socket server
socket_server.on('request', function(request) {
    
    // get the channel id for the current configured channel
    var current = Channels.getByName(Config.channels.current).id;
    logMessage('current = ' + current);

    logMessage('Connection from origin ' + request.origin + ' current = ' + current );

    var connection = request.accept(null, request.origin);
    var client = ClientStore.create(connection);
    Channels.get(current).subscribe(client);

    // send chat history - only do this when entering a different room, not lobby?
    Channels.get(current).send(client, 'history');

    // client sent some message
    connection.on('message', function(message) {
        var payload = JSON.parse(message.utf8Data);

        if (message.type === 'utf8') { // accept only text
            // test payload.action
            // may be post-message, set-name (ie log in), subcribe, list-channels, add-channel
            switch (payload.action) {
                case 'set-name':
                    // log in
                    client.name = payload.body;
                    // get a colour and send it to the client
                    Channels.get(current).send(client, 'colour', client.colour);
                    logMessage('Client logged in : ' + client.name + ' with ' + client.colour + ' colour.');

                    var obj = Message.create('Client ' + client.name + ' connected', client);
                    Channels.get(current).broadcast('message', obj);

                    var obj = Message.create(Channels.list(), client);
                    // send the room list to the client
                    Channels.get(current).send(client, 'channel-list', obj);
                    break;

                case 'post-message':
                    logMessage('Received Message from ' + client.name + ': ' + JSON.stringify(payload));

                    var obj = Message.create(payload.body, client);

                    // get room name from payload? we have it here in the connection as well
                    // clients should be able to post to any named channel
                    Channels.get(current).broadcast('message', obj);
                    break;
                case 'list-channels':
                    var obj = Message.create(Channels.list(), client);
                    // only send to subscriber that made the request
                    // channel-list doesn't really go to a channel, but rather a client
                    Channels.get(current).send(client, 'channel-list', obj);
                    break;
                case 'subscribe':
                    logMessage('Subscribe ' + client.name + ' to room ' + payload.body);
                    var conn = Channels.get(current).remove(client);
                    current = payload.body;
                    Channels.get(current).subscribe(client, conn);
                    Channels.get(current).send(client, 'history');
                    break;
            }
        }
    });

    // client disconnected
    connection.on('close', function(connection) {
        if (client) {
            logMessage('Client ' + client.name + ' disconnected.');
            // remove client from the list of connected clients - it could be subscribed to multiple channels
            Channels.get(current).remove(client);
        }
    });
});
