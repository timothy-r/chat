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
}

module.exports = Channel;
