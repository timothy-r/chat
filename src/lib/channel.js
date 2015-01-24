"use strict";

var MD5 = require('MD5');

/**
 * Encapsulates a channel which can be subscribed to
 */
function Channel(name) {

    Object.defineProperty(this, 'name', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: name 
    });

    this._subscribers = {};
}

/**
 * Add a subscriber, return its identifier
 */
Channel.prototype.subscribe = function(subscriber) {
    var id = MD5(Math.random());
    this._subscribers[id] = subscriber;
    return id;
};

/**
 * Remove the subscriber with this id, return the subscriber object
 */
Channel.prototype.remove = function(id) {
    var sub = this._subscribers[id];
    delete this._subscribers[id];
    return sub;
};

/**
 * Send a json object to all subscribers
 */
Channel.prototype.broadcast = function(message) {
    var json = JSON.stringify({ type:'message', data: message });
    for (var s in this._subscribers) {
         this._subscribers[s].sendUTF(json);
    }
};

module.exports = Channel;
