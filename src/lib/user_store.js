'use strict';

var Colour = require('./colour'),
    MD5 = require('MD5');

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

    return user;
}

exports.get = function(name) {

}

/**
 * Update store of Users
 */
exports.update = function(user) {

}
