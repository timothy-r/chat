"use strict";

/**
 * Create and start the http server
 */
var http = require('http'),
    logger = require('./lib/logger');

var server = http.createServer(function(request, response) {});

exports.start = function(port) {
    server.listen(port, function() {
        logger.log('Listening on port ' + port);
    });
}

exports.server = server;
