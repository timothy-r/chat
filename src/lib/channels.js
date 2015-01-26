'use strict';

var Channel = require('./channel'),
    _ = require('underscore');
/*
 * Channel container
 * add, list, get, remove
*/
var channels = {};

/**
 * Add a new Channel instance and return it
 */
exports.add = function(name, history) {
    var channel = new Channel(name, history);
    channels[channel.id] = channel;
    return channel;
}

/**
 * Return a single Channel by id
 */
exports.get = function(id) {
    return channels[id];
}

/**
 * List the names of Channels that can then be used to access them via get()
 */
exports.list = function() {
    return Object.keys(channels);
}

/**
 * Remove Channel with name from collection
 * return the removed Channel
 */
exports.remove = function(id) {
    var channel = channels[id];
    delete channels[id];
    return channel;
}

/**
 * clear all Channels
 */
exports.clear = function() {
    channels = [];
}
