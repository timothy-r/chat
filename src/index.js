"use strict";

var SocketServer = require('websocket').server,
    http = require('http'),
    Channel = require('./lib/channel');

// connected 
// clients to the lobby before they pick a room
var current_room = 'lobby';

var rooms = {
    'lobby' : new Channel(current_room)
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
};

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

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var subscriber_id = rooms[current_room].subscribe(connection);
    var userName = false, userColor = false;

    logMessage('Connection accepted.');

    // send back chat history - only when entering a different room
    rooms[current_room].send(subscriber_id, 'history');

    // user sent some message
    connection.on('message', function(message) {
        var payload = JSON.parse(message.utf8Data);

        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(payload.body);
                // get random color and send it back to the user
                userColor = colors.shift();
                rooms[current_room].send(subscriber_id, 'color', userColor);
                logMessage('User is known as: ' + userName + ' with ' + userColor + ' color.');
            }

            logMessage('Received Message from ' + userName + ': ' + JSON.stringify(payload));

            // check json.room and json.action (changeRoom, message, addRoom, listRooms, etc)
            var obj = {
                time: (new Date()).getTime(),
                text: htmlEntities(payload.body),
                author: userName,
                color: userColor
            };

            // get room name from payload
            rooms[current_room].broadcast('message', obj);
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            logMessage('Peer ' + connection.remoteAddress + ' disconnected.');
            // remove user from the list of connected clients
            rooms[current_room].remove(subscriber_id);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });
});
