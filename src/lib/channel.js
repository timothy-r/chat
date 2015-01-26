"use strict";

var MD5 = require('MD5'),
    _ = require('underscore');

/**
 * Encapsulates a channel which can be subscribed to
 */
function Channel(name, history) {

    Object.defineProperty(this, 'name', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: name 
    });

    Object.defineProperty(this, 'id', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: MD5(Math.random())
    });
    
    // confirm that history param is an array
    this._history = _.isArray(history) ? history : [];

    this._subscribers = {};
}

/**
 * Add a subscriber, return its identifier
 */
Channel.prototype.subscribe = function(client) {
    this._subscribers[client.id] = client;
    return client.id;
};

/**
 * Remove the client with this id, return the client object
 */
Channel.prototype.remove = function(client) {
    if (_.has(this._subscribers, client.id)){
        delete this._subscribers[client.id];
        return true;
    } else {
        return false;
    }
};

/**
 * Send a json object to all subscribed clients
 */
Channel.prototype.broadcast = function(type, obj) {
    var json = JSON.stringify(
        { type: type, data: obj }
    );

    // store the broadcast object in history, store type too?
    this._history.push(obj);

    for (var c in this._subscribers) {
         this._subscribers[c].connection.sendUTF(json);
    }
};

/**
 * Send obj to client identified by id value
 */
Channel.prototype.send = function(client, type, obj) {
    var c = this._subscribers[client.id];

    if (c) {
        if ('history' == type) {
            obj = this._history;
            // check history contains at least one item
        }
        client.connection.sendUTF(
            JSON.stringify({ type: type, data: obj })
        );
        return true;
    }
    return false;
};

module.exports = Channel;
