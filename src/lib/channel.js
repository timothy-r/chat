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

    this.subscribers = {};
}

/**
 * Add a subscriber return its identifier
 */
Channel.prototype.subscribe = function(subscriber) {
    var id = MD5(Math.random());
    this.subscribers[id] = subscriber;
    return id;
};

Channel.prototype.broadcast = function(message) {

};

module.exports = Channel;
