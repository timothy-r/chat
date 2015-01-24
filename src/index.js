"use strict";

var Channel = require('./lib/channel');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'pub-sub.server';

// Port where we'll run the websocket server - configure via an env var
var socket_port = 1337;

// websocket and http servers
var SocketServer = require('websocket').server;
var http = require('http');

// list of currently connected clients (users)
var channel = new Channel('lobby');

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet' ];

colors.sort(function(a,b) { return Math.random() > 0.5; } );

var web_server = http.createServer(function(request, response) {
    // ignore requests 
});

web_server.listen(socket_port, function() {
    console.log((new Date()) + " Server is listening on port " + socket_port);
});

var socker_server = new SocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: web_server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
socker_server.on('request', function(request) {
    // @todo add a log helper function to prepend date to all log messages
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var subscriber_id = channel.subscribe(connection);
    var userName = userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    channel.send(subscriber_id, 'history');

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                userColor = colors.shift();
                channel.send(subscriber_id, 'color', userColor);

                console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.');
            }

            console.log((new Date()) + ' Received Message from '
                + userName + ': ' + message.utf8Data);
                
            var obj = {
                time: (new Date()).getTime(),
                text: htmlEntities(message.utf8Data),
                author: userName,
                color: userColor
            };

            channel.broadcast('message', obj);
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            channel.remove(subscriber_id);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });
});
