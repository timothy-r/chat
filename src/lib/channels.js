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
    channels[name] = new Channel(name, history);
    return channels[name];
}

/**
 * Return a single Channel
 */
exports.get = function(name) {
    return channels[name];
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
exports.remove = function(name) {
    var channel = channels[name];
    delete channels[name];
    return channel;
}

/**
 * clear all Channels
 */
exports.clear = function() {
    channels = [];
}
