"use strict";

var SocketServer = require('websocket').server,
    http = require('http'),
    Channels = require('./lib/channels'),
    Colour = require('./lib/colour');

// connect clients to the lobby before they pick a room
// configure default set of rooms, lobby is where interactive clients can enter
var current = 'lobby';
Channels.add(current);

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'pub-sub.server';

// Port where we'll run the websocket server - configure via an env var
var socket_port = 1337;

/*
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
*/

function logMessage(msg) {
    console.log((new Date()) + ' ' + msg);
}

function createMessage(body, author, colour) {
  return {
    time: (new Date()).getTime(),
    body: body,
    author: author,
    color: colour
  };
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
    // we need to know client id to remove them on 'close' event
    // should really tell the Channel the subscriber id
    var user = { name: false, colour: false, subscriber_id: Channels.get(current).subscribe(connection) };

    // send back chat history - only do this when entering a different room
    Channels.get(current).send(user.subscriber_id, 'history');

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
                    user.colour = Colour.get();
                    Channels.get(current).send(user.subscriber_id, 'color', user.colour);
                    logMessage('User is known as: ' + user.name + ' with ' + user.colour + ' color.');

                    var obj = createMessage('User ' + user.name + ' connected', user.name, user.colour);
                    Channels.get(current).broadcast('message', obj);

                    var obj = createMessage(Channels.list(), user.name, user.colour);
                    // send the room list to the client
                    Channels.get(current).send(user.subscriber_id, 'channel-list', obj);
                    break;

                case 'post-message':
                    logMessage('Received Message from ' + user.name + ': ' + JSON.stringify(payload));

                    var obj = createMessage(payload.body, user.name, user.colour);

                    // get room name from payload? we have it here in the connection as well
                    Channels.get(current).broadcast('message', obj);
                    break;
                case 'list-channels':
                    var obj = createMessage(Channels.list(), user.name, user.colour);
                    // only send to subscriber that made the request
                    Channels.get(current).send(user.subscriber_id, 'channel-list', obj);
                    break;
            }
        }
    });

    // client disconnected
    connection.on('close', function(connection) {
        if (user.name !== false && user.colour !== false) {
            logMessage('Peer ' + connection.remoteAddress + ' disconnected.');
            // remove user from the list of connected clients
            Channels.get(current).remove(user.subscriber_id);
        }
    });
});
