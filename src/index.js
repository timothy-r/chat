"use strict";

var SocketServer = require('websocket').server,
    http = require('http'),
    Channels = require('./lib/channels'),
    UserStore = require('./lib/user_store'),
    Message = require('./lib/message');

// connect clients to the lobby before they pick a room
// configure default set of rooms, lobby is where interactive clients can enter
var current = 'lobby';
Channels.add(current);

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'pub-sub.server';

// Port where we'll run the websocket server - configure via an env var
var socket_port = 1337;

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

    logMessage('Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin);
    var user = UserStore.create();
    Channels.get(current).subscribe(user, connection);

    // send chat history - only do this when entering a different room, not lobby?
    Channels.get(current).send(user, 'history');

    // user sent some message
    connection.on('message', function(message) {
        var payload = JSON.parse(message.utf8Data);

        if (message.type === 'utf8') { // accept only text
            // test payload.action
            // may be post-message, set-name (ie log in), subcribe, list-channels, add-channel
            switch (payload.action) {
                case 'set-name':
                    // log in
                    user.name = payload.body;
                    // get a color and send it to the client
                    Channels.get(current).send(user, 'color', user.colour);
                    logMessage('User is known as: ' + user.name + ' with ' + user.colour + ' color.');

                    var obj = Message.create('User ' + user.name + ' connected', user);
                    Channels.get(current).broadcast('message', obj);

                    var obj = Message.create(Channels.list(), user);
                    // send the room list to the client
                    Channels.get(current).send(user, 'channel-list', obj);
                    break;

                case 'post-message':
                    logMessage('Received Message from ' + user.name + ': ' + JSON.stringify(payload));

                    var obj = Message.create(payload.body, user);

                    // get room name from payload? we have it here in the connection as well
                    Channels.get(current).broadcast('message', obj);
                    break;
                case 'list-channels':
                    var obj = Message.create(Channels.list(), user);
                    // only send to subscriber that made the request
                    Channels.get(current).send(user, 'channel-list', obj);
                    break;
            }
        }
    });

    // client disconnected
    connection.on('close', function(connection) {
        if (user.name !== false && user.colour !== false) {
            logMessage('Peer ' + connection.remoteAddress + ' disconnected.');
            // remove user from the list of connected clients
            Channels.get(current).remove(user);
        }
    });
});
