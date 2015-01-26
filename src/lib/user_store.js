'use strict';

var Colour = require('./colour'),
    MD5 = require('MD5'),
    _ = require('underscore'),
    users = {};

/**
 * Module to access User objects
 */

/**
 * Generate a new User object
 * set a colour & and id field
 * name field is null
 */
exports.create = function() {
    var user = {
        name: null
    };

    Object.defineProperty(user, 'colour', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: Colour.get()
    });

    Object.defineProperty(user, 'id', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: MD5(Math.random())
    });
    
    users[user.id] = user;
    return user;
}

/**
 * Return a User in the store with this name
 * change to getByName and implement get to accept an id string
 */
exports.get = function(name) {
    // iterate over users looking for one with this name
    var user_objects = _.values(users);
    for (var u in user_objects) {
        if (user_objects[u].name == name) {
            return user_objects[u];
        }
    }
}

/**
 * Update store of Users
 * overwrite any already there
 */
exports.update = function(user) {
    users[user.id] = user;
}

/**
 * Empty the store
 */
exports.clear = function() {
    users = {};
}
