"use strict";

var SocketServer = require('websocket').server,
    http = require('http'),
    Channel = require('./lib/channel');

// connect clients to the lobby before they pick a room
var current = 'lobby';

/**
 * Implement a room container?
 */
var channels = {
    'lobby' : new Channel(current)
};

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'pub-sub.server';

// Port where we'll run the websocket server - configure via an env var
var socket_port = 1337;

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function logMessage(msg) {
    console.log((new Date()) + ' ' + msg);
}

function createMessage(body, author, colour) {
  return {
    time: (new Date()).getTime(),
    text: htmlEntities(body),
    author: author,
    color: colour
  };
}


// Array with some colors
var colors = [ 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet' ];

colors.sort(function(a,b) { return Math.random() > 0.5; } );

var web_server = http.createServer(function(request, response) {
    // ignore requests
});

web_server.listen(socket_port, function() {
    logMessage('Server is listening on port ' + socket_port);
});

var socket_server = new SocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: web_server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
socket_server.on('request', function(request) {

    logMessage('Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin);
    // we need to know client id to remove them on 'close' event
    var subscriber_id = channels[current].subscribe(connection);
    var userName = false, userColor = false;

    // send back chat history - only do this when entering a different room
    channels[current].send(subscriber_id, 'history');

    // user sent some message
    connection.on('message', function(message) {

        var payload = JSON.parse(message.utf8Data);

        if (message.type === 'utf8') { // accept only text
            // test payload.action
            // may be post-message, set-name, enter-room, list-rooms, add-room
            switch (payload.action) {
                case 'set-name':
                    userName = htmlEntities(payload.body);
                    // get random color and send it back to the user
                    userColor = colors.shift();
                    channels[current].send(subscriber_id, 'color', userColor);
                    logMessage('User is known as: ' + userName + ' with ' + userColor + ' color.');

                    var obj = createMessage('User ' + userName + ' connected', userName, userColor);
                    channels[current].broadcast('message', obj);
                    break;

                case 'post-message':
                    logMessage('Received Message from ' + userName + ': ' + JSON.stringify(payload));

                    var obj = createMessage(payload.body, userName, userColor);

                    // get room name from payload? we have it here to in the connection
                    channels[current].broadcast('message', obj);
                    break;
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            logMessage('Peer ' + connection.remoteAddress + ' disconnected.');
            // remove user from the list of connected clients
            channels[current].remove(subscriber_id);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });
});
