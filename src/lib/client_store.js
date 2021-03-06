'use strict';

var Colour = require('./colour'),
    MD5 = require('MD5'),
    _ = require('underscore'),
    clients = {};

/**
 * Module to access Client objects
 */

/**
 * Generate a new Client object with this connection
 * set a colour & and id field
 * name field is null
 */
exports.create = function(connection) {
    // @todo write a client class
    var client = {
        name: null,
        send: function(type, obj) {
            connection.sendUTF(
                JSON.stringify({ type: type, data: obj })
            );
        }
    };

    Object.defineProperty(client, 'colour', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: Colour.get()
    });

    Object.defineProperty(client, 'id', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: MD5(Math.random())
    });

    Object.defineProperty(client, 'connection', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: connection
    });
    
    clients[client.id] = client;
    return client;
}

/**
 * Return a Client in the store with this name
 * change to getByName and implement get to accept an id string
 */
exports.get = function(name) {
    // iterate over clients looking for one with this name
    var client_objects = _.values(clients);
    for (var u in client_objects) {
        if (client_objects[u].name == name) {
            return client_objects[u];
        }
    }
}

/**
 * Update store of Clients
 * overwrite any already there
 */
exports.update = function(client) {
    clients[client.id] = client;
}

/**
 * Empty the store
 */
exports.clear = function() {
    clients = {};
}
