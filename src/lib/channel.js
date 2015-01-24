"use strict";

var MD5 = require('MD5');

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
    
    // confirm that history param is an array
    this.history = history || [];

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
Channel.prototype.broadcast = function(type, obj) {
    var json = JSON.stringify({ type: type, data: obj });
    // store the broadcast object in history
    this.history.push(obj);
    for (var s in this._subscribers) {
         this._subscribers[s].sendUTF(json);
    }
};

/**
 * Send obj to subscriber identified by id value
 */
Channel.prototype.send = function(subscriber_id, type, obj) {
    var subscriber = this._subscribers[subscriber_id];
    if (subscriber) {
        if ('history' == type) {
            obj = this.history;
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
