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

exports.getByName = function(name) {

   return _.filter(
       _.values(channels), _.matches( {name: name} )
   )[0];
}

/**
 * List the ids and names of Channels that can then be used to access them via get()
 */
exports.list = function() {
    
    return _.map(_.values(channels), function(c) {
        return {id: c.id, name: c.name}; 
    });
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
