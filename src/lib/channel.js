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
Channel.prototype.subscribe = function(client, subscriber) {
    this._subscribers[client.id] = subscriber;
    return client.id;
};

/**
 * Remove the subscriber with this id, return the subscriber object
 */
Channel.prototype.remove = function(client) {
    var sub = this._subscribers[client.id];
    delete this._subscribers[client.id];
    return sub;
};

/**
 * Send a json object to all subscribers
 */
Channel.prototype.broadcast = function(type, obj) {
    var json = JSON.stringify({ type: type, data: obj });
    // store the broadcast object in history
    this._history.push(obj);
    for (var s in this._subscribers) {
         this._subscribers[s].sendUTF(json);
    }
};

/**
 * Send obj to subscriber identified by id value
 */
Channel.prototype.send = function(client, type, obj) {
    var subscriber = this._subscribers[client.id];
    if (subscriber) {
        if ('history' == type) {
            obj = this._history;
            // check history contains at least one item
        }
        subscriber.sendUTF(
            JSON.stringify({ type: type, data: obj })
        );
        return true;
    }
    return false;
};

module.exports = Channel;
